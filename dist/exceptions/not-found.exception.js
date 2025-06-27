"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundException = void 0;
const base_exception_1 = require("./base.exception");
const error_codes_1 = require("@/constants/error-codes");
class NotFoundException extends base_exception_1.BaseException {
    constructor(resource, identifier, instance) {
        const message = identifier
            ? `${resource} with identifier '${identifier}' not found`
            : `${resource} not found`;
        super(message, error_codes_1.ErrorCodes.NOT_FOUND, 404, { resource, identifier }, instance);
    }
}
exports.NotFoundException = NotFoundException;
//# sourceMappingURL=not-found.exception.js.map