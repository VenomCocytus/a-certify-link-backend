import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path: path.resolve(__dirname, '../../.env')
});

function parseNumber(value: string | undefined, defaultValue: number): number {
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

export const Environment = {
    // Application Configuration
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseNumber(process.env.PORT, 3000),
    API_PREFIX: process.env.API_PREFIX || '',
    API_VERSION: process.env.API_VERSION || '',
    APP_NAME: process.env.APP_NAME || '',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || '',
    DEFAULT_LANGUAGE: process.env.DEFAULT_LANGUAGE || 'en',
    SUPPORTED_LANGUAGES: process.env.SUPPORTED_LANGUAGES || 'fr,en,es,pt',

    // Database Configuration
    DATABASE_URL: process.env.DATABASE_URL || '',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseNumber(process.env.DB_PORT, 5432),
    DB_NAME: process.env.DB_NAME || '',
    DB_USERNAME: process.env.DB_USERNAME || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_DIALECT: process.env.DB_DIALECT || '',
    DB_POOL_MAX: parseNumber(process.env.DB_POOL_MAX, 5),
    DB_POOL_MIN: parseNumber(process.env.DB_POOL_MIN, 0),
    DB_POOL_ACQUIRE: parseNumber(process.env.DB_POOL_ACQUIRE, 30000),
    DB_POOL_IDLE: parseNumber(process.env.DB_POOL_IDLE, 10000),
    DB_SSL: process.env.DB_SSL === 'true',

    // JWT Configuration
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '',

    // Orass Configuration
    ORASS_HOST: process.env.ORASS_HOST || '',
    ORASS_PORT: parseNumber(process.env.ORASS_PORT, 1521),
    ORASS_SID: process.env.ORASS_SID || '',
    ORASS_USERNAME: process.env.ORASS_USERNAME || '',
    ORASS_PASSWORD: process.env.ORASS_PASSWORD || '',
    ORASS_CONNECTION_TIMEOUT: parseNumber(process.env.ORASS_CONNECTION_TIMEOUT, 30000),
    ORASS_REQUEST_TIMEOUT: parseNumber(process.env.ORASS_REQUEST_TIMEOUT, 60000),
    ORASS_AUTO_CONNECT: process.env.ORASS_AUTO_CONNECT as unknown as boolean,

    // ASACI Configuration
    ASACI_BASE_URL: process.env.ASACI_BASE_URL || '',
    ASACI_API_KEY: process.env.ASACI_API_KEY || '',  // Added missing variable
    ASACI_TIMEOUT: parseNumber(process.env.ASACI_TIMEOUT, 10000),
    ASACI_EMAIL: process.env.ASACI_EMAIL || '',
    ASACI_PASSWORD: process.env.ASACI_PASSWORD || '',
    ASACI_CLIENT_NAME: process.env.ASACI_CLIENT_NAME || '',

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 60000),
    RATE_LIMIT_MAX_REQUESTS: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
    AUTH_RATE_LIMIT_MAX: parseNumber(process.env.AUTH_RATE_LIMIT_MAX, 5),
    CERT_CREATION_RATE_LIMIT: parseNumber(process.env.CERT_CREATION_RATE_LIMIT, 10),

    // Circuit Breaker
    CIRCUIT_BREAKER_TIMEOUT: parseNumber(process.env.CIRCUIT_BREAKER_TIMEOUT, 10000),
    CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE: parseNumber(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE, 50),
    CIRCUIT_BREAKER_RESET_TIMEOUT: parseNumber(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT, 30000),

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    LOG_FILE: process.env.LOG_FILE || '',

    // Security Configuration
    BCRYPT_ROUNDS: parseNumber(process.env.BCRYPT_ROUNDS, 12),
    PASSWORD_MIN_LENGTH: parseNumber(process.env.PASSWORD_MIN_LENGTH, 8),
    PASSWORD_MAX_LENGTH: parseNumber(process.env.PASSWORD_MAX_LENGTH, 100),
    MAX_LOGIN_ATTEMPTS: parseNumber(process.env.MAX_LOGIN_ATTEMPTS, 5),
    ACCOUNT_LOCKOUT_TIME: parseNumber(process.env.ACCOUNT_LOCKOUT_TIME, 1800000), // 30 minutes

    // Feature Flags
    ENABLE_SWAGGER: process.env.ENABLE_SWAGGER !== 'false',
    ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
    ENABLE_TWO_FACTOR: process.env.ENABLE_TWO_FACTOR !== 'false',
    ENABLE_EMAIL_VERIFICATION: process.env.ENABLE_EMAIL_VERIFICATION !== 'false',
};

// Validate required environment variables
const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DB_NAME',
    'DB_USERNAME',
    'DB_PASSWORD',
    'ASACI_BASE_URL',
    'ORASS_HOST',
    'ORASS_SID',
    'ORASS_USERNAME',
    'ORASS_PASSWORD',
    'ASACI_API_KEY',  // Added here as well
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.'
    );
}

// Example validation (uncomment and customize as needed)
// if (Environment.JWT_SECRET.length < 32) {
//   throw new Error('JWT_SECRET must be at least 32 characters long');
// }
// if (!Environment.ORASS_HOST || !Environment.ORASS_SID) {
//   throw new Error('ORASS database configuration is incomplete');
// }

/**
 * Get database configuration object
 */
export function getDatabaseConfig() {
    return {
        host: Environment.DB_HOST,
        port: Environment.DB_PORT,
        database: Environment.DB_NAME,
        username: Environment.DB_USERNAME,
        password: Environment.DB_PASSWORD,
        ssl: Environment.DB_SSL,
        url: Environment.DATABASE_URL,
    };
}

/**
 * Get ORASS configuration object
 */
export function getOrassConfig() {
    return {
        host: Environment.ORASS_HOST,
        port: Environment.ORASS_PORT,
        sid: Environment.ORASS_SID,
        username: Environment.ORASS_USERNAME,
        password: Environment.ORASS_PASSWORD,
        connectionTimeout: Environment.ORASS_CONNECTION_TIMEOUT,
        requestTimeout: Environment.ORASS_REQUEST_TIMEOUT,
        autoConnect: Environment.ORASS_AUTO_CONNECT,
    };
}

/**
 * Get ASACI configuration object
 */
export function getAsaciConfig() {
    return {
        baseUrl: Environment.ASACI_BASE_URL,
        apiKey: Environment.ASACI_API_KEY,
        email: Environment.ASACI_EMAIL,
        password: Environment.ASACI_PASSWORD,
        clientName: Environment.ASACI_CLIENT_NAME,
        timeout: Environment.ASACI_TIMEOUT,
    };
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
    return Environment.NODE_ENV === 'development';
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
    return Environment.NODE_ENV === 'production';
}

/**
 * Check if we're in test mode
 */
export function isTest(): boolean {
    return Environment.NODE_ENV === 'test';
}
