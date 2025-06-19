export declare class Helpers {
    /**
     * Generate a unique reference number for certificate requests
     */
    static generateReferenceNumber(): string;
    /**
     * Generate UUID for idempotency keys
     */
    static generateIdempotencyKey(): string;
    /**
     * Format date to YYYY-MM-DD format required by IvoryAttestation
     */
    static formatDateForIvory(date: Date): string;
    /**
     * Parse pagination parameters
     */
    static parsePaginationParams(query: Record<string, unknown>): {
        page: number;
        limit: number;
        offset: number;
    };
    /**
     * Build pagination metadata
     */
    static buildPaginationMeta(totalItems: number, page: number, limit: number): {
        totalItems: number;
        pageSize: number;
        currentPage: number;
        totalPages: number;
        itemsPerPage: number;
    };
    /**
     * Sanitize sensitive data for logging
     */
    static sanitizeForLogging(data: Record<string, unknown>): Record<string, unknown>;
    /**
     * Validate email format
     */
    static isValidEmail(email: string): boolean;
    /**
     * Validate a phone number format (simple validation)
     */
    static isValidPhoneNumber(phone: string): boolean;
    /**
     * Mask sensitive data for display
     */
    static maskSensitiveData(data: string, visibleChars?: number): string;
}
//# sourceMappingURL=helpers.d.ts.map