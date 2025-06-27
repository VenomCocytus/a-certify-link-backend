"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const validation_exception_1 = require("@exceptions/validation.exception");
const logger_1 = require("@utils/logger");
// Class-validator validation middleware
const validateDto = (DtoClass) => {
    return async (req, res, next) => {
        try {
            // Transform a plain object to a class instance
            const dto = (0, class_transformer_1.plainToInstance)(DtoClass, req.body);
            // Validate the DTO
            const errors = await (0, class_validator_1.validate)(dto);
            if (errors.length > 0) {
                const validationErrors = {};
                errors.forEach(error => {
                    if (error.constraints) {
                        validationErrors[error.property] = Object.values(error.constraints)[0];
                    }
                });
                logger_1.logger.warn('Class-validator validation failed', {
                    url: req.originalUrl,
                    errors: validationErrors,
                    body: req.body,
                });
                const validationException = new validation_exception_1.ValidationException('Validation Error', { validationErrors }, req.originalUrl);
                next(validationException);
                return;
            }
            // Replace the request body with validated DTO
            req.body = dto;
            next();
        }
        catch (error) {
            logger_1.logger.error('Validation middleware error:', error);
            next(error);
        }
    };
};
exports.validateDto = validateDto;
// Query parameter validation middleware
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            logger_1.logger.warn('Query validation failed', {
                url: req.originalUrl,
                errors: error.details,
                query: req.query,
            });
            const validationException = validation_exception_1.ValidationException.fromJoiError(error, req.originalUrl);
            next(validationException);
            return;
        }
        // Replace request query with validated data
        req.query = value;
        next();
    };
};
exports.validateQuery = validateQuery;
//# sourceMappingURL=validation.middleware.js.map