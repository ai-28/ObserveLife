import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        organization_id?: string;
    };
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'No token provided',
            });
            return;
        }

        const token = authHeader.substring(7);
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(token, secret) as {
            userId: string;
            email: string;
            role: string;
            organization_id?: string;
        };

        // Verify user still exists
        const result = await query(
            'SELECT id, email, role, organization_id FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            res.status(401).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        req.user = {
            id: result.rows[0].id,
            email: result.rows[0].email,
            role: result.rows[0].role,
            organization_id: result.rows[0].organization_id || undefined,
        };

        next();
        return;
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                error: 'Invalid token',
            });
            return;
        }
        next(error);
        return;
    }
};

// Role-based access control
export const requireRole = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
            });
            return;
        }

        next();
        return;
    };
};
