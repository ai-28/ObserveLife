import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../db';
import { AppError } from '../middleware/errorHandler';
import { CreateConsentInput } from '../validators/consent.validator';

export const createConsent = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  // Only staff/facility_admin can create consent records
  if (req.user.role !== 'staff' && req.user.role !== 'facility_admin' && req.user.role !== 'platform_admin') {
    throw new AppError('Access denied', 403);
  }

  const data: CreateConsentInput = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Verify resident exists and belongs to organization
  const resident = await query(
    'SELECT id, organization_id FROM residents WHERE id = $1',
    [data.resident_id]
  );

  if (resident.rows.length === 0) {
    throw new AppError('Resident not found', 404);
  }

  if (req.user.organization_id !== resident.rows[0].organization_id) {
    throw new AppError('Access denied', 403);
  }

  // Create consent record (immutable)
  const result = await query(
    `INSERT INTO consent_records (resident_id, consented_by_user_id, consent_type, rep_name, rep_relationship, form_version, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.resident_id,
      req.user.id,
      data.consent_type,
      data.rep_name || null,
      data.rep_relationship || null,
      data.form_version,
      typeof ipAddress === 'string' ? ipAddress : null,
    ]
  );

  // Update resident consent status
  await query(
    `UPDATE residents 
     SET consent_status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [data.resident_id]
  );

  res.status(201).json({
    success: true,
    data: { consent: result.rows[0] },
  });
};

export const getConsentRecords = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { resident_id } = req.query;

  if (!resident_id) {
    throw new AppError('resident_id is required', 400);
  }

  // Verify access
  const resident = await query(
    'SELECT organization_id FROM residents WHERE id = $1',
    [resident_id]
  );

  if (resident.rows.length === 0) {
    throw new AppError('Resident not found', 404);
  }

  if (req.user.role === 'staff' || req.user.role === 'facility_admin' || req.user.role === 'platform_admin') {
    if (req.user.organization_id !== resident.rows[0].organization_id) {
      throw new AppError('Access denied', 403);
    }
  } else {
    throw new AppError('Access denied', 403);
  }

  const result = await query(
    `SELECT cr.*, u.name as consented_by_name
     FROM consent_records cr
     JOIN users u ON cr.consented_by_user_id = u.id
     WHERE cr.resident_id = $1
     ORDER BY cr.created_at DESC`,
    [resident_id]
  );

  res.json({
    success: true,
    data: { consents: result.rows },
  });
};
