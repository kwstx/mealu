import { Router } from 'express';
import passport from '../auth/passport';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/jwtAuth';

const router = Router();

// Helper to generate token
const generateToken = (user: any) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
};

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    // Return token to the client. Typically, this might be a redirect with a short-lived token in the URL.
    res.json({ token });
  }
);

// Apple Auth
router.get('/apple', passport.authenticate('apple'));

router.post(
  '/apple/callback',
  passport.authenticate('apple', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.json({ token });
  }
);

export default router;
