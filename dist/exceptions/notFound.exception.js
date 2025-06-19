"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundException = void 0;
const base_exception_1 = require("./base.exception");
const errorCodes_1 = require("@/constants/errorCodes");
class NotFoundException extends base_exception_1.BaseException {
    constructor(resource, identifier, instance) {
        const message = identifier
            ? `${resource} with identifier '${identifier}' not found`
            : `${resource} not found`;
        super(message, errorCodes_1.ErrorCodes.NOT_FOUND, 404, { resource, identifier }, instance);
    }
}
exports.NotFoundException = NotFoundException;
//# sourceMappingURL=notFound.exception.js.map