"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalApiException = void 0;
const base_exception_1 = require("./base.exception");
const error_codes_1 = require("@/constants/error-codes");
class ExternalApiException extends base_exception_1.BaseException {
    constructor(service, message, code, statusCode = 502, originalError, instance) {
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
    static ivoryAttestationConnectionError(originalError, instance) {
        return new ExternalApiException('IvoryAttestation', 'Failed to connect to IvoryAttestation system', error_codes_1.ErrorCodes.ASACI_CONNECTION_ERROR, 502, originalError, instance);
    }
    static ivoryAttestationAuthenticationError(instance) {
        return new ExternalApiException('IvoryAttestation', 'Authentication failed with IvoryAttestation system', error_codes_1.ErrorCodes.ASACI_AUTHENTICATION_FAILED, 401, undefined, instance);
    }
}
exports.ExternalApiException = ExternalApiException;
//# sourceMappingURL=external-api.exception.js.map