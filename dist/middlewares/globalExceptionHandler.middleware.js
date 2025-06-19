"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalExceptionHandlerMiddleware = void 0;
const sequelize_1 = require("sequelize");
const base_exception_1 = require("@exceptions/base.exception");
const logger_1 = require("@utils/logger");
const uuid_1 = require("uuid");
const globalExceptionHandlerMiddleware = (error, req, res) => {
    const traceId = (0, uuid_1.v4)();
    const timestamp = new Date().toISOString();
    const instance = req.originalUrl;
    // Log error details
    logger_1.logger.error('Global exception handler caught error:', {
        traceId,
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
        },
        request: {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id,
        },
    });
    let errorResponse;
    // Handle custom exceptions
    if (error instanceof base_exception_1.BaseException) {
        const problemDetails = error.toProblemDetails();
        errorResponse = {
            ...problemDetails,
            traceId,
            timestamp,
            instance,
        };
    }
    // Handle Sequelize validation errors
    else if (error instanceof sequelize_1.ValidationError) {
        const validationErrors = error.errors.reduce((acc, err) => {
            acc[err.path || 'unknown'] = err.message;
            return acc;
        }, {});
        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
            title: 'Validation Error',
            status: 400,
            detail: 'The request contains invalid data',
            instance,
            traceId,
            timestamp,
            validationErrors,
        };
    }
    // Handle JWT errors
    else if (error.name === 'JsonWebTokenError') {
        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
            title: 'Authentication Error',
            status: 401,
            detail: 'Invalid or malformed authentication token',
            instance,
            traceId,
            timestamp,
        };
    }
    else if (error.name === 'TokenExpiredError') {
        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
            title: 'Authentication Error',
            status: 401,
            detail: 'Authentication token has expired',
            instance,
            traceId,
            timestamp,
        };
    }
    // Handle rate limiting errors
    else if (error.message === 'Too many requests') {
        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc6585#section-4',
            title: 'Rate Limit Exceeded',
            status: 429,
            detail: 'Too many requests. Please try again later.',
            instance,
            traceId,
            timestamp,
        };
    }
    // Handle unknown errors
    else {
        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
            title: 'Internal Server Error',
            status: 500,
            detail: process.env.NODE_ENV === 'production'
                ? 'An unexpected error occurred'
                : error.message,
            instance,
            traceId,
            timestamp,
        };
        // Log stack trace for unknown errors
        logger_1.logger.error('Unhandled exception:', {
            traceId,
            stack: error.stack,
        });
    }
    // Set appropriate headers
    res.set({
        'Content-Type': 'application/problem+json',
        'X-Trace-ID': traceId,
    });
    res.status(errorResponse.status).json(errorResponse);
};
exports.globalExceptionHandlerMiddleware = globalExceptionHandlerMiddleware;
//# sourceMappingURL=globalExceptionHandler.middleware.js.map