import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query, transaction } from '../db';
import { AppError } from '../middleware/errorHandler';
import { hashPassword } from '../utils/password';
import { CreateResidentInput, CreateResidentWithUserInput, UpdateResidentInput } from '../validators/resident.validator';

const DEFAULT_PASSWORD = 'password123';

export const createResident = async (req: AuthRequest, res: Response) => {
  const data: CreateResidentInput = req.body;

  // RLS: Check if user has access to this organization
  if (req.user && req.user.organization_id !== data.organization_id && req.user.role !== 'platform_admin' && req.user.role !== 'facility_admin' && req.user.role !== 'staff') {
    throw new AppError('Access denied', 403);
  }

  const result = await query(
    `INSERT INTO residents (organization_id, name, room_number, care_type)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.organization_id, data.name, data.room_number || null, data.care_type]
  );

  // Update organization residents count
  await query(
    'UPDATE organizations SET residents_count = residents_count + 1 WHERE id = $1',
    [data.organization_id]
  );

  res.status(201).json({
    success: true,
    data: { resident: result.rows[0] },
  });
};

export const createResidentWithUser = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const data: CreateResidentWithUserInput = req.body;

  // Only staff/facility_admin can do this, and only within their org
  if (req.user.role !== 'staff' && req.user.role !== 'facility_admin' && req.user.role !== 'platform_admin') {
    throw new AppError('Access denied', 403);
  }

  if (req.user.organization_id !== data.organization_id && req.user.role !== 'platform_admin') {
    throw new AppError('Access denied', 403);
  }

  // Ensure email not already registered
  const existing = await query('SELECT id FROM users WHERE email = $1', [data.email]);
  if (existing.rows.length > 0) {
    throw new AppError('Email already registered', 400);
  }

  // Generate temporary password
  const tempPassword = DEFAULT_PASSWORD;
  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  const result = await transaction(async (client) => {
    const userInsert = await client.query(
      `INSERT INTO users (email, password_hash, name, role, organization_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, organization_id`,
      [data.email, passwordHash, data.name, 'resident', data.organization_id]
    );

    const user = userInsert.rows[0];

    const residentInsert = await client.query(
      `INSERT INTO residents (organization_id, user_id, name, room_number, care_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.organization_id, user.id, data.name, data.room_number || null, data.care_type]
    );

    await client.query(
      'UPDATE organizations SET residents_count = residents_count + 1 WHERE id = $1',
      [data.organization_id]
    );

    return { user, resident: residentInsert.rows[0] };
  });

  res.status(201).json({
    success: true,
    data: {
      resident: result.resident,
      user: result.user,
      temp_password: tempPassword,
    },
  });
};

export const getResidents = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  let result;

  // Check role first, then organization
  if (req.user.role === 'resident') {
    // Resident can see their own profile (even if no resident record exists yet)
    result = await query(
      `SELECT r.*, o.name as organization_name
       FROM residents r
       LEFT JOIN organizations o ON r.organization_id = o.id
       WHERE r.user_id = $1`,
      [req.user.id]
    );
    // Return empty array if no resident record linked yet (don't throw error)
  }
  // Staff/Facility Admin with organization_id see their organization's residents
  else if ((req.user.role === 'staff' || req.user.role === 'facility_admin') && req.user.organization_id) {
    result = await query(
      `SELECT r.*, o.name as organization_name
       FROM residents r
       JOIN organizations o ON r.organization_id = o.id
       WHERE r.organization_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.organization_id]
    );
  }
  // Staff/Facility Admin without organization_id - return empty array (they need to be assigned to an org)
  else if (req.user.role === 'staff' || req.user.role === 'facility_admin') {
    result = { rows: [] };
  }
  // Family members can't list all residents
  else {
    throw new AppError(
      `Access denied. Your role is '${req.user.role}'. Only staff, facility_admin, platform_admin, or residents can access this endpoint.`,
      403
    );
  }

  res.json({
    success: true,
    data: { residents: result.rows },
  });
};

export const getResident = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query(
    `SELECT r.*, o.name as organization_name
     FROM residents r
     JOIN organizations o ON r.organization_id = o.id
     WHERE r.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Resident not found', 404);
  }

  const resident = result.rows[0];

  // RLS: Check access
  if (req.user) {
    if (req.user.role === 'staff' || req.user.role === 'facility_admin' || req.user.role === 'platform_admin') {
      if (req.user.organization_id !== resident.organization_id) {
        throw new AppError('Access denied', 403);
      }
    } else if (req.user.role === 'family') {
      // Check if family member is connected
      const connection = await query(
        'SELECT id FROM family_connections WHERE resident_id = $1 AND user_id = $2 AND invite_status = $3',
        [id, req.user.id, 'ACTIVE']
      );
      if (connection.rows.length === 0) {
        throw new AppError('Access denied', 403);
      }
    } else if (req.user.role === 'resident') {
      // Resident can only see their own profile
      if (req.user.id !== resident.user_id) {
        throw new AppError('Access denied', 403);
      }
    }
  }

  res.json({
    success: true,
    data: { resident },
  });
};

export const updateResident = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data: UpdateResidentInput = req.body;

  // Check access
  const resident = await query('SELECT organization_id FROM residents WHERE id = $1', [id]);
  if (resident.rows.length === 0) {
    throw new AppError('Resident not found', 404);
  }

  if (req.user && req.user.organization_id !== resident.rows[0].organization_id && req.user.role !== 'platform_admin' && req.user.role !== 'facility_admin') {
    throw new AppError('Access denied', 403);
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.name) {
    updates.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.room_number !== undefined) {
    updates.push(`room_number = $${paramCount++}`);
    values.push(data.room_number);
  }
  if (data.status) {
    updates.push(`status = $${paramCount++}`);
    values.push(data.status);
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  values.push(id);
  const result = await query(
    `UPDATE residents SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );

  res.json({
    success: true,
    data: { resident: result.rows[0] },
  });
};
