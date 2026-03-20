import { Router } from 'express';
import { register, login, getMe, updateMe } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validator';
import { registerSchema, loginSchema, updateMeSchema } from '../validators/auth.validator';
import { authenticate } from '../middleware/auth';

export const authRoutes = Router();

authRoutes.post('/register', validateBody(registerSchema), register);
authRoutes.post('/login', validateBody(loginSchema), login);
authRoutes.get('/me', authenticate, getMe);
authRoutes.patch('/me', authenticate, validateBody(updateMeSchema), updateMe);