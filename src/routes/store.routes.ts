import { Router } from 'express';
import { query } from '../db';
import { authenticateJWT } from '../middleware/jwtAuth';

const router = Router();

// Get all stores
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const result = await query('SELECT id, name, location FROM stores ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
