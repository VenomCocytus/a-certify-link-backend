"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.requireEmailVerification = exports.requireRoles = exports.requirePermissions = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("@models/user.model");
const role_model_1 = require("@models/role.model");
const environment_1 = require("@config/environment");
const logger_1 = require("@utils/logger");
const authMiddleware = async (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.Environment.JWT_SECRET);
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
        const user = await user_model_1.UserModel.findByPk(decoded.userId, {
            include: [{
                    model: role_model_1.RoleModel,
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
                id: user.role?.id || user.roleId,
                name: user.role?.name || 'USER',
                permissions: user.role?.permissions || []
            },
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            twoFactorEnabled: user.twoFactorEnabled
        };
        logger_1.logger.debug('User authenticated successfully', {
            userId: user.id,
            email: user.email,
            role: req.user.role?.name,
        });
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
                title: 'Authentication Error',
                status: 401,
                detail: 'Invalid authentication token',
                instance: req.originalUrl,
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
                title: 'Authentication Error',
                status: 401,
                detail: 'Authentication token has expired',
                instance: req.originalUrl,
            });
            return;
        }
        logger_1.logger.error('Authentication middleware error:', error);
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
// Permission checking middleware
const requirePermissions = (requiredPermissions) => {
    return (req, res, next) => {
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
        const hasRequiredPermissions = requiredPermissions.every(permission => userPermissions.includes(permission) || req.user.role?.name === 'SUPER_ADMIN');
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
exports.requirePermissions = requirePermissions;
// Role checking middleware
const requireRoles = (allowedRoles) => {
    return (req, res, next) => {
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
        if (!allowedRoles.includes(req.user.role?.name)) {
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
exports.requireRoles = requireRoles;
// Email verification middleware
const requireEmailVerification = (req, res, next) => {
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
exports.requireEmailVerification = requireEmailVerification;
// Optional authentication middleware (doesn't fail if no token provided)
const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without authentication
            next();
            return;
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.Environment.JWT_SECRET);
        if (decoded.type === 'access') {
            const user = await user_model_1.UserModel.findByPk(decoded.userId, {
                include: [{
                        model: role_model_1.RoleModel,
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
                        id: user.role?.id || user.roleId,
                        name: user.role?.name || 'USER',
                        permissions: user.role?.permissions || []
                    },
                    isActive: user.isActive,
                    isEmailVerified: user.isEmailVerified,
                    twoFactorEnabled: user.twoFactorEnabled
                };
            }
        }
        next();
    }
    catch (error) {
        // Token is invalid, but continue without authentication
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
//# sourceMappingURL=auth.middleware.js.map