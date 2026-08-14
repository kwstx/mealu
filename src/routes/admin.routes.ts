import { Router, Request, Response } from 'express';
import { RecipeEtlService, RawRecipe } from '../services/recipe-etl.service';
import { RecipeScoringService } from '../services/recipe-scoring.service';

const router = Router();
const etlService = new RecipeEtlService();
const scoringService = new RecipeScoringService();

// Middleware to check admin role (mocked for now)
const isAdmin = (req: Request, res: Response, next: Function) => {
  // In a real app, check req.user for admin role
  // if (!req.user || !req.user.isAdmin) return res.status(403).send('Forbidden');
  next();
};

/**
 * Ingest a single raw recipe or an array of recipes
 */
router.post('/recipes/ingest', isAdmin, async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const recipes: RawRecipe[] = Array.isArray(data) ? data : [data];
    
    const ingestedIds = [];
    for (const recipe of recipes) {
      const id = await etlService.ingestRecipe(recipe);
      ingestedIds.push(id);
    }
    
    res.status(200).json({
      message: `Successfully ingested ${ingestedIds.length} recipes.`,
      ingestedIds
    });
  } catch (error: any) {
    console.error('Ingestion error:', error);
    res.status(500).json({ error: 'Ingestion failed', details: error.message });
  }
});

/**
 * Trigger re-calculation of recipe scores for all users (or a specific user)
 * Very computationally heavy in reality, but a simple admin endpoint for now.
 */
router.post('/recipes/score-all', isAdmin, async (req: Request, res: Response) => {
  try {
    // We would need to fetch all users and loop, or specific user
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required in body' });
    }
    
    await scoringService.precomputeScoresForUser(userId);
    res.status(200).json({ message: `Scores calculated for user ${userId}` });
  } catch (error: any) {
    console.error('Scoring error:', error);
    res.status(500).json({ error: 'Scoring failed', details: error.message });
  }
});

export default router;
