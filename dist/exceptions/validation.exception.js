"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationException = void 0;
const base_exception_1 = require("./base.exception");
const error_codes_1 = require("@/constants/error-codes");
class ValidationException extends base_exception_1.BaseException {
    constructor(message, details, instance) {
        super(message, error_codes_1.ErrorCodes.VALIDATION_ERROR, 400, details, instance);
    }
    static fromJoiError(error, instance) {
        const details = error.details?.reduce((acc, detail) => {
            acc[detail.path.join('.')] = detail.message;
            return acc;
        }, {});
        return new ValidationException('Validation failed', { validationErrors: details }, instance);
    }
}
exports.ValidationException = ValidationException;
//# sourceMappingURL=validation.exception.js.map