import express from 'express';
import passport from 'passport';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import adminRoutes from './routes/admin.routes';
import planRoutes from './routes/plan.routes';
import { register } from './services/metrics';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/plans', planRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

export default app;
