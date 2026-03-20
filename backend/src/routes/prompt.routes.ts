import { Router } from 'express';
import { getPrompts, getPrompt } from '../controllers/prompt.controller';
import { authenticate } from '../middleware/auth';

export const promptRoutes = Router();

promptRoutes.get('/', authenticate, getPrompts);
promptRoutes.get('/:id', authenticate, getPrompt);
