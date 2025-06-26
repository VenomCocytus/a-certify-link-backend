import { BaseException } from './base.exception';
import { ErrorCodes } from '@/constants/error-codes';

export class ExternalApiException extends BaseException {
    public readonly service: string;
    public readonly originalError?: Error;

    constructor(
        service: string,
        message: string,
        code: ErrorCodes,
        statusCode: number = 502,
        originalError?: Error,
        instance?: string
    ) {
        super(message, code, statusCode, { service }, instance);
        this.service = service;
        this.originalError = originalError;
    }

    // static orassConnectionError(originalError?: Error, instance?: string): ExternalApiException {
    //     return new ExternalApiException(
    //         'Orass',
    //         'Failed to connect to Orass system',
    //         ErrorCodes.ORASS_CONNECTION_ERROR,
    //         502,
    //         originalError,
    //         instance
    //     );
    // }

    // static orassAuthenticationError(instance?: string): ExternalApiException {
    //     return new ExternalApiException(
    //         'Orass',
    //         'Authentication failed with Orass system',
    //         ErrorCodes.ORASS_AUTHENTICATION_ERROR,
    //         401,
    //         undefined,
    //         instance
    //     );
    // }

    static ivoryAttestationConnectionError(originalError?: Error, instance?: string): ExternalApiException {
        return new ExternalApiException(
            'IvoryAttestation',
            'Failed to connect to IvoryAttestation system',
            ErrorCodes.ASACI_CONNECTION_ERROR,
            502,
            originalError,
            instance
        );
    }

    static ivoryAttestationAuthenticationError(instance?: string): ExternalApiException {
        return new ExternalApiException(
            'IvoryAttestation',
            'Authentication failed with IvoryAttestation system',
            ErrorCodes.ASACI_AUTHENTICATION_FAILED,
            401,
            undefined,
            instance
        );
    }
}