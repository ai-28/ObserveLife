import { Router } from 'express';
import { createStaff, getStaff } from '../controllers/staff.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { createStaffSchema } from '../validators/staff.validator';

export const staffRoutes = Router();

// Create a new staff member (only facility_admin)
staffRoutes.post(
  '/',
  authenticate,
  requireRole('facility_admin'),
  validateBody(createStaffSchema),
  createStaff
);

// Get all staff members for the organization (only facility_admin)
staffRoutes.get(
  '/',
  authenticate,
  requireRole('facility_admin'),
  getStaff
);
