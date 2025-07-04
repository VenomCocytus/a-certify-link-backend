"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = void 0;
var ErrorCodes;
(function (ErrorCodes) {
    // General Errors
    ErrorCodes["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorCodes["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCodes["NOT_FOUND"] = "NOT_FOUND";
    ErrorCodes["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCodes["FORBIDDEN"] = "FORBIDDEN";
    ErrorCodes["CONFLICT"] = "CONFLICT";
    ErrorCodes["BAD_REQUEST"] = "BAD_REQUEST";
    ErrorCodes["UNPROCESSABLE_ENTITY"] = "UNPROCESSABLE_ENTITY";
    ErrorCodes["TOO_MANY_REQUESTS"] = "TOO_MANY_REQUESTS";
    ErrorCodes["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    // Authentication & Authorization Errors
    ErrorCodes["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    ErrorCodes["INVALID_DATA"] = "INVALID_DATA";
    ErrorCodes["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    ErrorCodes["TOKEN_INVALID"] = "TOKEN_INVALID";
    ErrorCodes["TOKEN_MISSING"] = "TOKEN_MISSING";
    ErrorCodes["REFRESH_TOKEN_INVALID"] = "REFRESH_TOKEN_INVALID";
    ErrorCodes["INSUFFICIENT_PERMISSIONS"] = "INSUFFICIENT_PERMISSIONS";
    ErrorCodes["INSUFFICIENT_ROLE"] = "INSUFFICIENT_ROLE";
    ErrorCodes["TWO_FACTOR_REQUIRED"] = "TWO_FACTOR_REQUIRED";
    ErrorCodes["TWO_FACTOR_INVALID"] = "TWO_FACTOR_INVALID";
    ErrorCodes["EMAIL_VERIFICATION_REQUIRED"] = "EMAIL_VERIFICATION_REQUIRED";
    // User Account Errors
    ErrorCodes["USER_NOT_FOUND"] = "USER_NOT_FOUND";
    ErrorCodes["USER_ALREADY_EXISTS"] = "USER_ALREADY_EXISTS";
    ErrorCodes["ACCOUNT_DEACTIVATED"] = "ACCOUNT_DEACTIVATED";
    ErrorCodes["ACCOUNT_LOCKED"] = "ACCOUNT_LOCKED";
    ErrorCodes["ACCOUNT_BLOCKED"] = "ACCOUNT_BLOCKED";
    ErrorCodes["EMAIL_NOT_VERIFIED"] = "EMAIL_NOT_VERIFIED";
    ErrorCodes["INVALID_EMAIL_VERIFICATION_TOKEN"] = "INVALID_EMAIL_VERIFICATION_TOKEN";
    ErrorCodes["PASSWORD_RESET_TOKEN_INVALID"] = "PASSWORD_RESET_TOKEN_INVALID";
    ErrorCodes["PASSWORD_RESET_TOKEN_EXPIRED"] = "PASSWORD_RESET_TOKEN_EXPIRED";
    ErrorCodes["PASSWORD_RECENTLY_USED"] = "PASSWORD_RECENTLY_USED";
    ErrorCodes["CURRENT_PASSWORD_INCORRECT"] = "CURRENT_PASSWORD_INCORRECT";
    ErrorCodes["PASSWORD_CONFIRMATION_MISMATCH"] = "PASSWORD_CONFIRMATION_MISMATCH";
    // Role & Permission Errors
    ErrorCodes["ROLE_NOT_FOUND"] = "ROLE_NOT_FOUND";
    ErrorCodes["ROLE_ALREADY_EXISTS"] = "ROLE_ALREADY_EXISTS";
    ErrorCodes["PERMISSION_NOT_FOUND"] = "PERMISSION_NOT_FOUND";
    ErrorCodes["DEFAULT_ROLE_NOT_FOUND"] = "DEFAULT_ROLE_NOT_FOUND";
    // ASACI Service Errors
    ErrorCodes["ASACI_CONNECTION_ERROR"] = "ASACI_CONNECTION_ERROR";
    ErrorCodes["ASACI_AUTHENTICATION_FAILED"] = "ASACI_AUTHENTICATION_FAILED";
    ErrorCodes["ASACI_AUTHORIZATION_FAILED"] = "ASACI_AUTHORIZATION_FAILED";
    ErrorCodes["ASACI_SERVICE_UNAVAILABLE"] = "ASACI_SERVICE_UNAVAILABLE";
    ErrorCodes["ASACI_INVALID_RESPONSE"] = "ASACI_INVALID_RESPONSE";
    ErrorCodes["ASACI_REQUEST_TIMEOUT"] = "ASACI_REQUEST_TIMEOUT";
    ErrorCodes["ASACI_RATE_LIMIT_EXCEEDED"] = "ASACI_RATE_LIMIT_EXCEEDED";
    ErrorCodes["ASACI_QUOTA_EXCEEDED"] = "ASACI_QUOTA_EXCEEDED";
    // Certificate Errors
    ErrorCodes["CERTIFICATE_NOT_FOUND"] = "CERTIFICATE_NOT_FOUND";
    ErrorCodes["CERTIFICATE_ALREADY_CANCELLED"] = "CERTIFICATE_ALREADY_CANCELLED";
    ErrorCodes["CERTIFICATE_ALREADY_SUSPENDED"] = "CERTIFICATE_ALREADY_SUSPENDED";
    ErrorCodes["CERTIFICATE_INVALID_STATUS"] = "CERTIFICATE_INVALID_STATUS";
    ErrorCodes["CERTIFICATE_DOWNLOAD_FAILED"] = "CERTIFICATE_DOWNLOAD_FAILED";
    // Order Errors
    ErrorCodes["ORDER_NOT_FOUND"] = "ORDER_NOT_FOUND";
    ErrorCodes["ORDER_INVALID_STATUS"] = "ORDER_INVALID_STATUS";
    ErrorCodes["ORDER_CANNOT_BE_MODIFIED"] = "ORDER_CANNOT_BE_MODIFIED";
    ErrorCodes["ORDER_ALREADY_APPROVED"] = "ORDER_ALREADY_APPROVED";
    ErrorCodes["ORDER_ALREADY_REJECTED"] = "ORDER_ALREADY_REJECTED";
    ErrorCodes["ORDER_ALREADY_CANCELLED"] = "ORDER_ALREADY_CANCELLED";
    ErrorCodes["ORDER_QUANTITY_INVALID"] = "ORDER_QUANTITY_INVALID";
    // Transaction Errors
    ErrorCodes["TRANSACTION_NOT_FOUND"] = "TRANSACTION_NOT_FOUND";
    ErrorCodes["TRANSACTION_INVALID_STATUS"] = "TRANSACTION_INVALID_STATUS";
    ErrorCodes["TRANSACTION_CANNOT_BE_MODIFIED"] = "TRANSACTION_CANNOT_BE_MODIFIED";
    ErrorCodes["TRANSACTION_ALREADY_APPROVED"] = "TRANSACTION_ALREADY_APPROVED";
    ErrorCodes["TRANSACTION_ALREADY_REJECTED"] = "TRANSACTION_ALREADY_REJECTED";
    ErrorCodes["TRANSACTION_INSUFFICIENT_BALANCE"] = "TRANSACTION_INSUFFICIENT_BALANCE";
    // Production Errors
    ErrorCodes["PRODUCTION_NOT_FOUND"] = "PRODUCTION_NOT_FOUND";
    ErrorCodes["PRODUCTION_INVALID_STATUS"] = "PRODUCTION_INVALID_STATUS";
    ErrorCodes["PRODUCTION_DOWNLOAD_FAILED"] = "PRODUCTION_DOWNLOAD_FAILED";
    ErrorCodes["PRODUCTION_INVALID_DATA"] = "PRODUCTION_INVALID_DATA";
    // Organization & Office Errors
    ErrorCodes["ORGANIZATION_NOT_FOUND"] = "ORGANIZATION_NOT_FOUND";
    ErrorCodes["ORGANIZATION_ALREADY_EXISTS"] = "ORGANIZATION_ALREADY_EXISTS";
    ErrorCodes["ORGANIZATION_INACTIVE"] = "ORGANIZATION_INACTIVE";
    ErrorCodes["OFFICE_NOT_FOUND"] = "OFFICE_NOT_FOUND";
    ErrorCodes["OFFICE_ALREADY_EXISTS"] = "OFFICE_ALREADY_EXISTS";
    ErrorCodes["OFFICE_INACTIVE"] = "OFFICE_INACTIVE";
    // File & Upload Errors
    ErrorCodes["FILE_NOT_FOUND"] = "FILE_NOT_FOUND";
    ErrorCodes["FILE_TOO_LARGE"] = "FILE_TOO_LARGE";
    ErrorCodes["FILE_INVALID_TYPE"] = "FILE_INVALID_TYPE";
    ErrorCodes["FILE_UPLOAD_FAILED"] = "FILE_UPLOAD_FAILED";
    ErrorCodes["FILE_PROCESSING_FAILED"] = "FILE_PROCESSING_FAILED";
    // Database Errors
    ErrorCodes["DATABASE_CONNECTION_ERROR"] = "DATABASE_CONNECTION_ERROR";
    ErrorCodes["DATABASE_QUERY_ERROR"] = "DATABASE_QUERY_ERROR";
    ErrorCodes["DATABASE_CONSTRAINT_VIOLATION"] = "DATABASE_CONSTRAINT_VIOLATION";
    ErrorCodes["DATABASE_TIMEOUT"] = "DATABASE_TIMEOUT";
    // External Service Errors
    ErrorCodes["EXTERNAL_SERVICE_ERROR"] = "EXTERNAL_SERVICE_ERROR";
    ErrorCodes["EXTERNAL_SERVICE_TIMEOUT"] = "EXTERNAL_SERVICE_TIMEOUT";
    ErrorCodes["EXTERNAL_SERVICE_UNAVAILABLE"] = "EXTERNAL_SERVICE_UNAVAILABLE";
    // Configuration Errors
    ErrorCodes["CONFIGURATION_ERROR"] = "CONFIGURATION_ERROR";
    ErrorCodes["CONFIGURATION_MISSING"] = "CONFIGURATION_MISSING";
    ErrorCodes["CONFIGURATION_INVALID"] = "CONFIGURATION_INVALID";
    // Business Logic Errors
    ErrorCodes["BUSINESS_RULE_VIOLATION"] = "BUSINESS_RULE_VIOLATION";
    ErrorCodes["INVALID_OPERATION"] = "INVALID_OPERATION";
    ErrorCodes["OPERATION_NOT_ALLOWED"] = "OPERATION_NOT_ALLOWED";
    ErrorCodes["PRECONDITION_FAILED"] = "PRECONDITION_FAILED";
    // Network & Communication Errors
    ErrorCodes["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCodes["CONNECTION_TIMEOUT"] = "CONNECTION_TIMEOUT";
    ErrorCodes["CONNECTION_REFUSED"] = "CONNECTION_REFUSED";
    ErrorCodes["DNS_RESOLUTION_FAILED"] = "DNS_RESOLUTION_FAILED";
    // Cache & Session Errors
    ErrorCodes["CACHE_ERROR"] = "CACHE_ERROR";
    ErrorCodes["SESSION_EXPIRED"] = "SESSION_EXPIRED";
    ErrorCodes["SESSION_INVALID"] = "SESSION_INVALID";
    // Webhook & Integration Errors
    ErrorCodes["WEBHOOK_DELIVERY_FAILED"] = "WEBHOOK_DELIVERY_FAILED";
    ErrorCodes["WEBHOOK_INVALID_SIGNATURE"] = "WEBHOOK_INVALID_SIGNATURE";
    ErrorCodes["INTEGRATION_ERROR"] = "INTEGRATION_ERROR";
    ErrorCodes["API_VERSION_UNSUPPORTED"] = "API_VERSION_UNSUPPORTED";
})(ErrorCodes || (exports.ErrorCodes = ErrorCodes = {}));
//# sourceMappingURL=error-codes.js.map