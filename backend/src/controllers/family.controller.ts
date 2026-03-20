import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query, transaction } from '../db';
import { AppError } from '../middleware/errorHandler';
import { BatchInviteInput } from '../validators/family.validator';
import { hashPassword } from '../utils/password';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_PASSWORD = 'password123';

export const batchInvite = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  // Only staff/facility_admin can send invitations
  if (req.user.role !== 'staff' && req.user.role !== 'facility_admin' && req.user.role !== 'platform_admin') {
    throw new AppError('Access denied', 403);
  }

  const data: BatchInviteInput = req.body;

  // Verify resident exists and belongs to user's organization
  const resident = await query(
    'SELECT id, organization_id, name FROM residents WHERE id = $1',
    [data.resident_id]
  );

  if (resident.rows.length === 0) {
    throw new AppError('Resident not found', 404);
  }

  if (req.user.organization_id !== resident.rows[0].organization_id) {
    throw new AppError('Access denied', 403);
  }

  const connections = await transaction(async (client) => {
    const createdConnections = [];

    for (const contact of data.contacts) {
      // Check if user already exists
      let userResult = await client.query('SELECT id FROM users WHERE email = $1', [contact.email]);
      let userId: string;

      if (userResult.rows.length === 0) {
        // Create user account
        const passwordHash = await hashPassword(DEFAULT_PASSWORD);
        const newUser = await client.query(
          `INSERT INTO users (email, name, role, password_hash)
           VALUES ($1, $2, 'family', $3)
           RETURNING id`,
          [contact.email, contact.name, passwordHash]
        );
        userId = newUser.rows[0].id;
      } else {
        userId = userResult.rows[0].id;
      }

      // Create or update family connection (we can't use ON CONFLICT without a unique constraint)
      const inviteToken = uuidv4();

      const existingConnection = await client.query(
        `SELECT id FROM family_connections WHERE resident_id = $1 AND user_id = $2`,
        [data.resident_id, userId]
      );

      let connectionResult;
      if (existingConnection.rows.length > 0) {
        connectionResult = await client.query(
          `UPDATE family_connections
           SET relationship = $1, invite_token = $2, invite_status = 'ACTIVE', connected_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
           WHERE id = $3
           RETURNING *`,
          [contact.relationship, inviteToken, existingConnection.rows[0].id]
        );
      } else {
        connectionResult = await client.query(
          `INSERT INTO family_connections (resident_id, user_id, relationship, invite_token, invite_status, connected_at)
           VALUES ($1, $2, $3, $4, 'ACTIVE', CURRENT_TIMESTAMP)
           RETURNING *`,
          [data.resident_id, userId, contact.relationship, inviteToken]
        );
      }

      createdConnections.push(connectionResult.rows[0]);

      // Intentionally do NOT send invitation emails/links for now — DB only.
    }

    return createdConnections;
  });

  res.status(201).json({
    success: true,
    data: { connections },
  });
};

export const getFamilyConnections = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { resident_id } = req.query;

  let result;
  if (req.user.role === 'family') {
    // Family sees their own connections
    let queryStr = `
      SELECT fc.*, r.name as resident_name, u.email, u.name as user_name
      FROM family_connections fc
      JOIN residents r ON fc.resident_id = r.id
      JOIN users u ON fc.user_id = u.id
      WHERE fc.user_id = $1
    `;
    const params: any[] = [req.user.id];

    if (resident_id) {
      queryStr += ' AND fc.resident_id = $2';
      params.push(resident_id);
    }

    queryStr += ' ORDER BY fc.created_at DESC';
    result = await query(queryStr, params);
  } else if (req.user.role === 'staff' || req.user.role === 'facility_admin' || req.user.role === 'platform_admin') {
    // Staff/Admin see connections for residents in their organization
    if (!resident_id) {
      throw new AppError('resident_id is required', 400);
    }

    // Verify resident belongs to organization
    const resident = await query(
      'SELECT organization_id FROM residents WHERE id = $1',
      [resident_id]
    );

    if (resident.rows.length === 0) {
      throw new AppError('Resident not found', 404);
    }

    if (resident.rows[0].organization_id !== req.user.organization_id) {
      throw new AppError('Access denied', 403);
    }

    result = await query(
      `SELECT fc.*, u.email, u.name as user_name
       FROM family_connections fc
       JOIN users u ON fc.user_id = u.id
       WHERE fc.resident_id = $1
       ORDER BY fc.created_at DESC`,
      [resident_id]
    );
  } else {
    throw new AppError('Access denied', 403);
  }

  res.json({
    success: true,
    data: { connections: result.rows },
  });
};

export const acceptInvitation = async (req: AuthRequest, res: Response) => {
  const { token } = req.params;

  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const result = await query(
    `UPDATE family_connections
     SET invite_status = 'ACTIVE', connected_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE invite_token = $1 AND user_id = $2
     RETURNING *`,
    [token, req.user.id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invitation not found or already accepted', 404);
  }

  res.json({
    success: true,
    data: { connection: result.rows[0] },
  });
};
