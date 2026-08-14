import { pool } from '../db';

export class RecipeScoringService {
  /**
   * Calculates a compatibility score for a user and a recipe.
   * This score can be used as an objective-function coefficient in optimization.
   */
  async calculateRecipeScore(userId: string, recipeId: string): Promise<number> {
    // 1. Fetch user preferences
    const userResult = await pool.query(
      `SELECT diet_constraints FROM users WHERE id = $1`,
      [userId]
    );
    if (userResult.rows.length === 0) throw new Error('User not found');
    const user = userResult.rows[0];
    const dietConstraints: string[] = user.diet_constraints || [];

    // 2. Fetch recipe diet tags and ingredients
    const recipeResult = await pool.query(
      `SELECT diet_tags FROM recipes WHERE id = $1`,
      [recipeId]
    );
    if (recipeResult.rows.length === 0) throw new Error('Recipe not found');
    const recipe = recipeResult.rows[0];
    const dietTags: string[] = recipe.diet_tags || [];

    // 3. Fetch user ingredient preferences
    const prefsResult = await pool.query(
      `SELECT ingredient_id, preference_type 
       FROM user_ingredient_preferences 
       WHERE user_id = $1`,
      [userId]
    );
    const userPrefs = prefsResult.rows;

    // 4. Fetch recipe ingredients
    const recipeIngResult = await pool.query(
      `SELECT ingredient_id FROM recipe_ingredients WHERE recipe_id = $1`,
      [recipeId]
    );
    const recipeIngredients = recipeIngResult.rows.map(r => r.ingredient_id);

    let score = 0;

    // Hard Constraint: Diet compatibility
    // If user has a diet constraint (e.g., 'vegan') that the recipe lacks, score is heavily penalized.
    for (const constraint of dietConstraints) {
      if (!dietTags.includes(constraint)) {
        return -1000; // Strong penalty for violating diet constraint
      }
    }

    // Ingredient preferences
    for (const pref of userPrefs) {
      if (recipeIngredients.includes(pref.ingredient_id)) {
        if (pref.preference_type === 'include') {
          score += 10; // Bonus for included preferred ingredient
        } else if (pref.preference_type === 'exclude') {
          return -1000; // Strong penalty for including excluded ingredient
        }
      }
    }

    // Add base score (e.g., if we want to favor recipes generally)
    score += 5;

    return score;
  }

  /**
   * Pre-computes and saves the score for a user and recipe into user_recipe_scores table.
   */
  async precomputeScore(userId: string, recipeId: string): Promise<void> {
    const score = await this.calculateRecipeScore(userId, recipeId);
    
    await pool.query(
      `INSERT INTO user_recipe_scores (user_id, recipe_id, score)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, recipe_id) 
       DO UPDATE SET score = EXCLUDED.score`,
      [userId, recipeId, score]
    );
  }

  /**
   * Batch process all recipes for a given user
   */
  async precomputeScoresForUser(userId: string): Promise<void> {
    const recipesResult = await pool.query(`SELECT id FROM recipes`);
    for (const row of recipesResult.rows) {
      await this.precomputeScore(userId, row.id);
    }
  }
}
