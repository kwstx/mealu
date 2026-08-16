import { Router } from 'express';
import { query } from '../db';
import { authenticateJWT } from '../middleware/jwtAuth';

const router = Router();

// Get all stores
router.get('/', authenticateJWT, async (req, res) => {
  const { country, specificCountry } = req.query;
  try {
    let queryStr = 'SELECT id, name, location FROM stores';
    let queryParams: any[] = [];
    
    if (specificCountry && typeof specificCountry === 'string') {
      queryStr += ' WHERE location = $1';
      queryParams.push(specificCountry);
    } else if (country && typeof country === 'string') {
      queryStr += ' WHERE location = $1';
      queryParams.push(country);
    }
    
    queryStr += ' ORDER BY name ASC';
    
    const result = await query(queryStr, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
