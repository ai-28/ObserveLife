import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query, transaction } from '../db';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { RegisterInput, LoginInput, UpdateMeInput } from '../validators/auth.validator';
import { AppError } from '../middleware/errorHandler';

const DEFAULT_PASSWORD = 'password123';

export const register = async (req: AuthRequest, res: Response) => {
  const {
    email,
    password,
    name,
    role,
    organization_id,
    organizationName,
    organizationType,
    organizationAddress,
  }: RegisterInput = req.body;

  // Check if user exists
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new AppError('Email already registered', 400);
  }

  // Hash password
  // For facility_admin, resident, and family, we force a default password for now.
  const passwordToUse =
    role === 'facility_admin' || role === 'resident' || role === 'family'
      ? DEFAULT_PASSWORD
      : password;
  const passwordHash = await hashPassword(passwordToUse);

  let finalOrganizationId = organization_id || null;

  // For facility_admin, create organization first
  if (role === 'facility_admin') {
    if (!organizationName || !organizationType) {
      throw new AppError('Organization name and type are required for facility admin registration', 400);
    }

    // Create organization within a transaction
    const orgResult = await transaction(async (client) => {
      // Create organization
      const orgInsert = await client.query(
        `INSERT INTO organizations (name, type, address)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [organizationName, organizationType, organizationAddress || null]
      );

      const newOrgId = orgInsert.rows[0].id;

      // Create facility admin user
      const userInsert = await client.query(
        `INSERT INTO users (email, password_hash, name, role, organization_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, name, role, organization_id`,
        [email, passwordHash, name, role, newOrgId]
      );

      return {
        user: userInsert.rows[0],
        organizationId: newOrgId,
      };
    });

    const user = orgResult.user;
    finalOrganizationId = orgResult.organizationId;

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
    });

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organization_id: user.organization_id,
        },
        token,
      },
    });
  }

  // For other roles, create user normally
  const result = await query(
    `INSERT INTO users (email, password_hash, name, role, organization_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, name, role, organization_id`,
    [email, passwordHash, name, role, finalOrganizationId]
  );

  const user = result.rows[0];

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    organization_id: user.organization_id,
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization_id: user.organization_id,
      },
      token,
    },
  });
};

export const login = async (req: AuthRequest, res: Response) => {
  const { email, password }: LoginInput = req.body;

  // Find user
  const result = await query(
    'SELECT id, email, password_hash, name, role, organization_id FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid email or password', 401);
  }

  const user = result.rows[0];

  // Verify password
  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    organization_id: user.organization_id,
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization_id: user.organization_id,
      },
      token,
    },
  });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const result = await query(
    'SELECT id, email, name, role, organization_id, phone, timezone, notification_method, created_at FROM users WHERE id = $1',
    [req.user.id]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  const user = result.rows[0];
  delete user.password_hash;

  res.json({
    success: true,
    data: { user },
  });
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const data: UpdateMeInput = req.body;

  const updates: string[] = [];
  const values: any[] = [];
  let i = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${i++}`);
    values.push(data.name);
  }
  if (data.phone !== undefined) {
    updates.push(`phone = $${i++}`);
    values.push(data.phone);
  }
  if (data.timezone !== undefined) {
    updates.push(`timezone = $${i++}`);
    values.push(data.timezone);
  }
  if (data.notification_method !== undefined) {
    updates.push(`notification_method = $${i++}`);
    values.push(data.notification_method);
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  values.push(req.user.id);

  const result = await query(
    `UPDATE users
     SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${i}
     RETURNING id, email, name, role, organization_id, phone, timezone, notification_method, created_at`,
    values
  );

  res.json({
    success: true,
    data: { user: result.rows[0] },
  });
};
