import { ErrorCodes } from '@/constants/errorCodes';
export declare abstract class BaseException extends Error {
    readonly code: ErrorCodes;
    readonly statusCode: number;
    readonly details?: Record<string, unknown>;
    readonly instance?: string;
    constructor(message: string, code: ErrorCodes, statusCode: number, details?: Record<string, unknown>, instance?: string);
    /**
     * Convert exception to RFC 7807 Problem Details format
     */
    toProblemDetails(): {
        type: string;
        title: string;
        status: number;
        detail: string;
        instance?: string;
        [key: string]: unknown;
    };
}
//# sourceMappingURL=base.exception.d.ts.map