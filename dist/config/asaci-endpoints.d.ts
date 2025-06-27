export interface AsaciEndpoints {
    AUTH_TOKENS: string;
    AUTH_OTP_VALIDATE: string;
    AUTH_OTP_RESEND: string;
    AUTH_FORGOT_PASSWORD: string;
    AUTH_RESET_PASSWORD: string;
    AUTH_WELCOME_SEND: string;
    AUTH_WELCOME_SET_PASSWORD: string;
    AUTH_USER: string;
    AUTH_TOKENS_REVOKE: string;
    AUTH_EMAIL_VERIFICATION: string;
    AUTH_EMAIL_VERIFY: string;
    AUTH_BROWSER_SESSIONS: string;
    AUTH_BROWSER_SESSIONS_LAST_ACTIVITY: string;
    AUTH_LOGOUT_BROWSER_SESSIONS: string;
    AUTH_TOKENS_PRIVATE: string;
    PRODUCTIONS: string;
    PRODUCTIONS_DOWNLOAD: string;
    PRODUCTIONS_FETCH: string;
    ORDERS: string;
    ORDERS_DETAIL: string;
    ORDERS_STATUSES: string;
    ORDERS_APPROVE: string;
    ORDERS_REJECT: string;
    ORDERS_CANCEL: string;
    ORDERS_SUSPEND: string;
    ORDERS_SUBMIT_CONFIRMATION: string;
    ORDERS_CONFIRM_DELIVERY: string;
    ORDERS_STATISTIC_DELIVERED: string;
    CERTIFICATES: string;
    CERTIFICATES_DETAIL: string;
    CERTIFICATES_DOWNLOAD: string;
    CERTIFICATES_CANCEL: string;
    CERTIFICATES_SUSPEND: string;
    CERTIFICATES_CHECK: string;
    CERTIFICATES_RELATED: string;
    CERTIFICATES_RELATED_DOWNLOAD: string;
    CERTIFICATE_TYPES: string;
    CERTIFICATE_VARIANTS: string;
    CERTIFICATES_STATISTICS_USAGE: string;
    CERTIFICATES_STATISTIC_AVAILABLE: string;
    CERTIFICATES_STATISTIC_USED: string;
    TRANSACTIONS: string;
    TRANSACTIONS_DETAIL: string;
    TRANSACTIONS_APPROVE: string;
    TRANSACTIONS_REJECT: string;
    TRANSACTIONS_CANCEL: string;
    TRANSACTIONS_STATISTICS_USAGE: string;
    TRANSACTIONS_STATISTIC_DEPOSITS: string;
}
export declare const ASACI_ENDPOINTS: AsaciEndpoints;
/**
 * Validate environment variables
 */
export declare function validateEnvironment(): void;
//# sourceMappingURL=asaci-endpoints.d.ts.map