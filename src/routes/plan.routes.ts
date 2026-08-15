import { Router } from 'express';
import { PlanService } from '../services/plan.service';
import { OptimizationService } from '../services/optimization.service';

const router = Router();

// Middleware to mock user ID for now if no auth is present
const requireAuth = (req: any, res: any, next: any) => {
  // Assuming req.user is set by auth middleware, mock it if not
  req.user = req.user || { id: 'mock-user-id' };
  next();
};

router.use(requireAuth);

router.post('/generate', async (req, res) => {
  try {
    const { startDate, endDate, guaranteeStandardMeals, slots, budgetOverride } = req.body;
    const result = await OptimizationService.generateMealPlan(req.user.id, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      guaranteeStandardMeals,
      slots,
      budgetOverride
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const history = await PlanService.getHistory(req.user.id);
    res.json(history);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const analytics = await PlanService.getAnalytics(req.user.id);
    res.json(analytics);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const plan = await PlanService.getPlan(req.params.id, req.user.id);
    res.json(plan);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/:id/adjust', async (req, res) => {
  try {
    const { lockedSlots, excludedRecipes, budgetOverride } = req.body;
    const result = await PlanService.adjustPlan(req.params.id, req.user.id, {
      lockedSlots,
      excludedRecipes,
      budgetOverride
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/shopping-list/:ingredientId', async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const { owned } = req.body;
    
    // Import query at the top of the file if needed.
    // Let's assume we can just require it or it's available.
    // Actually, I should import query from '../db' at the top.
    
    const { query } = require('../db');
    
    await query(`
      INSERT INTO user_owned_ingredients (user_id, ingredient_id, owned)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, ingredient_id)
      DO UPDATE SET owned = EXCLUDED.owned, updated_at = CURRENT_TIMESTAMP
    `, [req.user.id, ingredientId, owned]);
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
