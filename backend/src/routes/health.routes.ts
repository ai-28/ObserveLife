import { Router } from 'express';
import { query } from '../db';

export const healthRoutes = Router();

healthRoutes.get('/', async (_req, res) => {
  try {
    // Test database connection
    await query('SELECT NOW()');
    res.json({
      success: true,
      message: 'API is healthy',
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'API is unhealthy',
      database: 'disconnected',
    });
  }
});
