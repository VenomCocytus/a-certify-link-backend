"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, '../../.env')
});
exports.Environment = {
    // Application
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    API_PREFIX: process.env.API_PREFIX,
    API_VERSION: process.env.API_VERSION,
    APP_NAME: process.env.APP_NAME,
    // Database
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_DIALECT: process.env.DB_DIALECT,
    DB_POOL_MAX: process.env.DB_POOL_MAX,
    DB_POOL_MIN: process.env.DB_POOL_MIN,
    DB_POOL_ACQUIRE: process.env.DB_POOL_ACQUIRE,
    DB_POOL_IDLE: process.env.DB_POOL_IDLE,
    // JWT
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    // External APIs
    ORASS_BASE_URL: process.env.ORASS_BASE_URL,
    ORASS_API_KEY: process.env.ORASS_API_KEY,
    ORASS_TIMEOUT: process.env.ORASS_TIMEOUT,
    ASACI_BASE_URL: process.env.ASACI_BASE_URL,
    IVORY_ATTESTATION_TOKEN: process.env.IVORY_ATTESTATION_TOKEN,
    ASACI_TIMEOUT: process.env.ASACI_TIMEOUT,
    ASACI_EMAIL: process.env.ASACI_EMAIL,
    ASACI_PASSWORD: process.env.ASACI_PASSWORD,
    ASACI_CLIENT_NAME: process.env.ASACI_CLIENT_NAME,
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
    // Circuit Breaker
    CIRCUIT_BREAKER_TIMEOUT: process.env.CIRCUIT_BREAKER_TIMEOUT,
    CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE: process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE,
    CIRCUIT_BREAKER_RESET_TIMEOUT: process.env.CIRCUIT_BREAKER_RESET_TIMEOUT,
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL,
    LOG_FILE: process.env.LOG_FILE,
    // i18n
    DEFAULT_LANGUAGE: process.env.DEFAULT_LANGUAGE,
    SUPPORTED_LANGUAGES: process.env.SUPPORTED_LANGUAGES,
};
//TODO: Define key variable for the app
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
//# sourceMappingURL=environment.js.map