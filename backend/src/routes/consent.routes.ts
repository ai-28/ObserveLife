import { Router } from 'express';
import {
  createConsent,
  getConsentRecords,
} from '../controllers/consent.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { createConsentSchema } from '../validators/consent.validator';

export const consentRoutes = Router();

consentRoutes.post(
  '/',
  authenticate,
  requireRole('staff', 'facility_admin'),
  validateBody(createConsentSchema),
  createConsent
);

consentRoutes.get('/', authenticate, requireRole('staff', 'admin'), getConsentRecords);
