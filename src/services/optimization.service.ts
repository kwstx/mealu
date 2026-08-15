import { Queue } from 'bullmq';
import { redisConnection, redisCache } from '../db/redis';
import { query } from '../db';
import { PriceIngestionService } from './price-ingestion.service';

export interface OptimizationOptions {
  startDate: Date;
  endDate: Date;
  guaranteeStandardMeals?: boolean;
  slots?: string[];
  budgetOverride?: number;
  priceLockWindowHours?: number;
  lockedSlots?: Record<string, string>;
  excludedRecipes?: string[];
}

const optimizationQueue = new Queue('meal-optimization', { connection: redisConnection });

export class OptimizationService {
  /**
   * Enqueues a meal plan generation job to BullMQ.
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

    // 3. Fetch & Cache Candidate Recipes (Partitioned / Prefiltered)
    // Assume user diet tags would be fetched here in a real app
    const cacheKey = `candidate_recipes:${userId}`;
    let candidateRecipesStr = await redisCache.get(cacheKey);
    let candidateRecipes;
    
    if (candidateRecipesStr) {
      candidateRecipes = JSON.parse(candidateRecipesStr);
    } else {
      const recipesResult = await query(`
        SELECT 
          r.id, r.title, r.calories, r.protein, r.carbs, r.fat, r.diet_tags,
          COALESCE(urs.score, 5.0) as preference_score
        FROM recipes r
        LEFT JOIN user_recipe_scores urs ON r.id = urs.recipe_id AND urs.user_id = $1
        LIMIT 100 -- Limit candidate recipes to avoid solver overload
      `, [userId]);
      candidateRecipes = recipesResult.rows;
      await redisCache.setex(cacheKey, 3600, JSON.stringify(candidateRecipes)); // Cache for 1 hr
    }

    // Fetch Recipe Ingredients
    const recipeIds = candidateRecipes.map((r: any) => r.id);
    let recipeIngredientsMap = new Map<string, any[]>();
    
    if (recipeIds.length > 0) {
      const riResult = await query(`
        SELECT recipe_id, ingredient_id, quantity, unit
        FROM recipe_ingredients
        WHERE recipe_id = ANY($1)
      `, [recipeIds]);

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
    }

    const formattedRecipes = candidateRecipes.map((r: any) => ({
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

    // 4. Fetch Ingredient Prices (Uses Redis Cache inside PriceIngestionService)
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

    // 6. Enqueue Job
    const job = await optimizationQueue.add('solve_meal_plan', {
      userId,
      payload,
      options,
      averageConfidence
    });

    return {
      jobId: job.id,
      status: 'enqueued',
      message: 'Meal plan generation started. Please connect via WebSocket to receive updates.'
    };
  }

  static async getJobStatus(jobId: string) {
    const job = await optimizationQueue.getJob(jobId);
    if (!job) return { status: 'not_found' };
    const state = await job.getState();
    return {
      id: job.id,
      status: state,
      result: job.returnvalue,
      failedReason: job.failedReason
    };
  }
}
