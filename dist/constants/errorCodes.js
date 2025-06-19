"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessages = exports.ErrorCodes = void 0;
var ErrorCodes;
(function (ErrorCodes) {
    // General errors
    ErrorCodes["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorCodes["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCodes["INVALID_DATA"] = "INVALID_DATA";
    ErrorCodes["NOT_FOUND"] = "NOT_FOUND";
    ErrorCodes["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCodes["FORBIDDEN"] = "FORBIDDEN";
    ErrorCodes["CONFLICT"] = "CONFLICT";
    // Certificate specific errors
    ErrorCodes["CERTIFICATE_NOT_FOUND"] = "CERTIFICATE_NOT_FOUND";
    ErrorCodes["CERTIFICATE_ALREADY_EXISTS"] = "CERTIFICATE_ALREADY_EXISTS";
    ErrorCodes["CERTIFICATE_CREATION_FAILED"] = "CERTIFICATE_CREATION_FAILED";
    ErrorCodes["CERTIFICATE_INVALID_STATUS"] = "CERTIFICATE_INVALID_STATUS";
    ErrorCodes["CERTIFICATE_OPERATION_NOT_ALLOWED"] = "CERTIFICATE_OPERATION_NOT_ALLOWED";
    // External API errors
    ErrorCodes["ORASS_CONNECTION_ERROR"] = "ORASS_CONNECTION_ERROR";
    ErrorCodes["ORASS_AUTHENTICATION_ERROR"] = "ORASS_AUTHENTICATION_ERROR";
    ErrorCodes["ORASS_DATA_NOT_FOUND"] = "ORASS_DATA_NOT_FOUND";
    ErrorCodes["IVORY_ATTESTATION_CONNECTION_ERROR"] = "IVORY_ATTESTATION_CONNECTION_ERROR";
    ErrorCodes["IVORY_ATTESTATION_AUTHENTICATION_ERROR"] = "IVORY_ATTESTATION_AUTHENTICATION_ERROR";
    ErrorCodes["IVORY_ATTESTATION_CREATION_FAILED"] = "IVORY_ATTESTATION_CREATION_FAILED";
    ErrorCodes["IVORY_ATTESTATION_UPDATE_FAILED"] = "IVORY_ATTESTATION_UPDATE_FAILED";
    ErrorCodes["IVORY_ATTESTATION_DOWNLOAD_FAILED"] = "IVORY_ATTESTATION_DOWNLOAD_FAILED";
    ErrorCodes["IVORY_ATTESTATION_OPERATION_ERROR"] = "IVORY_ATTESTATION_OPERATION_ERROR";
    // Database errors
    ErrorCodes["DATABASE_CONNECTION_ERROR"] = "DATABASE_CONNECTION_ERROR";
    ErrorCodes["DATABASE_TRANSACTION_ERROR"] = "DATABASE_TRANSACTION_ERROR";
    ErrorCodes["DATABASE_CONSTRAINT_ERROR"] = "DATABASE_CONSTRAINT_ERROR";
    // Business logic errors
    ErrorCodes["DUPLICATE_OPERATION"] = "DUPLICATE_OPERATION";
    ErrorCodes["INVALID_OPERATION_STATE"] = "INVALID_OPERATION_STATE";
    ErrorCodes["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
})(ErrorCodes || (exports.ErrorCodes = ErrorCodes = {}));
exports.ErrorMessages = {
    [ErrorCodes.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred',
    [ErrorCodes.VALIDATION_ERROR]: 'The provided data is invalid',
    [ErrorCodes.INVALID_DATA]: 'Invalid data provided',
    [ErrorCodes.NOT_FOUND]: 'The requested resource was not found',
    [ErrorCodes.UNAUTHORIZED]: 'Authentication is required',
    [ErrorCodes.FORBIDDEN]: 'Access to this resource is forbidden',
    [ErrorCodes.CONFLICT]: 'The request conflicts with the current state',
    [ErrorCodes.CERTIFICATE_NOT_FOUND]: 'Certificate not found',
    [ErrorCodes.CERTIFICATE_ALREADY_EXISTS]: 'Certificate already exists',
    [ErrorCodes.CERTIFICATE_CREATION_FAILED]: 'Failed to create certificate',
    [ErrorCodes.CERTIFICATE_INVALID_STATUS]: 'Invalid certificate status',
    [ErrorCodes.CERTIFICATE_OPERATION_NOT_ALLOWED]: 'Operation not allowed for this certificate',
    [ErrorCodes.ORASS_CONNECTION_ERROR]: 'Failed to connect to Orass system',
    [ErrorCodes.ORASS_AUTHENTICATION_ERROR]: 'Orass authentication failed',
    [ErrorCodes.ORASS_DATA_NOT_FOUND]: 'Data not found in Orass system',
    [ErrorCodes.IVORY_ATTESTATION_CONNECTION_ERROR]: 'Failed to connect to IvoryAttestation system',
    [ErrorCodes.IVORY_ATTESTATION_AUTHENTICATION_ERROR]: 'IvoryAttestation authentication failed',
    [ErrorCodes.IVORY_ATTESTATION_CREATION_FAILED]: 'Failed to create attestation in IvoryAttestation',
    [ErrorCodes.IVORY_ATTESTATION_UPDATE_FAILED]: 'Failed to update attestation in IvoryAttestation',
    [ErrorCodes.IVORY_ATTESTATION_DOWNLOAD_FAILED]: 'Failed to download attestation from IvoryAttestation',
    [ErrorCodes.IVORY_ATTESTATION_OPERATION_ERROR]: 'Operation not allowed for IvoryAttestation',
    [ErrorCodes.DATABASE_CONNECTION_ERROR]: 'Database connection failed',
    [ErrorCodes.DATABASE_TRANSACTION_ERROR]: 'Database transaction failed',
    [ErrorCodes.DATABASE_CONSTRAINT_ERROR]: 'Database constraint violation',
    [ErrorCodes.DUPLICATE_OPERATION]: 'Duplicate operation detected',
    [ErrorCodes.INVALID_OPERATION_STATE]: 'Invalid state for this operation',
    [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
};
//# sourceMappingURL=errorCodes.js.map