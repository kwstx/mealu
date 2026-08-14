import { pool } from '../db';
import { SpoonacularAdapter, NutritionInfo } from './spoonacular.adapter';

export interface RawIngredient {
  name: string;
  quantity: number;
  unit: string;
  optional_notes?: string;
}

export interface RawRecipe {
  title: string;
  prep_instructions: string;
  estimated_servings: number;
  ingredients: RawIngredient[];
  cuisine?: string;
  // Optional pre-calculated macros
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export class RecipeEtlService {
  private nutritionAdapter: SpoonacularAdapter;

  constructor() {
    this.nutritionAdapter = new SpoonacularAdapter();
  }

  /**
   * Main entry point for ingesting a recipe
   */
  async ingestRecipe(rawRecipe: RawRecipe): Promise<string> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Normalize Cuisine
      let cuisineId = null;
      if (rawRecipe.cuisine) {
        cuisineId = await this.normalizeCuisine(client, rawRecipe.cuisine);
      }

      // 2. Insert Base Recipe (we will update macros & tags later)
      const recipeRes = await client.query(
        `INSERT INTO recipes (title, prep_instructions, estimated_servings, cuisine_style_id) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [rawRecipe.title, rawRecipe.prep_instructions, rawRecipe.estimated_servings, cuisineId]
      );
      const recipeId = recipeRes.rows[0].id;

      let totalCalories = rawRecipe.calories || 0;
      let totalProtein = rawRecipe.protein || 0;
      let totalCarbs = rawRecipe.carbs || 0;
      let totalFat = rawRecipe.fat || 0;
      
      const missingMacros = !rawRecipe.calories && !rawRecipe.protein && !rawRecipe.carbs && !rawRecipe.fat;
      
      const allDietFlags = new Set<string>();
      let isFirstIngredient = true;

      // 3. Process Ingredients
      for (const rawIng of rawRecipe.ingredients) {
        // Normalize Ingredient
        const ingredientId = await this.normalizeIngredient(client, rawIng.name);
        
        // Fetch ingredient info (for diet flags)
        const ingInfoRes = await client.query(`SELECT diet_flags FROM ingredients WHERE id = $1`, [ingredientId]);
        const ingFlags: string[] = ingInfoRes.rows[0].diet_flags || [];
        
        // Intersect diet flags (Recipe is vegan only if ALL ingredients are vegan)
        if (isFirstIngredient) {
          ingFlags.forEach(f => allDietFlags.add(f));
          isFirstIngredient = false;
        } else {
          for (const flag of Array.from(allDietFlags)) {
            if (!ingFlags.includes(flag)) {
              allDietFlags.delete(flag);
            }
          }
        }

        // Calculate missing nutrition via Adapter if needed
        if (missingMacros) {
          const nutrition = await this.nutritionAdapter.estimateNutrition(rawIng.name, rawIng.quantity, rawIng.unit);
          totalCalories += nutrition.calories;
          totalProtein += nutrition.protein;
          totalCarbs += nutrition.carbs;
          totalFat += nutrition.fat;
        }

        // Link ingredient to recipe
        await client.query(
          `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, optional_notes) 
           VALUES ($1, $2, $3, $4, $5)`,
          [recipeId, ingredientId, rawIng.quantity, rawIng.unit, rawIng.optional_notes]
        );
      }

      // 4. Update Recipe with Final Macros and Tags
      const finalTags = Array.from(allDietFlags);
      await client.query(
        `UPDATE recipes 
         SET calories = $1, protein = $2, carbs = $3, fat = $4, diet_tags = $5
         WHERE id = $6`,
        [Math.round(totalCalories), Math.round(totalProtein), Math.round(totalCarbs), Math.round(totalFat), finalTags, recipeId]
      );

      await client.query('COMMIT');
      return recipeId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Normalizes a cuisine string. If it doesn't exist, inserts it.
   */
  private async normalizeCuisine(client: any, cuisineName: string): Promise<string> {
    const normalized = cuisineName.trim().toLowerCase();
    
    let res = await client.query(`SELECT id FROM cuisine_styles WHERE name ILIKE $1`, [normalized]);
    if (res.rows.length > 0) return res.rows[0].id;
    
    res = await client.query(`INSERT INTO cuisine_styles (name) VALUES ($1) RETURNING id`, [normalized]);
    return res.rows[0].id;
  }

  /**
   * Normalizes an ingredient name.
   * Uses pg_trgm for fuzzy matching. If no match above threshold, creates new.
   */
  private async normalizeIngredient(client: any, ingredientName: string): Promise<string> {
    const normalized = ingredientName.trim().toLowerCase();

    // Try exact match first
    let res = await client.query(`SELECT id FROM ingredients WHERE name ILIKE $1`, [normalized]);
    if (res.rows.length > 0) return res.rows[0].id;

    // Try fuzzy match using pg_trgm similarity (threshold 0.6)
    res = await client.query(
      `SELECT id, similarity(name, $1) as sml 
       FROM ingredients 
       WHERE name % $1 AND similarity(name, $1) > 0.6 
       ORDER BY sml DESC LIMIT 1`,
      [normalized]
    );

    if (res.rows.length > 0) return res.rows[0].id;

    // If no match, insert new ingredient
    // We can run a heuristic to guess default diet flags (e.g. 'chicken' -> not vegan/vegetarian)
    const dietFlags = this.guessDietFlags(normalized);
    
    res = await client.query(
      `INSERT INTO ingredients (name, diet_flags) VALUES ($1, $2) RETURNING id`,
      [normalized, dietFlags]
    );
    return res.rows[0].id;
  }

  /**
   * Naive heuristic to assign default diet flags to newly discovered ingredients.
   */
  private guessDietFlags(name: string): string[] {
    const flags = new Set(['gluten-free', 'dairy-free', 'vegan', 'vegetarian']);
    
    if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || name.includes('fish')) {
      flags.delete('vegan');
      flags.delete('vegetarian');
    }
    if (name.includes('cheese') || name.includes('milk') || name.includes('butter') || name.includes('cream')) {
      flags.delete('dairy-free');
      flags.delete('vegan');
    }
    if (name.includes('wheat') || name.includes('flour') || name.includes('bread') || name.includes('pasta')) {
      flags.delete('gluten-free');
    }
    
    return Array.from(flags);
  }
}
