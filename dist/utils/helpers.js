"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helpers = void 0;
const uuid_1 = require("uuid");
class Helpers {
    /**
     * Generate a unique reference number for certificate requests
     */
    static generateReferenceNumber() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `REF${timestamp}${random}`;
    }
    /**
     * Generate UUID for idempotency keys
     */
    static generateIdempotencyKey() {
        return (0, uuid_1.v4)();
    }
    /**
     * Format date to YYYY-MM-DD format required by IvoryAttestation
     */
    static formatDateForIvory(date) {
        return date.toISOString().split('T')[0];
    }
    /**
     * Parse pagination parameters
     */
    static parsePaginationParams(query) {
        const page = Math.max(1, parseInt(String(query.page || 1), 10));
        const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || 10), 10)));
        const offset = (page - 1) * limit;
        return { page, limit, offset };
    }
    /**
     * Build pagination metadata
     */
    static buildPaginationMeta(totalItems, page, limit) {
        const totalPages = Math.ceil(totalItems / limit);
        return {
            totalItems,
            pageSize: limit,
            currentPage: page,
            totalPages,
            itemsPerPage: limit,
        };
    }
    /**
     * Sanitize sensitive data for logging
     */
    static sanitizeForLogging(data) {
        const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
        const sanitized = { ...data };
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });
        return sanitized;
    }
    /**
     * Validate email format
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * Validate a phone number format (simple validation)
     */
    static isValidPhoneNumber(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
    /**
     * Mask sensitive data for display
     */
    static maskSensitiveData(data, visibleChars = 4) {
        if (data.length <= visibleChars) {
            return '*'.repeat(data.length);
        }
        return data.substring(0, visibleChars) + '*'.repeat(data.length - visibleChars);
    }
}
exports.Helpers = Helpers;
//# sourceMappingURL=helpers.js.map