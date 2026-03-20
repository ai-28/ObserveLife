import { Router } from 'express';
import {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
} from '../controllers/organization.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { createOrganizationSchema, updateOrganizationSchema } from '../validators/organization.validator';

export const organizationRoutes = Router();

organizationRoutes.post(
  '/',
  authenticate,
  requireRole('platform_admin', 'facility_admin'),
  validateBody(createOrganizationSchema),
  createOrganization
);

organizationRoutes.get('/', authenticate, getOrganizations);
organizationRoutes.get('/:id', authenticate, getOrganization);
organizationRoutes.patch(
  '/:id',
  authenticate,
  requireRole('platform_admin', 'facility_admin'),
  validateBody(updateOrganizationSchema),
  updateOrganization
);
