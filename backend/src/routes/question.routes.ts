import { Router } from 'express';
import {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
} from '../controllers/question.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { createQuestionSchema, updateQuestionSchema } from '../validators/question.validator';

export const questionRoutes = Router();

questionRoutes.post(
  '/',
  authenticate,
  validateBody(createQuestionSchema),
  createQuestion
);

questionRoutes.get('/', authenticate, getQuestions);
questionRoutes.get('/:id', authenticate, getQuestion);
questionRoutes.patch(
  '/:id',
  authenticate,
  validateBody(updateQuestionSchema),
  updateQuestion
);
