import { IdempotencyServiceInterface } from '@interfaces/serviceInterfaces';
export declare class IdempotencyService implements IdempotencyServiceInterface {
    /**
     * Process idempotent request
     */
    processIdempotentRequest<T>(key: string, requestHash: string, requestFn: () => Promise<T>): Promise<T>;
    /**
     * Get idempotency status
     */
    getIdempotencyStatus(key: string): Promise<{
        status: string;
        response?: unknown;
    } | null>;
    /**
     * Clean up expired keys
     */
    cleanupExpiredKeys(): Promise<number>;
    /**
     * Generate an idempotency key
     */
    generateIdempotencyKey(): string;
    private updateIdempotencyStatus;
}
//# sourceMappingURL=idempotency.service.d.ts.map