import { query } from '../db';

export interface PriceObservation {
  ingredientId: string;
  storeId: string;
  price: number;
  currency: string;
  unit: string;
  confidenceScore: number;
}

export interface EffectivePrice {
  ingredient_id: string;
  unit_price: number;
  package_size: number;
  name: string;
  confidence: number;
}

export interface PriceIngestionProvider {
  name: string;
  fetchPrices(storeId: string): Promise<PriceObservation[]>;
}

export class PriceIngestionService {
  private static providers: PriceIngestionProvider[] = [];

  static registerProvider(provider: PriceIngestionProvider) {
    this.providers.push(provider);
  }

  /**
   * Generic method to ingest via webhook from an external source.
   */
  static async ingestPriceWebhook(source: string, observations: PriceObservation[]) {
    console.log(`Received ${observations.length} prices from webhook source: ${source}`);
    await this.recordObservations(observations);
  }

  /**
   * Poll all registered APIs.
   * Can be run on a cron job.
   */
  static async pollSupermarketAPIs(storeId: string) {
    for (const provider of this.providers) {
      try {
        const observations = await provider.fetchPrices(storeId);
        await this.recordObservations(observations);
      } catch (err) {
        console.error(`Error polling provider ${provider.name}`, err);
      }
    }
  }

  static async recordObservations(observations: PriceObservation[]) {
    // In a real application, consider using bulk insert for performance.
    for (const obs of observations) {
      await query(`
        INSERT INTO ingredient_prices (ingredient_id, store_id, price, currency, unit, confidence_score)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [obs.ingredientId, obs.storeId, obs.price, obs.currency, obs.unit, obs.confidenceScore]);
    }
  }

  /**
   * Retrieves effective prices for a list of ingredients at a specific store.
   * Logic:
   * 1. Get recent prices from ingredient_prices within priceLockWindowHours.
   * 2. If older, apply a decay factor to the confidence score.
   * 3. Fallback to store_products static catalog if no observations exist, with a low confidence indicator.
   */
  static async getEffectivePrices(
    storeId: string, 
    ingredientIds: string[], 
    priceLockWindowHours: number = 24
  ): Promise<{ prices: EffectivePrice[], averageConfidence: number }> {
    
    if (ingredientIds.length === 0) {
      return { prices: [], averageConfidence: 1.0 };
    }

    // First, fetch the fallback static catalog data
    const staticResult = await query(`
      SELECT sp.ingredient_id, sp.unit_price, sp.package_size, sp.is_available,
             i.name as ingredient_name
      FROM store_products sp
      JOIN ingredients i ON i.id = sp.ingredient_id
      WHERE sp.store_id = $1 AND sp.ingredient_id = ANY($2) AND sp.is_available = TRUE
    `, [storeId, ingredientIds]);

    const staticCatalog = new Map<string, any>();
    staticResult.rows.forEach(row => {
      staticCatalog.set(row.ingredient_id, {
        unit_price: parseFloat(row.unit_price),
        package_size: this.extractSize(row.package_size),
        name: row.ingredient_name
      });
    });

    // Fetch the most recent price observations for these ingredients
    const observationsResult = await query(`
      SELECT DISTINCT ON (ingredient_id) 
        ingredient_id, price, unit, confidence_score, recorded_at
      FROM ingredient_prices
      WHERE store_id = $1 AND ingredient_id = ANY($2)
      ORDER BY ingredient_id, recorded_at DESC
    `, [storeId, ingredientIds]);

    const observationsMap = new Map<string, any>();
    observationsResult.rows.forEach(row => {
      observationsMap.set(row.ingredient_id, row);
    });

    const effectivePrices: EffectivePrice[] = [];
    let totalConfidence = 0;
    let count = 0;

    const now = new Date().getTime();

    for (const ingredientId of ingredientIds) {
      const fallback = staticCatalog.get(ingredientId);
      if (!fallback) continue; // If it's not even in the static catalog, we can't buy it

      const obs = observationsMap.get(ingredientId);
      
      if (obs) {
        const recordedAt = new Date(obs.recorded_at).getTime();
        const hoursAge = (now - recordedAt) / (1000 * 60 * 60);

        let finalPrice = parseFloat(obs.price);
        let finalConfidence = parseFloat(obs.confidence_score);

        if (hoursAge > priceLockWindowHours) {
          // Apply time decay (e.g., confidence drops by 5% for every hour beyond the lock window)
          const decayHours = hoursAge - priceLockWindowHours;
          const decayFactor = Math.max(0.1, 1.0 - (decayHours * 0.05));
          finalConfidence = finalConfidence * decayFactor;
        }

        effectivePrices.push({
          ingredient_id: ingredientId,
          unit_price: finalPrice,
          package_size: fallback.package_size, // Assuming observation unit matches static size for simplicity
          name: fallback.name,
          confidence: finalConfidence
        });
        totalConfidence += finalConfidence;
        count++;

      } else {
        // Fallback to static catalog when no real-time observations exist
        effectivePrices.push({
          ingredient_id: ingredientId,
          unit_price: fallback.unit_price,
          package_size: fallback.package_size,
          name: fallback.name,
          confidence: 0.1 // Very low confidence since it's just the static catalog
        });
        totalConfidence += 0.1;
        count++;
      }
    }

    const averageConfidence = count > 0 ? totalConfidence / count : 0;

    return {
      prices: effectivePrices,
      averageConfidence
    };
  }

  private static extractSize(sizeStr: string): number {
    const match = sizeStr.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 1.0;
  }
}
