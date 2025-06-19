"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseException = void 0;
class BaseException extends Error {
    constructor(message, code, statusCode, details, instance) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.instance = instance;
        // Maintains a proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
    /**
     * Convert exception to RFC 7807 Problem Details format
     */
    toProblemDetails() {
        return {
            type: `https://example.com/errors/${this.code}`,
            title: this.name.replace(/([A-Z])/g, ' $1').trim(),
            status: this.statusCode,
            detail: this.message,
            instance: this.instance,
            code: this.code,
            ...(this.details && { details: this.details }),
        };
    }
}
exports.BaseException = BaseException;
//# sourceMappingURL=base.exception.js.map