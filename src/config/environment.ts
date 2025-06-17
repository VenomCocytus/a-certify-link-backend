import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path: path.resolve(__dirname, '../../.env') // Load environment variables from .env file
});

export const Environment = {
    // Application
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    API_PREFIX: process.env.API_PREFIX || '/api/v1',
    API_VERSION: process.env.API_VERSION || '1.0.0',

    // Database
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '1433', 10),
    DB_NAME: process.env.DB_NAME || 'digital_certificates',
    DB_USERNAME: process.env.DB_USERNAME || 'sa',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_DIALECT: process.env.DB_DIALECT || 'mssql',
    DB_POOL_MAX: parseInt(process.env.DB_POOL_MAX || '5', 10),
    DB_POOL_MIN: parseInt(process.env.DB_POOL_MIN || '0', 10),
    DB_POOL_ACQUIRE: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
    DB_POOL_IDLE: parseInt(process.env.DB_POOL_IDLE || '10000', 10),

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h', // store seconds

    // External APIs
    ORASS_BASE_URL: process.env.ORASS_BASE_URL || 'https://orass-api.example.com',
    ORASS_API_KEY: process.env.ORASS_API_KEY || '',
    ORASS_TIMEOUT: parseInt(process.env.ORASS_TIMEOUT || '30000', 10),

    IVORY_ATTESTATION_BASE_URL: process.env.IVORY_ATTESTATION_BASE_URL || 'https://eattestation.ivoryattestation.app',
    IVORY_ATTESTATION_TOKEN: process.env.IVORY_ATTESTATION_TOKEN || '',
    IVORY_ATTESTATION_TIMEOUT: parseInt(process.env.IVORY_ATTESTATION_TIMEOUT || '30000', 10),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

    // Circuit Breaker
    CIRCUIT_BREAKER_TIMEOUT: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '3000', 10),
    CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE || '50', 10),
    CIRCUIT_BREAKER_RESET_TIMEOUT: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || '30000', 10),

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    LOG_FILE: process.env.LOG_FILE || 'logs/app.log',

    // i18n
    DEFAULT_LANGUAGE: process.env.DEFAULT_LANGUAGE || 'en',
    SUPPORTED_LANGUAGES: process.env.SUPPORTED_LANGUAGES || 'en,fr,es',
};

// Validate required environment variables
const requiredEnvVars = [
    'DB_PASSWORD',
    'JWT_SECRET',
    'ORASS_API_KEY',
    'IVORY_ATTESTATION_TOKEN',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}