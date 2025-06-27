import {BaseException} from './base.exception';
import {ErrorCodes} from "@/constants/error-codes";

/**
 * Exception thrown when invalid data is encountered
 * Maps to HTTP 422 Unprocessable Entity
 */
export class InvalidDataError extends BaseException {
    constructor(
        message: string,
        code: ErrorCodes = ErrorCodes.INVALID_DATA,
        statusCode: number = 422,
        public readonly errors: Record<string, string[]> = {},
        public readonly context?: string
    ) {
        super(
            message,
            code,
            statusCode,
            errors,
        );

        this.name = ErrorCodes.INVALID_DATA.toLowerCase();
    }
}