import { Router } from 'express';
import {
  createResident,
  createResidentWithUser,
  getResidents,
  getResident,
  updateResident,
} from '../controllers/resident.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { createResidentSchema, createResidentWithUserSchema, updateResidentSchema } from '../validators/resident.validator';

export const residentRoutes = Router();

residentRoutes.post(
  '/',
  authenticate,
  requireRole('staff', 'facility_admin'),
  validateBody(createResidentSchema),
  createResident
);

residentRoutes.post(
  '/with-user',
  authenticate,
  requireRole('staff', 'facility_admin'),
  validateBody(createResidentWithUserSchema),
  createResidentWithUser
);

residentRoutes.get('/', authenticate, getResidents);
residentRoutes.get('/:id', authenticate, getResident);
residentRoutes.patch(
  '/:id',
  authenticate,
  requireRole('staff', 'facility_admin'),
  validateBody(updateResidentSchema),
  updateResident
);
