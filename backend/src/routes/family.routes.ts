import { Router } from 'express';
import {
  batchInvite,
  getFamilyConnections,
  acceptInvitation,
} from '../controllers/family.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { batchInviteSchema } from '../validators/family.validator';

export const familyRoutes = Router();

familyRoutes.post(
  '/invitations/batch',
  authenticate,
  requireRole('staff', 'facility_admin'),
  validateBody(batchInviteSchema),
  batchInvite
);

familyRoutes.get('/connections', authenticate, getFamilyConnections);
familyRoutes.post('/invitations/:token/accept', authenticate, acceptInvitation);
