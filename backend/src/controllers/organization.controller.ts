import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../db';
import { AppError } from '../middleware/errorHandler';
import { CreateOrganizationInput, UpdateOrganizationInput } from '../validators/organization.validator';

export const createOrganization = async (req: AuthRequest, res: Response) => {
  const data: CreateOrganizationInput = req.body;

  const result = await query(
    `INSERT INTO organizations (name, type, address)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.name, data.type, data.address || null]
  );

  res.status(201).json({
    success: true,
    data: { organization: result.rows[0] },
  });
};

export const getOrganizations = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  let result;
  if (req.user.role === 'facility_admin' && req.user.organization_id) {
    // Facility admin sees only their organization
    result = await query(
      'SELECT * FROM organizations WHERE id = $1',
      [req.user.organization_id]
    );
  } else if (req.user.role === 'platform_admin') {
    // Platform admin sees all organizations
    result = await query('SELECT * FROM organizations ORDER BY created_at DESC');
  } else {
    // Other roles see only their organization
    result = await query(
      'SELECT * FROM organizations WHERE id = $1',
      [req.user.organization_id]
    );
  }

  res.json({
    success: true,
    data: { organizations: result.rows },
  });
};

export const getOrganization = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query('SELECT * FROM organizations WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Organization not found', 404);
  }

  // RLS: Check if user has access
  if (req.user && req.user.organization_id !== id && req.user.role !== 'platform_admin' && req.user.role !== 'facility_admin') {
    throw new AppError('Access denied', 403);
  }

  res.json({
    success: true,
    data: { organization: result.rows[0] },
  });
};

export const updateOrganization = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data: UpdateOrganizationInput = req.body;

  // Check access
  if (req.user && req.user.organization_id !== id && req.user.role !== 'platform_admin' && req.user.role !== 'facility_admin') {
    throw new AppError('Access denied', 403);
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.name) {
    updates.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.address !== undefined) {
    updates.push(`address = $${paramCount++}`);
    values.push(data.address);
  }
  if (data.billing_status) {
    updates.push(`billing_status = $${paramCount++}`);
    values.push(data.billing_status);
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  values.push(id);
  const result = await query(
    `UPDATE organizations SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new AppError('Organization not found', 404);
  }

  res.json({
    success: true,
    data: { organization: result.rows[0] },
  });
};
