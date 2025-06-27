"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = exports.authLimiter = exports.certificateCreationLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("@utils/logger");
// Strict rate limiter for certificate creation
exports.certificateCreationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 certificate creations per minute
    message: {
        type: 'https://tools.ietf.org/html/rfc6585#section-4',
        title: 'Certificate Creation Rate Limit Exceeded',
        status: 429,
        detail: 'Too many certificate creation requests, please slow down.',
    },
    keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise IP
        return req.user?.id || req.ip;
    },
    handler: (req, res) => {
        logger_1.logger.warn('Certificate creation rate limit exceeded', {
            ip: req.ip,
            userId: req.user?.id,
            url: req.originalUrl,
        });
        res.status(429).json({
            type: 'https://tools.ietf.org/html/rfc6585#section-4',
            title: 'Certificate Creation Rate Limit Exceeded',
            status: 429,
            detail: 'Too many certificate creation requests, please slow down.',
            instance: req.originalUrl,
        });
    },
});
// Auth rate limiter for login attempts
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    skipSuccessfulRequests: true,
    message: {
        type: 'https://tools.ietf.org/html/rfc6585#section-4',
        title: 'Too Many Login Attempts',
        status: 429,
        detail: 'Too many failed login attempts, please try again later.',
    },
    handler: (req, res) => {
        logger_1.logger.warn('Auth rate limit exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            email: req.body?.email,
        });
        res.status(429).json({
            type: 'https://tools.ietf.org/html/rfc6585#section-4',
            title: 'Too Many Login Attempts',
            status: 429,
            detail: 'Too many failed login attempts, please try again later.',
            instance: req.originalUrl,
        });
    },
});
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        type: 'https://tools.ietf.org/html/rfc6585#section-4',
        title: 'Rate Limit Exceeded',
        status: 429,
        detail: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rate-limiter.middleware.js.map