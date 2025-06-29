export declare const Environment: {
    NODE_ENV: string;
    PORT: number;
    API_PREFIX: string;
    API_VERSION: string;
    APP_NAME: string;
    ALLOWED_ORIGINS: string;
    DEFAULT_LANGUAGE: string;
    SUPPORTED_LANGUAGES: string;
    DATABASE_URL: string;
    DB_HOST: string;
    DB_PORT: number;
    DB_NAME: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DIALECT: string;
    DB_POOL_MAX: number;
    DB_POOL_MIN: number;
    DB_POOL_ACQUIRE: number;
    DB_POOL_IDLE: number;
    DB_SSL: boolean;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_EXPIRES_IN: string | undefined;
    ORASS_HOST: string;
    ORASS_PORT: number;
    ORASS_SID: string;
    ORASS_USERNAME: string;
    ORASS_PASSWORD: string;
    ORASS_CONNECTION_TIMEOUT: number;
    ORASS_REQUEST_TIMEOUT: number;
    ORASS_AUTO_CONNECT: boolean;
    ASACI_BASE_URL: string;
    ASACI_API_KEY: string;
    ASACI_TIMEOUT: number;
    ASACI_EMAIL: string;
    ASACI_PASSWORD: string;
    ASACI_CLIENT_NAME: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    AUTH_RATE_LIMIT_MAX: number;
    CERT_CREATION_RATE_LIMIT: number;
    CIRCUIT_BREAKER_TIMEOUT: number;
    CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE: number;
    CIRCUIT_BREAKER_RESET_TIMEOUT: number;
    LOG_LEVEL: string;
    LOG_FILE: string;
    BCRYPT_ROUNDS: number;
    PASSWORD_MIN_LENGTH: number;
    PASSWORD_MAX_LENGTH: number;
    MAX_LOGIN_ATTEMPTS: number;
    ACCOUNT_LOCKOUT_TIME: number;
    ENABLE_SWAGGER: boolean;
    ENABLE_METRICS: boolean;
    ENABLE_TWO_FACTOR: boolean;
    ENABLE_EMAIL_VERIFICATION: boolean;
};
/**
 * Get database configuration object
 */
export declare function getDatabaseConfig(): {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
    url: string;
};
/**
 * Get ORASS configuration object
 */
export declare function getOrassConfig(): {
    host: string;
    port: number;
    sid: string;
    username: string;
    password: string;
    connectionTimeout: number;
    requestTimeout: number;
    autoConnect: boolean;
};
/**
 * Get ASACI configuration object
 */
export declare function getAsaciConfig(): {
    baseUrl: string;
    apiKey: string;
    email: string;
    password: string;
    clientName: string;
    timeout: number;
};
/**
 * Check if we're in development mode
 */
export declare function isDevelopment(): boolean;
/**
 * Check if we're in production mode
 */
export declare function isProduction(): boolean;
/**
 * Check if we're in test mode
 */
export declare function isTest(): boolean;
//# sourceMappingURL=environment.d.ts.map