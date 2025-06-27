"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASACI_ENDPOINTS = void 0;
exports.validateEnvironment = validateEnvironment;
const logger_1 = require("@utils/logger");
const getRequiredEnvVar = (key) => {
    const value = process.env[key];
    if (!value || value.trim() === '') {
        throw new Error(`Missing required environment variable: ${key}. Please check your .env file.`);
    }
    return value.trim();
};
exports.ASACI_ENDPOINTS = {
    // Authentication endpoints
    AUTH_TOKENS: getRequiredEnvVar('ASACI_AUTH_TOKENS'),
    AUTH_OTP_VALIDATE: getRequiredEnvVar('ASACI_AUTH_OTP_VALIDATE'),
    AUTH_OTP_RESEND: getRequiredEnvVar('ASACI_AUTH_OTP_RESEND'),
    AUTH_FORGOT_PASSWORD: getRequiredEnvVar('ASACI_AUTH_FORGOT_PASSWORD'),
    AUTH_RESET_PASSWORD: getRequiredEnvVar('ASACI_AUTH_RESET_PASSWORD'),
    AUTH_WELCOME_SEND: getRequiredEnvVar('ASACI_AUTH_WELCOME_SEND'),
    AUTH_WELCOME_SET_PASSWORD: getRequiredEnvVar('ASACI_AUTH_WELCOME_SET_PASSWORD'),
    AUTH_USER: getRequiredEnvVar('ASACI_AUTH_USER'),
    AUTH_TOKENS_REVOKE: getRequiredEnvVar('ASACI_AUTH_TOKENS_REVOKE'),
    AUTH_EMAIL_VERIFICATION: getRequiredEnvVar('ASACI_AUTH_EMAIL_VERIFICATION'),
    AUTH_EMAIL_VERIFY: getRequiredEnvVar('ASACI_AUTH_EMAIL_VERIFY'),
    AUTH_BROWSER_SESSIONS: getRequiredEnvVar('ASACI_AUTH_BROWSER_SESSIONS'),
    AUTH_BROWSER_SESSIONS_LAST_ACTIVITY: getRequiredEnvVar('ASACI_AUTH_BROWSER_SESSIONS_LAST_ACTIVITY'),
    AUTH_LOGOUT_BROWSER_SESSIONS: getRequiredEnvVar('ASACI_AUTH_LOGOUT_BROWSER_SESSIONS'),
    AUTH_TOKENS_PRIVATE: getRequiredEnvVar('ASACI_AUTH_TOKENS_PRIVATE'),
    // Production endpoints
    PRODUCTIONS: getRequiredEnvVar('ASACI_PRODUCTIONS'),
    PRODUCTIONS_DOWNLOAD: getRequiredEnvVar('ASACI_PRODUCTIONS_DOWNLOAD'),
    PRODUCTIONS_FETCH: getRequiredEnvVar('ASACI_PRODUCTIONS_FETCH'),
    // Order endpoints
    ORDERS: getRequiredEnvVar('ASACI_ORDERS'),
    ORDERS_DETAIL: getRequiredEnvVar('ASACI_ORDERS_DETAIL'),
    ORDERS_STATUSES: getRequiredEnvVar('ASACI_ORDERS_STATUSES'),
    ORDERS_APPROVE: getRequiredEnvVar('ASACI_ORDERS_APPROVE'),
    ORDERS_REJECT: getRequiredEnvVar('ASACI_ORDERS_REJECT'),
    ORDERS_CANCEL: getRequiredEnvVar('ASACI_ORDERS_CANCEL'),
    ORDERS_SUSPEND: getRequiredEnvVar('ASACI_ORDERS_SUSPEND'),
    ORDERS_SUBMIT_CONFIRMATION: getRequiredEnvVar('ASACI_ORDERS_SUBMIT_CONFIRMATION'),
    ORDERS_CONFIRM_DELIVERY: getRequiredEnvVar('ASACI_ORDERS_CONFIRM_DELIVERY'),
    ORDERS_STATISTIC_DELIVERED: getRequiredEnvVar('ASACI_ORDERS_STATISTIC_DELIVERED'),
    // Certificate endpoints
    CERTIFICATES: getRequiredEnvVar('ASACI_CERTIFICATES'),
    CERTIFICATES_DETAIL: getRequiredEnvVar('ASACI_CERTIFICATES_DETAIL'),
    CERTIFICATES_DOWNLOAD: getRequiredEnvVar('ASACI_CERTIFICATES_DOWNLOAD'),
    CERTIFICATES_CANCEL: getRequiredEnvVar('ASACI_CERTIFICATES_CANCEL'),
    CERTIFICATES_SUSPEND: getRequiredEnvVar('ASACI_CERTIFICATES_SUSPEND'),
    CERTIFICATES_CHECK: getRequiredEnvVar('ASACI_CERTIFICATES_CHECK'),
    CERTIFICATES_RELATED: getRequiredEnvVar('ASACI_CERTIFICATES_RELATED'),
    CERTIFICATES_RELATED_DOWNLOAD: getRequiredEnvVar('ASACI_CERTIFICATES_RELATED_DOWNLOAD'),
    CERTIFICATE_TYPES: getRequiredEnvVar('ASACI_CERTIFICATE_TYPES'),
    CERTIFICATE_VARIANTS: getRequiredEnvVar('ASACI_CERTIFICATE_VARIANTS'),
    CERTIFICATES_STATISTICS_USAGE: getRequiredEnvVar('ASACI_CERTIFICATES_STATISTICS_USAGE'),
    CERTIFICATES_STATISTIC_AVAILABLE: getRequiredEnvVar('ASACI_CERTIFICATES_STATISTIC_AVAILABLE'),
    CERTIFICATES_STATISTIC_USED: getRequiredEnvVar('ASACI_CERTIFICATES_STATISTIC_USED'),
    // Transaction endpoints
    TRANSACTIONS: getRequiredEnvVar('ASACI_TRANSACTIONS'),
    TRANSACTIONS_DETAIL: getRequiredEnvVar('ASACI_TRANSACTIONS_DETAIL'),
    TRANSACTIONS_APPROVE: getRequiredEnvVar('ASACI_TRANSACTIONS_APPROVE'),
    TRANSACTIONS_REJECT: getRequiredEnvVar('ASACI_TRANSACTIONS_REJECT'),
    TRANSACTIONS_CANCEL: getRequiredEnvVar('ASACI_TRANSACTIONS_CANCEL'),
    TRANSACTIONS_STATISTICS_USAGE: getRequiredEnvVar('ASACI_TRANSACTIONS_STATISTICS_USAGE'),
    TRANSACTIONS_STATISTIC_DEPOSITS: getRequiredEnvVar('ASACI_TRANSACTIONS_STATISTIC_DEPOSITS'),
};
/**
 * Validate environment variables
 */
function validateEnvironment() {
    const requiredVars = [
        'ASACI_BASE_URL',
        'ASACI_AUTH_TOKENS',
        'ASACI_PRODUCTIONS',
        'ASACI_ORDERS',
        'ASACI_CERTIFICATES',
        'ASACI_TRANSACTIONS'
    ];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        logger_1.logger.error('❌ Missing required environment variables:');
        missingVars.forEach(varName => {
            logger_1.logger.error(`   - ${varName}`);
        });
        logger_1.logger.error('\n💡 Please check your .env file and ensure all required variables are set.');
        process.exit(1);
    }
    logger_1.logger.info('✅ Environment variables validated');
}
//# sourceMappingURL=asaci-endpoints.js.map