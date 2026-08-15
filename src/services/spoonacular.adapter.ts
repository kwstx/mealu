export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export class SpoonacularAdapter {
  private apiKey: string | undefined;
  
  constructor() {
    this.apiKey = process.env.SPOONACULAR_API_KEY;
  }

  /**
   * Estimates nutrition for a given ingredient text (e.g., "1 cup of rice").
   * Falls back to a local estimation if API key is missing or request fails.
   */
  async estimateNutrition(ingredientName: string, quantity: number, unit: string): Promise<NutritionInfo> {
    if (this.apiKey) {
      try {
        const query = `${quantity} ${unit} ${ingredientName}`;
        const response = await fetch(`https://api.spoonacular.com/recipes/guessNutrition?title=${encodeURIComponent(query)}&apiKey=${this.apiKey}`);
        
        if (response.ok) {
          const data = await response.json();
          return {
            calories: data.calories?.value || 0,
            protein: data.protein?.value || 0,
            carbs: data.carbs?.value || 0,
            fat: data.fat?.value || 0
          };
        }
      } catch (error) {
        console.warn('Spoonacular API error, falling back to local estimation:', error);
      }
    }

    // Fallback local estimation based on ingredient name heuristics
    // In a production app, we would look this up from a USDA database or similar
    return this.fallbackLocalEstimation(ingredientName, quantity, unit);
  }

  private fallbackLocalEstimation(ingredientName: string, quantity: number, unit: string): NutritionInfo {
    const nameLower = ingredientName.toLowerCase();
    let multiplier = 1; // Base per unit

    if (unit === 'cup') multiplier = 2.5;
    if (unit === 'g') multiplier = 0.01;
    if (unit === 'kg') multiplier = 10;
    if (unit === 'oz') multiplier = 0.28;
    if (unit === 'lb') multiplier = 4.5;
    
    // Very naive heuristic defaults
    if (nameLower.includes('chicken') || nameLower.includes('beef')) {
      return { calories: 200 * quantity * multiplier, protein: 25 * quantity * multiplier, carbs: 0, fat: 10 * quantity * multiplier };
    }
    if (nameLower.includes('rice') || nameLower.includes('pasta')) {
      return { calories: 150 * quantity * multiplier, protein: 3 * quantity * multiplier, carbs: 30 * quantity * multiplier, fat: 1 * quantity * multiplier };
    }
    if (nameLower.includes('oil') || nameLower.includes('butter')) {
      return { calories: 120 * quantity * multiplier, protein: 0, carbs: 0, fat: 14 * quantity * multiplier };
    }
    if (nameLower.includes('apple') || nameLower.includes('banana')) {
      return { calories: 100 * quantity * multiplier, protein: 1 * quantity * multiplier, carbs: 25 * quantity * multiplier, fat: 0 };
    }

    // Generic fallback
    return { calories: 50 * quantity * multiplier, protein: 1 * quantity * multiplier, carbs: 5 * quantity * multiplier, fat: 1 * quantity * multiplier };
  }
}
