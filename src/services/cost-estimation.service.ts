import { query } from '../db';

export interface AggregatedRequirement {
  ingredient_id: string;
  needed_quantity: number;
}

export interface PackageCombo {
  product_id: string;
  quantity: number; // how many of this package
  size: number;
  price: number;
  brand: string | null;
}

export interface LineItem {
  ingredient_id: string;
  is_substitution: boolean;
  original_ingredient_id?: string;
  combinations: PackageCombo[];
  total_quantity: number;
  total_cost: number;
}

export interface CostEstimationOptions {
  userId: string;
  storeId: string;
  requirements: AggregatedRequirement[];
  enableSubstitutions?: boolean;
}

export interface CostEstimationResult {
  total_cost: number;
  line_items: LineItem[];
  applied_substitutions: { original_id: string; substitute_id: string; savings: number }[];
}

export class CostEstimationService {
  /**
   * Estimates the cost of a list of aggregated ingredient requirements.
   * Finds the optimal combination of packages to fulfill the needed quantity.
   * Optionally explores substitutions to find cheaper alternatives.
   */
  static async estimateCost(options: CostEstimationOptions): Promise<CostEstimationResult> {
    const { userId, storeId, requirements, enableSubstitutions = true } = options;

    // 1. Fetch user constraints (diet flags) to respect when substituting
    const userResult = await query('SELECT diet_constraints, flexible_preferences FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) throw new Error('User not found');
    const userDietFlags = userResult.rows[0].diet_constraints || [];

    // Also fetch exclusions from user_ingredient_preferences
    const exclusionsResult = await query(
      `SELECT ingredient_id FROM user_ingredient_preferences WHERE user_id = $1 AND preference_type = 'exclude'`,
      [userId]
    );
    const excludedIngredientIds = new Set(exclusionsResult.rows.map(r => r.ingredient_id));

    const result: CostEstimationResult = {
      total_cost: 0,
      line_items: [],
      applied_substitutions: []
    };

    for (const req of requirements) {
      // 2. Solve for the original ingredient
      let bestSolution = await this.findBestPackageCombination(req.ingredient_id, storeId, req.needed_quantity);
      let isSubstituted = false;
      let originalId = req.ingredient_id;
      let usedId = req.ingredient_id;
      let savings = 0;

      // 3. Explore substitutions if enabled
      if (enableSubstitutions) {
        const substitutes = await this.getSubstitutions(req.ingredient_id);
        
        for (const subId of substitutes) {
          // Check if substitute is excluded by user
          if (excludedIngredientIds.has(subId)) continue;

          // Check diet constraints (substitute must not violate user's diet)
          const ingResult = await query('SELECT diet_flags FROM ingredients WHERE id = $1', [subId]);
          if (ingResult.rows.length > 0) {
            const subFlags = ingResult.rows[0].diet_flags || [];
            // If user is vegan, ingredient must have 'vegan' flag
            const violatesDiet = userDietFlags.some((flag: string) => !subFlags.includes(flag));
            if (violatesDiet) continue;
          }

          // Solve for substitute
          const subSolution = await this.findBestPackageCombination(subId, storeId, req.needed_quantity);
          
          if (subSolution && (!bestSolution || subSolution.total_cost < bestSolution.total_cost)) {
            savings = bestSolution ? bestSolution.total_cost - subSolution.total_cost : 0;
            bestSolution = subSolution;
            isSubstituted = true;
            usedId = subId;
          }
        }
      }

      if (!bestSolution) {
        console.warn(`Could not fulfill requirement for ingredient ${req.ingredient_id} at store ${storeId}`);
        continue;
      }

      result.line_items.push({
        ingredient_id: usedId,
        is_substitution: isSubstituted,
        original_ingredient_id: isSubstituted ? originalId : undefined,
        combinations: bestSolution.combinations,
        total_quantity: bestSolution.total_quantity,
        total_cost: bestSolution.total_cost
      });

      result.total_cost += bestSolution.total_cost;

      if (isSubstituted) {
        result.applied_substitutions.push({
          original_id: originalId,
          substitute_id: usedId,
          savings
        });
      }
    }

    return result;
  }

  /**
   * Solves the unbounded knapsack-like problem: finding the combination of available
   * packages that meets the needed quantity at the minimum cost.
   */
  private static async findBestPackageCombination(
    ingredientId: string, 
    storeId: string, 
    neededQuantity: number
  ): Promise<{ total_cost: number, total_quantity: number, combinations: PackageCombo[] } | null> {
    
    // Fetch available products for this ingredient at the store
    const productsResult = await query(
      `SELECT id, brand, package_size, unit_price 
       FROM store_products 
       WHERE store_id = $1 AND ingredient_id = $2 AND is_available = TRUE`,
      [storeId, ingredientId]
    );

    if (productsResult.rows.length === 0) return null;

    const packages = productsResult.rows.map(row => ({
      id: row.id,
      brand: row.brand,
      size: this.parseSize(row.package_size),
      price: parseFloat(row.unit_price)
    })).filter(p => p.size > 0);

    if (packages.length === 0) return null;

    // We want to minimize cost such that sum(qty_i * size_i) >= neededQuantity.
    // We can use a simple Dynamic Programming approach or Breadth-First search since 
    // the number of packages per ingredient is usually small (1-5).
    // Let's use DP up to neededQuantity + max(size).
    // To handle continuous sizes, we can discretize them (e.g., multiply by 100 for precision).
    const scale = 100;
    const target = Math.ceil(neededQuantity * scale);
    const maxPackageSize = Math.max(...packages.map(p => Math.ceil(p.size * scale)));
    const maxCapacity = target + maxPackageSize;

    const dp = new Array(maxCapacity + 1).fill(Infinity);
    const choice = new Array(maxCapacity + 1).fill(null);
    dp[0] = 0;

    for (let w = 0; w <= maxCapacity; w++) {
      if (dp[w] === Infinity) continue;

      for (let i = 0; i < packages.length; i++) {
        const p = packages[i];
        const pSize = Math.ceil(p.size * scale);
        const nextW = Math.min(w + pSize, maxCapacity); // cap at maxCapacity to prevent out of bounds

        if (dp[w] + p.price < dp[nextW]) {
          dp[nextW] = dp[w] + p.price;
          choice[nextW] = { prevW: w, packageIndex: i };
        }
      }
    }

    // Find the minimum cost for any weight >= target
    let bestW = target;
    for (let w = target; w <= maxCapacity; w++) {
      if (dp[w] < dp[bestW]) {
        bestW = w;
      }
    }

    if (dp[bestW] === Infinity) return null;

    // Reconstruct the solution
    const comboMap = new Map<number, number>(); // packageIndex -> count
    let currW = bestW;
    while (currW > 0 && choice[currW]) {
      const { prevW, packageIndex } = choice[currW];
      comboMap.set(packageIndex, (comboMap.get(packageIndex) || 0) + 1);
      currW = prevW;
    }

    const combinations: PackageCombo[] = [];
    let totalCost = 0;
    let totalQty = 0;

    for (const [index, count] of comboMap.entries()) {
      const p = packages[index];
      combinations.push({
        product_id: p.id,
        quantity: count,
        size: p.size,
        price: p.price,
        brand: p.brand
      });
      totalCost += count * p.price;
      totalQty += count * p.size;
    }

    return {
      total_cost: totalCost,
      total_quantity: totalQty,
      combinations
    };
  }

  /**
   * Parses a package size string like "500g", "1.5 kg", "1 bunch" into a numeric value.
   * For a robust system, this should handle unit conversions (e.g., converting everything to a base unit).
   */
  private static parseSize(sizeStr: string): number {
    const match = sizeStr.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 1.0;
  }

  /**
   * Mock substitution graph. In a real system, this would query a substitutions table
   * or a graph database (e.g., Neo4j) to find nutritionally and culinarily acceptable replacements.
   */
  private static async getSubstitutions(ingredientId: string): Promise<string[]> {
    // We would look up a table like `ingredient_substitutions` here.
    // For demonstration, returning empty array. 
    // In actual implementation: 
    // const res = await query('SELECT substitute_id FROM substitutions WHERE original_id = $1', [ingredientId]);
    // return res.rows.map(r => r.substitute_id);
    return [];
  }
}
