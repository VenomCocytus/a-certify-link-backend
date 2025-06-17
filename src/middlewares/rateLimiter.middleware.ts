import rateLimit from 'express-rate-limit';
import { Environment } from '@config/environment';
import { logger } from '@utils/logger';

// General rate limiter
export const rateLimiterMiddleware = rateLimit({
    windowMs: Environment.RATE_LIMIT_WINDOW_MS, // 15 minutes
    max: Environment.RATE_LIMIT_MAX_REQUESTS, // limit each IP to 100 requests per windowMs
    message: {
        type: 'https://tools.ietf.org/html/rfc6585#section-4',
        title: 'Rate Limit Exceeded',
        status: 429,
        detail: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.originalUrl,
            userId: (req as any).user?.id,
        });

        res.status(429).json({
            type: 'https://tools.ietf.org/html/rfc6585#section-4',
            title: 'Rate Limit Exceeded',
            status: 429,
            detail: 'Too many requests from this IP, please try again later.',
            instance: req.originalUrl,
        });
    },
});

// Strict rate limiter for certificate creation
export const certificateCreationLimiter = rateLimit({
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
        return (req as any).user?.id || req.ip;
    },
    handler: (req, res) => {
        logger.warn('Certificate creation rate limit exceeded', {
            ip: req.ip,
            userId: (req as any).user?.id,
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
export const authLimiter = rateLimit({
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
        logger.warn('Auth rate limit exceeded', {
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