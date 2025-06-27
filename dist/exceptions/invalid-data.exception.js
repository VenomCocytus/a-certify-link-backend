"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDataError = void 0;
const base_exception_1 = require("./base.exception");
const error_codes_1 = require("@/constants/error-codes");
/**
 * Exception thrown when invalid data is encountered
 * Maps to HTTP 422 Unprocessable Entity
 */
class InvalidDataError extends base_exception_1.BaseException {
    constructor(message, code = error_codes_1.ErrorCodes.INVALID_DATA, statusCode = 422, errors = {}, context) {
        super(message, code, statusCode, errors);
        this.errors = errors;
        this.context = context;
        this.name = error_codes_1.ErrorCodes.INVALID_DATA.toLowerCase();
    }
}
exports.InvalidDataError = InvalidDataError;
//# sourceMappingURL=invalid-data.exception.js.map