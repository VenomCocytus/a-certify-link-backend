import { BaseException } from './base.exception';
import { ErrorCodes } from '@/constants/error-codes';
export declare class ExternalApiException extends BaseException {
    readonly service: string;
    readonly originalError?: Error;
    constructor(service: string, message: string, code: ErrorCodes, statusCode?: number, originalError?: Error, instance?: string);
    static ivoryAttestationConnectionError(originalError?: Error, instance?: string): ExternalApiException;
    static ivoryAttestationAuthenticationError(instance?: string): ExternalApiException;
}
//# sourceMappingURL=external-api.exception.d.ts.map