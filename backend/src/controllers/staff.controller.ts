import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../db';
import { hashPassword } from '../utils/password';
import { CreateStaffInput } from '../validators/staff.validator';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new staff member
 * Only facility_admin can create staff members
 * The role parameter determines the user's role (staff or facility_admin)
 */
export const createStaff = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError('Not authenticated', 401);
    }

    // Only facility_admin can create staff
    if (req.user.role !== 'facility_admin') {
        throw new AppError('Only facility administrators can create staff members', 403);
    }

    // Must have an organization_id
    if (!req.user.organization_id) {
        throw new AppError('Organization ID is required', 400);
    }

    const { fullName, email, role, staffType, department }: CreateStaffInput = req.body;

    // Validate staffType for staff role
    if (role === 'staff' && !staffType) {
        throw new AppError('Staff type (facilitator or therapist) is required for staff role', 400);
    }

    // Check if user already exists
    const existingUser = await query('SELECT id, role FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
        throw new AppError('A user with this email already exists', 400);
    }

    // Generate a temporary password (user will need to reset on first login)
    const tempPassword = uuidv4().replace(/-/g, '').substring(0, 16);
    const passwordHash = await hashPassword(tempPassword);

    // Create the staff user
    const result = await query(
        `INSERT INTO users (email, password_hash, name, role, organization_id, staff_type, department)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, name, role, organization_id, staff_type, department, created_at`,
        [email, passwordHash, fullName, role, req.user.organization_id, staffType || null, department || null]
    );

    const newStaff = result.rows[0];

    // TODO: Send invitation email with temporary password
    // The email should include:
    // - Welcome message
    // - Temporary password
    // - Link to set up account
    // - Organization name

    res.status(201).json({
        success: true,
        data: {
            staff: {
                id: newStaff.id,
                email: newStaff.email,
                name: newStaff.name,
                role: newStaff.role,
                staff_type: newStaff.staff_type,
                department: newStaff.department,
                organization_id: newStaff.organization_id,
                created_at: newStaff.created_at,
            },
            // In production, don't send the temp password in the response
            // Instead, send it via email only
            tempPassword: tempPassword, // TODO: Remove this in production, send via email only
        },
    });
};

/**
 * Get all staff members for the organization
 * Only facility_admin can view staff list
 */
export const getStaff = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError('Not authenticated', 401);
    }

    // Only facility_admin can view staff
    if (req.user.role !== 'facility_admin') {
        throw new AppError('Only facility administrators can view staff members', 403);
    }

    if (!req.user.organization_id) {
        throw new AppError('Organization ID is required', 400);
    }

    // Get all staff members (only staff role, exclude facility_admin)
    const result = await query(
        `SELECT id, email, name, role, staff_type, department, created_at, updated_at
     FROM users
     WHERE organization_id = $1 
       AND role = 'staff'
     ORDER BY created_at DESC`,
        [req.user.organization_id]
    );

    res.json({
        success: true,
        data: {
            staff: result.rows,
        },
    });
};
