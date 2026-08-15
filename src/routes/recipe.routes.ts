import { Router } from 'express';
import { query } from '../db';
import { authenticateJWT, AuthRequest } from '../middleware/jwtAuth';

const router = Router();

// Middleware to mock user ID for now if no auth is present (to keep it consistent with plan.routes)
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
    req.user = { id: 'mock-user-id' };
  }
  next();
};

router.use(requireAuth);

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch recipe details
    const recipeResult = await query('SELECT * FROM recipes WHERE id = $1', [id]);
    if (recipeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    // Fetch recipe ingredients
    const ingredientsResult = await query(`
      SELECT ri.quantity, ri.unit, ri.optional_notes, i.name, i.category
      FROM recipe_ingredients ri
      JOIN ingredients i ON i.id = ri.ingredient_id
      WHERE ri.recipe_id = $1
    `, [id]);
    
    const recipe = recipeResult.rows[0];
    recipe.ingredients = ingredientsResult.rows;
    
    res.json(recipe);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
