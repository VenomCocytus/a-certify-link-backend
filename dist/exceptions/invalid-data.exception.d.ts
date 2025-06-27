import { BaseException } from './base.exception';
import { ErrorCodes } from "@/constants/error-codes";
/**
 * Exception thrown when invalid data is encountered
 * Maps to HTTP 422 Unprocessable Entity
 */
export declare class InvalidDataError extends BaseException {
    readonly errors: Record<string, string[]>;
    readonly context?: string | undefined;
    constructor(message: string, code?: ErrorCodes, statusCode?: number, errors?: Record<string, string[]>, context?: string | undefined);
}
//# sourceMappingURL=invalid-data.exception.d.ts.map