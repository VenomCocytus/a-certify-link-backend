import { BaseException } from './base.exception';
import { ErrorCodes } from '@/constants/errorCodes';
export declare class ExternalApiException extends BaseException {
    readonly service: string;
    readonly originalError?: Error;
    constructor(service: string, message: string, code: ErrorCodes, statusCode?: number, originalError?: Error, instance?: string);
    static orassConnectionError(originalError?: Error, instance?: string): ExternalApiException;
    static orassAuthenticationError(instance?: string): ExternalApiException;
    static ivoryAttestationConnectionError(originalError?: Error, instance?: string): ExternalApiException;
    static ivoryAttestationAuthenticationError(instance?: string): ExternalApiException;
}
//# sourceMappingURL=externalApi.exception.d.ts.map