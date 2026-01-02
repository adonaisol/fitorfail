import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/env.js';
import { initializeDatabase } from './config/database.js';

// Import routes
import authRoutes from './routes/auth';
import exerciseRoutes from './routes/exercises';
import workoutRoutes from './routes/workouts';
import preferencesRoutes from './routes/preferences';
import statsRoutes from './routes/stats';

// ESM compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/stats', statsRoutes);

// API 404 handler - must come before static file serving
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Production: Serve static frontend files
if (config.nodeEnv === 'production') {
  // In production, frontend files are in ../frontend relative to server.js
  const frontendPath = path.join(__dirname, '..', 'frontend');

  // Serve static files
  app.use(express.static(frontendPath));

  // SPA fallback - serve index.html for any non-API routes
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // Development: 404 for non-API routes (frontend served by Vite)
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });
}

// Error handler
interface HttpError extends Error {
  status?: number;
}

app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: config.nodeEnv === 'development' ? err.message : 'Internal server error'
  });
});

// Initialize database and start server
async function start(): Promise<void> {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');

    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
