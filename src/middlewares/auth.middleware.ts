import { Response, NextFunction } from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import { UserModel } from '@models/user.model';
import { RoleModel } from '@models/role.model';
import { Environment } from '@config/environment';
import { logger } from '@utils/logger';
import {AuthenticatedRequest} from "@interfaces/common.interfaces";

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
        const decoded = jwt.verify(token, Environment.JWT_SECRET as string) as JwtPayload;

        // Ensure it's an access token
        if (decoded.type !== 'access') {
            res.status(401).json({
                type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
                title: 'Authentication Error',
                status: 401,
                detail: 'Invalid token type',
                instance: req.originalUrl,
            });
            return;
        }

        // Fetch user from the database to ensure the account is still active
        const user = await UserModel.findByPk(decoded.userId, {
            include: [{
                model: RoleModel,
                as: 'role',
                attributes: ['id', 'name', 'permissions']
            }]
        });

        if (!user || !user.isActive) {
            res.status(401).json({
                type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
                title: 'Authentication Failed',
                status: 401,
                detail: 'User account is inactive or not found',
                instance: req.originalUrl,
            });
            return;
        }

        // Check if the account is locked
        if (user.isAccountLocked) {
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
            firstName: user.firstName,
            lastName: user.lastName,
            roleId: user.roleId,
            role: {
                id: (user as any).role?.id || user.roleId,
                name: (user as any).role?.name || 'USER',
                permissions: (user as any).role?.permissions || []
            },
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            twoFactorEnabled: user.twoFactorEnabled
        };

        logger.debug('User authenticated successfully', {
            userId: user.id,
            email: user.email,
            role: req.user.role?.name,
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

        const userPermissions = req.user.role?.permissions || [];
        const hasRequiredPermissions = requiredPermissions.every(permission =>
            userPermissions.includes(permission) || req.user!.role?.name === 'SUPER_ADMIN'
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

        if (!allowedRoles.includes(<string>req.user.role?.name)) {
            res.status(403).json({
                type: 'https://tools.ietf.org/html/rfc7231#section-6.5.3',
                title: 'Insufficient Role',
                status: 403,
                detail: 'User role is not authorized to access this resource',
                instance: req.originalUrl,
                allowedRoles,
                userRole: req.user.role?.name,
            });
            return;
        }

        next();
    };
};

// Email verification middleware
export const requireEmailVerification = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

    if (!req.user.isEmailVerified) {
        res.status(403).json({
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.3',
            title: 'Email Verification Required',
            status: 403,
            detail: 'Email address must be verified to access this resource',
            instance: req.originalUrl,
        });
        return;
    }

    next();
};

// Optional authentication middleware (doesn't fail if no token provided)
export const optionalAuthMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without authentication
            next();
            return;
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, Environment.JWT_SECRET as string) as JwtPayload;

        if (decoded.type === 'access') {
            const user = await UserModel.findByPk(decoded.userId, {
                include: [{
                    model: RoleModel,
                    as: 'role',
                    attributes: ['id', 'name', 'permissions']
                }]
            });

            if (user && user.isActive && !user.isAccountLocked) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    roleId: user.roleId,
                    role: {
                        id: (user as any).role?.id || user.roleId,
                        name: (user as any).role?.name || 'USER',
                        permissions: (user as any).role?.permissions || []
                    },
                    isActive: user.isActive,
                    isEmailVerified: user.isEmailVerified,
                    twoFactorEnabled: user.twoFactorEnabled
                };
            }
        }

        next();
    } catch (error) {
        // Token is invalid, but continue without authentication
        next();
    }
};