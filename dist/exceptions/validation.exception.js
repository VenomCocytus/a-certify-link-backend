"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationException = void 0;
const base_exception_1 = require("./base.exception");
const errorCodes_1 = require("@/constants/errorCodes");
class ValidationException extends base_exception_1.BaseException {
    constructor(message, details, instance) {
        super(message, errorCodes_1.ErrorCodes.VALIDATION_ERROR, 400, details, instance);
    }
    static fromJoiError(error, instance) {
        const details = error.details?.reduce((acc, detail) => {
            acc[detail.path.join('.')] = detail.message;
            return acc;
        }, {});
        return new ValidationException('Validation failed', { validationErrors: details }, instance);
    }
    static fromClassValidatorErrors(errors, instance) {
        const details = errors.reduce((acc, error) => {
            if (error.constraints) {
                acc[error.property] = Object.values(error.constraints).join(', ');
            }
            return acc;
        }, {});
        return new ValidationException('Validation failed', { validationErrors: details }, instance);
    }
}
exports.ValidationException = ValidationException;
//# sourceMappingURL=validation.exception.js.map