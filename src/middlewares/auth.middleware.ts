import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@/models';
import { Environment } from '@config/environment';
import { logger } from '@utils/logger';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        companyCode?: string;
        agentCode?: string;
        permissions: string[];
    };
}

interface JwtPayload {
    id: string;
    email: string;
    role: string;
    companyCode?: string;
    agentCode?: string;
    permissions: string[];
    iat: number;
    exp: number;
}

export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
                title: 'Authentication Required',
                status: 401,
                detail: 'No valid authentication token provided',
                instance: req.originalUrl,
            });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify JWT token
        const decoded = jwt.verify(token, Environment.JWT_SECRET) as JwtPayload;

        // Fetch user from database to ensure account is still active
        const user = await User.findByPk(decoded.id);

        if (!user || !user.is_active) {
            res.status(401).json({
                type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
                title: 'Authentication Failed',
                status: 401,
                detail: 'User account is inactive or not found',
                instance: req.originalUrl,
            });
            return;
        }

        // Check if account is locked
        if (user.locked_until && user.locked_until > new Date()) {
            res.status(423).json({
                type: 'https://tools.ietf.org/html/rfc4918#section-11.3',
                title: 'Account Locked',
                status: 423,
                detail: 'Account is temporarily locked due to too many failed login attempts',
                instance: req.originalUrl,
            });
            return;
        }

        // Attach user information to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            companyCode: user.company_code || undefined,
            agentCode: user.agent_code || undefined,
            permissions: user.permissions || [],
        };

        logger.debug('User authenticated successfully', {
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
                title: 'Authentication Error',
                status: 401,
                detail: 'Invalid authentication token',
                instance: req.originalUrl,
            });
            return;
        }

        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
                title: 'Authentication Error',
                status: 401,
                detail: 'Authentication token has expired',
                instance: req.originalUrl,
            });
            return;
        }

        logger.error('Authentication middleware error:', error);
        next(error);
    }
};

// Permission checking middleware
export const requirePermissions = (requiredPermissions: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
                title: 'Authentication Required',
                status: 401,
                detail: 'User must be authenticated to access this resource',
                instance: req.originalUrl,
            });
            return;
        }

        const userPermissions = req.user.permissions || [];
        const hasRequiredPermissions = requiredPermissions.every(permission =>
            userPermissions.includes(permission) || req.user!.role === 'admin'
        );

        if (!hasRequiredPermissions) {
            res.status(403).json({
                type: 'https://tools.ietf.org/html/rfc7231#section-6.5.3',
                title: 'Insufficient Permissions',
                status: 403,
                detail: 'User does not have the required permissions to access this resource',
                instance: req.originalUrl,
                requiredPermissions,
                userPermissions: userPermissions,
            });
            return;
        }

        next();
    };
};

// Role checking middleware
export const requireRoles = (allowedRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
                title: 'Authentication Required',
                status: 401,
                detail: 'User must be authenticated to access this resource',
                instance: req.originalUrl,
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                type: 'https://tools.ietf.org/html/rfc7231#section-6.5.3',
                title: 'Insufficient Role',
                status: 403,
                detail: 'User role is not authorized to access this resource',
                instance: req.originalUrl,
                allowedRoles,
                userRole: req.user.role,
            });
            return;
        }

        next();
    };
};