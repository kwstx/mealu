import { Router, Request, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/jwtAuth';
import { ProfileService } from '../services/profile.service';
import { ProfileSchema } from '../schemas/profile.schema';
import { ZodError } from 'zod';

const router = Router();

// Get Current Profile
router.get('/', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    const profile = await ProfileService.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update Profile
router.put('/', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    
    // Validate request body
    const validatedData = ProfileSchema.parse(req.body);
    
    // Update profile
    const updatedProfile = await ProfileService.updateProfile(userId, validatedData);
    
    res.json(updatedProfile);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.issues });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
