import { query } from '../db';
import { OptimizationService, OptimizationOptions } from './optimization.service';

export class PlanService {
  /**
   * Retrieves a specific meal plan by ID, including its recipes and shopping list.
   */
  static async getPlan(planId: string, userId: string) {
    const planResult = await query('SELECT * FROM meal_plans WHERE id = $1 AND user_id = $2', [planId, userId]);
    if (planResult.rows.length === 0) throw new Error('Plan not found');
    const plan = planResult.rows[0];

    const recipesResult = await query(`
      SELECT r.*, mpr.recipe_id
      FROM meal_plan_recipes mpr
      JOIN recipes r ON r.id = mpr.recipe_id
      WHERE mpr.meal_plan_id = $1
    `, [planId]);

    const shoppingListResult = await query(`
      SELECT msl.*, i.name, sp.aisle, COALESCE(uoi.owned, false) as owned
      FROM meal_plan_shopping_list msl
      JOIN ingredients i ON i.id = msl.ingredient_id
      LEFT JOIN users u ON u.id = $2
      LEFT JOIN store_products sp ON sp.ingredient_id = i.id AND sp.store_id = u.preferred_store_id
      LEFT JOIN user_owned_ingredients uoi ON uoi.ingredient_id = i.id AND uoi.user_id = $2
      WHERE msl.meal_plan_id = $1
    `, [planId, userId]);

    return {
      plan,
      recipes: recipesResult.rows,
      shoppingList: shoppingListResult.rows
    };
  }

  /**
   * Retrieves user's history of meal plans.
   */
  static async getHistory(userId: string) {
    const result = await query(`
      SELECT id, start_date, end_date, estimated_total_cost, created_at
      FROM meal_plans
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);
    return result.rows;
  }

  /**
   * Adjusts a plan by keeping the same dates but applying new locks, exclusions, or budget.
   */
  static async adjustPlan(planId: string, userId: string, adjustments: { lockedSlots?: Record<string, string>, excludedRecipes?: string[], budgetOverride?: number }) {
    const planResult = await query('SELECT start_date, end_date FROM meal_plans WHERE id = $1 AND user_id = $2', [planId, userId]);
    if (planResult.rows.length === 0) throw new Error('Plan not found');
    const oldPlan = planResult.rows[0];

    const options: OptimizationOptions = {
      startDate: oldPlan.start_date,
      endDate: oldPlan.end_date,
      budgetOverride: adjustments.budgetOverride,
      lockedSlots: adjustments.lockedSlots,
      excludedRecipes: adjustments.excludedRecipes
    };

    return await OptimizationService.generateMealPlan(userId, options);
  }

  /**
   * Generates analytics over time for a user.
   */
  static async getAnalytics(userId: string) {
    const plansResult = await query(`
      SELECT estimated_total_cost, optimization_metadata, created_at
      FROM meal_plans
      WHERE user_id = $1
      ORDER BY created_at ASC
    `, [userId]);

    const plans = plansResult.rows;
    if (plans.length === 0) return { averageCostPerMeal: 0, averageWastePenalty: 0, totalPlans: 0, trends: [] };

    let totalCost = 0;
    let totalWaste = 0;
    let totalMeals = 0;
    const trends = plans.map(p => {
      const metadata = p.optimization_metadata || {};
      const objContrib = metadata.explanation_trace?.final_objective_contributions || metadata.explanation_trace?.objective_contributions || {};
      const waste = objContrib.waste_penalty_component || 0;
      const numMeals = Object.keys(metadata.explanation_trace?.selected_slots || {}).length || 21; // fallback to 21
      
      totalCost += parseFloat(p.estimated_total_cost || '0');
      totalWaste += waste;
      totalMeals += numMeals;

      return {
        date: p.created_at,
        cost: parseFloat(p.estimated_total_cost || '0'),
        waste,
        costPerMeal: parseFloat(p.estimated_total_cost || '0') / numMeals
      };
    });

    return {
      averageCostPerMeal: totalCost / totalMeals,
      averageWastePenalty: totalWaste / plans.length,
      totalPlans: plans.length,
      trends
    };
  }
}
