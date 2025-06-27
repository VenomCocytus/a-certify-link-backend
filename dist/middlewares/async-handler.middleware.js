"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandlerMiddleware = void 0;
const asyncHandlerMiddleware = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandlerMiddleware = asyncHandlerMiddleware;
//# sourceMappingURL=async-handler.middleware.js.map