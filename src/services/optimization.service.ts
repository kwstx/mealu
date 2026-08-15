import { spawn } from 'child_process';
import path from 'path';
import { query } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { PriceIngestionService } from './price-ingestion.service';

export interface OptimizationOptions {
  startDate: Date;
  endDate: Date;
  guaranteeStandardMeals?: boolean;
  slots?: string[]; // Custom slots like ["1_breakfast", "1_lunch"]
  budgetOverride?: number;
  priceLockWindowHours?: number;
  lockedSlots?: Record<string, string>;
  excludedRecipes?: string[];
}

export class OptimizationService {
  /**
   * Generates a meal plan using the Python ILP optimizer.
   */
  static async generateMealPlan(userId: string, options: OptimizationOptions) {
    // 1. Fetch User Settings
    const userResult = await query(
      'SELECT household_size, weekly_budget, preferred_store_id FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) throw new Error('User not found');
    const user = userResult.rows[0];

    const budget = options.budgetOverride ?? parseFloat(user.weekly_budget);
    const householdSize = user.household_size;
    const storeId = user.preferred_store_id;

    if (!storeId) throw new Error('User must have a preferred store to calculate prices');

    // 2. Determine Slots
    let slots = options.slots || [];
    if (options.guaranteeStandardMeals || slots.length === 0) {
      slots = [];
      for (let day = 1; day <= 7; day++) {
        slots.push(`${day}_breakfast`, `${day}_lunch`, `${day}_dinner`);
      }
    }

    // 3. Fetch Candidate Recipes (Join with user_recipe_scores if available)
    const recipesResult = await query(`
      SELECT 
        r.id, r.title, r.calories, r.protein, r.carbs, r.fat, r.diet_tags,
        COALESCE(urs.score, 5.0) as preference_score
      FROM recipes r
      LEFT JOIN user_recipe_scores urs ON r.id = urs.recipe_id AND urs.user_id = $1
      LIMIT 100 -- Limit candidate recipes to avoid solver overload
    `, [userId]);

    const candidateRecipes = recipesResult.rows;

    // Fetch Recipe Ingredients
    const recipeIds = candidateRecipes.map(r => r.id);
    const riResult = await query(`
      SELECT recipe_id, ingredient_id, quantity, unit
      FROM recipe_ingredients
      WHERE recipe_id = ANY($1)
    `, [recipeIds]);

    const recipeIngredientsMap = new Map<string, any[]>();
    for (const row of riResult.rows) {
      if (!recipeIngredientsMap.has(row.recipe_id)) {
        recipeIngredientsMap.set(row.recipe_id, []);
      }
      recipeIngredientsMap.get(row.recipe_id)?.push({
        ingredient_id: row.ingredient_id,
        quantity: parseFloat(row.quantity),
        unit: row.unit
      });
    }

    const formattedRecipes = candidateRecipes.map(r => ({
      id: r.id,
      preference_score: parseFloat(r.preference_score),
      nutrition: {
        calories: r.calories,
        protein: parseFloat(r.protein || '0'),
        carbs: parseFloat(r.carbs || '0'),
        fat: parseFloat(r.fat || '0')
      },
      ingredients: recipeIngredientsMap.get(r.id) || []
    }));

    // 4. Fetch Ingredient Prices & Package Sizes for Preferred Store
    const uniqueIngredientIds = new Set<string>();
    for (const riList of recipeIngredientsMap.values()) {
      for (const ri of riList) {
        uniqueIngredientIds.add(ri.ingredient_id);
      }
    }

    const priceLockHours = options.priceLockWindowHours || 24;
    const { prices: effectivePrices, averageConfidence } = await PriceIngestionService.getEffectivePrices(
      storeId,
      Array.from(uniqueIngredientIds),
      priceLockHours
    );

    const formattedIngredients = effectivePrices.map(price => ({
      id: price.ingredient_id,
      unit_price: price.unit_price,
      package_size: price.package_size,
      name: price.name
    }));

    // 5. Build Optimization Payload
    const payload = {
      budget,
      household_size: householdSize,
      slots,
      daily_nutrition_bounds: {
        // Example bounds, could be passed from options
        protein: { min: 50 } 
      },
      recipes: formattedRecipes,
      ingredients: formattedIngredients,
      locked_slots: options.lockedSlots || {},
      excluded_recipes: options.excludedRecipes || [],
      weight_score: 10.0,
      weight_waste: 0.1,
      weight_distinct: 1.0
    };

    // 6. Spawn Python Process
    const result = await new Promise<any>((resolve, reject) => {
      const scriptPath = path.join(__dirname, 'optimizer', 'meal_optimizer.py');
      const pyProcess = spawn('python', [scriptPath]);
      
      let outputData = '';
      let errorData = '';

      pyProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pyProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pyProcess.on('close', (code) => {
        if (code !== 0) {
          console.error("Python Error Output:", errorData);
          return reject(new Error(`Optimizer process exited with code ${code}`));
        }
        
        try {
          const jsonResult = JSON.parse(outputData);
          if (!jsonResult.success) {
            return reject(new Error(jsonResult.message || 'Optimization failed'));
          }
          resolve(jsonResult);
        } catch (err) {
          console.error("Failed to parse Python output:", outputData);
          reject(new Error('Failed to parse optimizer output'));
        }
      });

      pyProcess.stdin.write(JSON.stringify(payload));
      pyProcess.stdin.end();
    });

    // 7. Persist Results
    const mealPlanId = uuidv4();
    const optimizationMetadata = { 
      status: result.status, 
      generated_at: new Date(),
      explanation_trace: result.explanation_trace,
      price_confidence: averageConfidence
    };

    await query(`
      INSERT INTO meal_plans (id, user_id, start_date, end_date, estimated_total_cost, optimization_metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      mealPlanId, userId, options.startDate, options.endDate, result.total_cost, 
      JSON.stringify(optimizationMetadata)
    ]);

    // Insert selected recipes
    const selectedRecipeIds = new Set<string>(Object.values(result.selected_slots) as string[]);
    for (const rId of selectedRecipeIds) {
      await query(`
        INSERT INTO meal_plan_recipes (meal_plan_id, recipe_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [mealPlanId, rId]);
    }

    // Insert shopping list
    for (const item of result.shopping_list) {
      await query(`
        INSERT INTO meal_plan_shopping_list (meal_plan_id, ingredient_id, aggregated_quantity, unit)
        VALUES ($1, $2, $3, $4)
      `, [mealPlanId, item.ingredient_id, item.packages, 'packages']); // Note: unit would need normalization
    }

    return {
      mealPlanId,
      result
    };
  }
}
