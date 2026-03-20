import { Router } from 'express';
import {
  createStory,
  getStories,
  getStory,
  updateStory,
} from '../controllers/story.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { createStorySchema, updateStorySchema } from '../validators/story.validator';

export const storyRoutes = Router();

storyRoutes.post(
  '/',
  authenticate,
  validateBody(createStorySchema),
  createStory
);

storyRoutes.get('/', authenticate, getStories);
storyRoutes.get('/:id', authenticate, getStory);
storyRoutes.patch(
  '/:id',
  authenticate,
  validateBody(updateStorySchema),
  updateStory
);
