import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import {validate, ValidationError} from 'class-validator';
import {plainToInstance} from 'class-transformer';
import { ValidationException } from '@exceptions/validation.exception';
import { logger } from '@utils/logger';

// Joi validation middleware
export const validateJoi = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            logger.warn('Joi validation failed', {
                url: req.originalUrl,
                errors: error.details,
                body: req.body,
            });

            const validationException = ValidationException.fromJoiError(error, req.originalUrl);
            next(validationException);
            return;
        }

        // Replace the request body with validated data
        req.body = value;
        next();
    };
};

// Class-validator validation middleware
export const validateDto = <T extends object>(DtoClass: new () => T) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Transform a plain object to a class instance
            const dto = plainToInstance(DtoClass, req.body);

            // Validate the DTO
            const errors: ValidationError[] = await validate(dto);

            if (errors.length > 0) {
                const validationErrors: Record<string, string> = {};

                errors.forEach(error => {
                    if (error.constraints) {
                        validationErrors[error.property] = Object.values(error.constraints)[0];
                    }
                });

                logger.warn('Class-validator validation failed', {
                    url: req.originalUrl,
                    errors: validationErrors,
                    body: req.body,
                });

                const validationException = new ValidationException(
                    'Validation Error',
                    { validationErrors },
                    req.originalUrl
                );

                next(validationException);
                return;
            }

            // Replace the request body with validated DTO
            req.body = dto;
            next();
        } catch (error) {
            logger.error('Validation middleware error:', error);
            next(error);
        }
    };
};

// Query parameter validation middleware
export const validateQuery = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            logger.warn('Query validation failed', {
                url: req.originalUrl,
                errors: error.details,
                query: req.query,
            });

            const validationException = ValidationException.fromJoiError(error, req.originalUrl);
            next(validationException);
            return;
        }

        // Replace request query with validated data
        req.query = value;
        next();
    };
};