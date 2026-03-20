import { Router } from 'express';
import { healthRoutes } from './health.routes';
import { authRoutes } from './auth.routes';
import { organizationRoutes } from './organization.routes';
import { residentRoutes } from './resident.routes';
import { storyRoutes } from './story.routes';
import { questionRoutes } from './question.routes';
import { familyRoutes } from './family.routes';
import { consentRoutes } from './consent.routes';
import { promptRoutes } from './prompt.routes';
import { staffRoutes } from './staff.routes';

export const routes = Router();

routes.use('/health', healthRoutes);
routes.use('/auth', authRoutes);
routes.use('/organizations', organizationRoutes);
routes.use('/residents', residentRoutes);
routes.use('/stories', storyRoutes);
routes.use('/questions', questionRoutes);
routes.use('/family', familyRoutes);
routes.use('/consent', consentRoutes);
routes.use('/prompts', promptRoutes);
routes.use('/staff', staffRoutes);