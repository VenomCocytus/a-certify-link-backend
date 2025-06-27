import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';
import { ValidationError as ClassValidatorError } from 'class-validator';
import { BaseException } from '@exceptions/base.exception';
import { ValidationException } from '@exceptions/validation.exception';
import { logger } from '@utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { ErrorResponse } from '@/interfaces/common.interfaces';

export const globalExceptionHandlerMiddleware = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const traceId = uuidv4();
    const timestamp = new Date().toISOString();
    const instance = req.originalUrl;

    // Log error details
    logger.error('Global exception handler caught error:', {
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
            userId: (req as any).user?.id,
        },
    });

    let errorResponse: ErrorResponse;

    // Handle custom exceptions
    if (error instanceof BaseException) {
        const problemDetails = error.toProblemDetails();
        errorResponse = {
            ...problemDetails,
            traceId,
            timestamp,
            instance,
        };
    }

    // Handle validation exceptions
    else if (error instanceof ValidationException) {
        const problemDetails = error.toProblemDetails();
        errorResponse = {
            ...problemDetails,
            traceId,
            timestamp,
            instance,
        };
    }

    // Handle class-validator validation errors
    else if (Array.isArray(error) && error[0] instanceof ClassValidatorError) {
        const validationErrors = error.reduce((acc: Record<string, string>, err: ClassValidatorError) => {
            if (err.constraints) {
                acc[err.property] = Object.values(err.constraints).join(', ');
            }
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

    // Handle Sequelize validation errors
    else if (error instanceof ValidationError) {
        const validationErrors = error.errors.reduce((acc: Record<string, string>, err) => {
            acc[err.path || 'unknown'] = err.message;
            return acc;
        }, {});

        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
            title: 'Database Validation Error',
            status: 400,
            detail: 'The request contains invalid data for the database',
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
    else if (error.name === 'NotBeforeError') {
        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
            title: 'Authentication Error',
            status: 401,
            detail: 'Authentication token is not active yet',
            instance,
            traceId,
            timestamp,
        };
    }

    // Handle bcrypt errors
    else if (error.name === 'Error' && error.message.includes('bcrypt')) {
        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
            title: 'Password Processing Error',
            status: 500,
            detail: 'Password processing failed',
            instance,
            traceId,
            timestamp,
        };
    }

    // Handle Sequelize database errors
    else if (error.name === 'SequelizeConnectionError') {
        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.6.3',
            title: 'Database Connection Error',
            status: 503,
            detail: 'Unable to connect to the database',
            instance,
            traceId,
            timestamp,
        };
    }
    else if (error.name === 'SequelizeTimeoutError') {
        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.6.4',
            title: 'Database Timeout Error',
            status: 504,
            detail: 'Database operation timed out',
            instance,
            traceId,
            timestamp,
        };
    }
    else if (error.name === 'SequelizeUniqueConstraintError') {
        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.8',
            title: 'Duplicate Data Error',
            status: 409,
            detail: 'The data you are trying to create already exists',
            instance,
            traceId,
            timestamp,
        };
    }
    else if (error.name === 'SequelizeForeignKeyConstraintError') {
        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
            title: 'Foreign Key Constraint Error',
            status: 400,
            detail: 'The operation violates a foreign key constraint',
            instance,
            traceId,
            timestamp,
        };
    }

    // Handle network errors
    else if (error.name === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.6.3',
            title: 'Service Unavailable',
            status: 503,
            detail: 'Connection to external service was refused',
            instance,
            traceId,
            timestamp,
        };
    }
    else if (error.name === 'ENOTFOUND' || error.message?.includes('ENOTFOUND')) {
        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.6.3',
            title: 'Service Unavailable',
            status: 503,
            detail: 'External service could not be found',
            instance,
            traceId,
            timestamp,
        };
    }
    else if (error.name === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.6.4',
            title: 'Request Timeout',
            status: 504,
            detail: 'The request timed out',
            instance,
            traceId,
            timestamp,
        };
    }

    // Handle axios/HTTP client errors
    else if ((error as any).isAxiosError) {
        const axiosError = error as any;
        const status = axiosError.response?.status || 503;

        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.6.3',
            title: 'External Service Error',
            status: status >= 500 ? 503 : status,
            detail: axiosError.response?.data?.message || 'External service request failed',
            instance,
            traceId,
            timestamp,
            externalService: axiosError.config?.baseURL || 'unknown',
        };
    }

    // Handle rate limiting errors
    else if (error.message === 'Too many requests' || error.name === 'TooManyRequestsError') {
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

    // Handle multer file upload errors
    else if (error.name === 'MulterError') {
        const multerError = error as any;
        let detail: string;

        switch (multerError.code) {
            case 'LIMIT_FILE_SIZE':
                detail = 'File size is too large';
                break;
            case 'LIMIT_FILE_COUNT':
                detail = 'Too many files uploaded';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                detail = 'Unexpected file field';
                break;
            default:
                detail = multerError.message || 'File upload failed';
        }

        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
            title: 'File Upload Error',
            status: 400,
            detail,
            instance,
            traceId,
            timestamp,
        };
    }

    // Handle ASACI service specific errors
    else if (error.message?.includes('ASACI') || error.name?.includes('Asaci')) {
        errorResponse = {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.6.3',
            title: 'ASACI Service Error',
            status: 503,
            detail: 'ASACI service is currently unavailable',
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

        // Log stack trace for unknown errors in development
        if (process.env.NODE_ENV !== 'production') {
            logger.error('Unhandled exception details:', {
                traceId,
                stack: error.stack,
                errorName: error.name,
                errorMessage: error.message
            });
        }
    }

    // Set appropriate headers
    res.set({
        'Content-Type': 'application/problem+json',
        'X-Trace-ID': traceId,
    });

    // Don't call next() after sending response
    res.status(errorResponse.status).json(errorResponse);
};