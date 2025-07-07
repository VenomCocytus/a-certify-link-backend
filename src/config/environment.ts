import dotenv from 'dotenv';
import path from 'path';
import {AsaciConfig, DatabaseConfig, OrassConfig} from "@interfaces/common.interfaces";
import {parseNumber} from "@utils/generic.helper";

dotenv.config({
    path: path.resolve(__dirname, '../../.env')
});

export class Environment {
    private static instance: Environment;

    // Application Configuration
    public readonly NODE_ENV: string;
    public readonly PORT: number;
    public readonly API_PREFIX: string;
    public readonly API_VERSION: string;
    public readonly APP_NAME: string;
    public readonly ALLOWED_ORIGINS: string;
    public readonly DEFAULT_LANGUAGE: string;
    public readonly SUPPORTED_LANGUAGES: string;

    // Database Configuration
    public readonly DATABASE_URL: string;
    public readonly DB_HOST: string;
    public readonly DB_PORT: number;
    public readonly DB_NAME: string;
    public readonly DB_USERNAME: string;
    public readonly DB_PASSWORD: string;
    public readonly DB_DIALECT: string;
    public readonly DB_POOL_MAX: number;
    public readonly DB_POOL_MIN: number;
    public readonly DB_POOL_ACQUIRE: number;
    public readonly DB_POOL_IDLE: number;
    public readonly DB_SSL: boolean;
    public readonly DB_INSTANCE_NAME: string;

    // JWT Configuration
    public readonly JWT_SECRET: string;
    public readonly JWT_REFRESH_SECRET: string;
    public readonly JWT_EXPIRES_IN: string;

    // Orass Configuration
    public readonly ORASS_HOST: string;
    public readonly ORASS_PORT: number;
    public readonly ORASS_SID: string;
    public readonly ORASS_USERNAME: string;
    public readonly ORASS_PASSWORD: string;
    public readonly ORASS_CONNECTION_TIMEOUT: number;
    public readonly ORASS_REQUEST_TIMEOUT: number;
    public readonly ORASS_AUTO_CONNECT: boolean;

    // ASACI Configuration
    public readonly ASACI_BASE_URL: string;
    public readonly ASACI_API_KEY: string;
    public readonly ASACI_TIMEOUT: number;
    public readonly ASACI_EMAIL: string;
    public readonly ASACI_PASSWORD: string;
    public readonly ASACI_CLIENT_NAME: string;

    // Rate Limiting
    public readonly RATE_LIMIT_WINDOW_MS: number;
    public readonly RATE_LIMIT_MAX_REQUESTS: number;
    public readonly AUTH_RATE_LIMIT_MAX: number;
    public readonly CERT_CREATION_RATE_LIMIT: number;

    // Circuit Breaker
    public readonly CIRCUIT_BREAKER_TIMEOUT: number;
    public readonly CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE: number;
    public readonly CIRCUIT_BREAKER_RESET_TIMEOUT: number;

    // Logging
    public readonly LOG_LEVEL: string;
    public readonly LOG_FILE: string;

    // Security Configuration
    public readonly BCRYPT_ROUNDS: number;
    public readonly PASSWORD_MIN_LENGTH: number;
    public readonly PASSWORD_MAX_LENGTH: number;
    public readonly MAX_LOGIN_ATTEMPTS: number;
    public readonly ACCOUNT_LOCKOUT_TIME: number;

    // Feature Flags
    public readonly ENABLE_SWAGGER: boolean;
    public readonly ENABLE_METRICS: boolean;
    public readonly ENABLE_TWO_FACTOR: boolean;
    public readonly ENABLE_EMAIL_VERIFICATION: boolean;

    private constructor() {
        // Application Configuration
        this.NODE_ENV = process.env.NODE_ENV || 'development';
        this.PORT = parseNumber(process.env.PORT, 3000);
        this.API_PREFIX = process.env.API_PREFIX || '';
        this.API_VERSION = process.env.API_VERSION || '';
        this.APP_NAME = process.env.APP_NAME || '';
        this.ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '';
        this.DEFAULT_LANGUAGE = process.env.DEFAULT_LANGUAGE || 'en';
        this.SUPPORTED_LANGUAGES = process.env.SUPPORTED_LANGUAGES || 'fr,en,es,pt';

        // Database Configuration
        this.DATABASE_URL = process.env.DATABASE_URL || '';
        this.DB_HOST = process.env.DB_HOST || 'localhost';
        this.DB_PORT = parseNumber(process.env.DB_PORT, 5432);
        this.DB_NAME = process.env.DB_NAME || '';
        this.DB_USERNAME = process.env.DB_USERNAME || '';
        this.DB_PASSWORD = process.env.DB_PASSWORD || '';
        this.DB_DIALECT = process.env.DB_DIALECT || '';
        this.DB_POOL_MAX = parseNumber(process.env.DB_POOL_MAX, 5);
        this.DB_POOL_MIN = parseNumber(process.env.DB_POOL_MIN, 0);
        this.DB_POOL_ACQUIRE = parseNumber(process.env.DB_POOL_ACQUIRE, 30000);
        this.DB_POOL_IDLE = parseNumber(process.env.DB_POOL_IDLE, 10000);
        this.DB_INSTANCE_NAME = process.env.DB_INSTANCE_NAME || '';
        this.DB_SSL = process.env.DB_SSL === 'true';

        // JWT Configuration
        this.JWT_SECRET = process.env.JWT_SECRET || '';
        this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '';

        // Orass Configuration
        this.ORASS_HOST = process.env.ORASS_HOST || '';
        this.ORASS_PORT = parseNumber(process.env.ORASS_PORT, 1521);
        this.ORASS_SID = process.env.ORASS_SID || '';
        this.ORASS_USERNAME = process.env.ORASS_USERNAME || '';
        this.ORASS_PASSWORD = process.env.ORASS_PASSWORD || '';
        this.ORASS_CONNECTION_TIMEOUT = parseNumber(process.env.ORASS_CONNECTION_TIMEOUT, 30000);
        this.ORASS_REQUEST_TIMEOUT = parseNumber(process.env.ORASS_REQUEST_TIMEOUT, 60000);
        this.ORASS_AUTO_CONNECT = process.env.ORASS_AUTO_CONNECT === 'true';

        // ASACI Configuration
        this.ASACI_BASE_URL = process.env.ASACI_BASE_URL || '';
        this.ASACI_API_KEY = process.env.ASACI_API_KEY || '';
        this.ASACI_TIMEOUT = parseNumber(process.env.ASACI_TIMEOUT, 10000);
        this.ASACI_EMAIL = process.env.ASACI_EMAIL || '';
        this.ASACI_PASSWORD = process.env.ASACI_PASSWORD || '';
        this.ASACI_CLIENT_NAME = process.env.ASACI_CLIENT_NAME || '';

        // Rate Limiting
        this.RATE_LIMIT_WINDOW_MS = parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 60000);
        this.RATE_LIMIT_MAX_REQUESTS = parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100);
        this.AUTH_RATE_LIMIT_MAX = parseNumber(process.env.AUTH_RATE_LIMIT_MAX, 5);
        this.CERT_CREATION_RATE_LIMIT = parseNumber(process.env.CERT_CREATION_RATE_LIMIT, 10);

        // Circuit Breaker
        this.CIRCUIT_BREAKER_TIMEOUT = parseNumber(process.env.CIRCUIT_BREAKER_TIMEOUT, 10000);
        this.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE = parseNumber(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE, 50);
        this.CIRCUIT_BREAKER_RESET_TIMEOUT = parseNumber(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT, 30000);

        // Logging
        this.LOG_LEVEL = process.env.LOG_LEVEL || 'info';
        this.LOG_FILE = process.env.LOG_FILE || '';

        // Security Configuration
        this.BCRYPT_ROUNDS = parseNumber(process.env.BCRYPT_ROUNDS, 12);
        this.PASSWORD_MIN_LENGTH = parseNumber(process.env.PASSWORD_MIN_LENGTH, 8);
        this.PASSWORD_MAX_LENGTH = parseNumber(process.env.PASSWORD_MAX_LENGTH, 100);
        this.MAX_LOGIN_ATTEMPTS = parseNumber(process.env.MAX_LOGIN_ATTEMPTS, 5);
        this.ACCOUNT_LOCKOUT_TIME = parseNumber(process.env.ACCOUNT_LOCKOUT_TIME, 1800000); // 30 minutes

        // Feature Flags
        this.ENABLE_SWAGGER = process.env.ENABLE_SWAGGER !== 'false';
        this.ENABLE_METRICS = process.env.ENABLE_METRICS === 'true';
        this.ENABLE_TWO_FACTOR = process.env.ENABLE_TWO_FACTOR !== 'false';
        this.ENABLE_EMAIL_VERIFICATION = process.env.ENABLE_EMAIL_VERIFICATION !== 'false';

        // Validate required environment variables
        this.validateRequiredEnvVars();
    }

    /**
     * Get a singleton instance of Environment
     */
    public static getInstance(): Environment {
        if (!Environment.instance) {
            Environment.instance = new Environment();
        }
        return Environment.instance;
    }

    /**
     * Validate required environment variables
     */
    private validateRequiredEnvVars(): void {
        const requiredEnvVars = [
            'JWT_SECRET',
            'JWT_REFRESH_SECRET',
            'JWT_EXPIRES_IN',
            'DB_HOST',
            'DB_PORT',
            'DB_DIALECT',
            'DB_NAME',
            'DB_USERNAME',
            'DB_PASSWORD',
            'ASACI_BASE_URL',
            'ASACI_TIMEOUT',
            'ASACI_EMAIL',
            'ASACI_PASSWORD',
            'ASACI_CLIENT_NAME',
            'ORASS_HOST',
            'ORASS_SID',
            'ORASS_USERNAME',
            'ORASS_PASSWORD',
            'ORASS_PORT',
            'ORASS_TIMEOUT',
            'ORASS_AUTO_CONNECT'
        ];

        const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

        if (missingEnvVars.length > 0) {
            throw new Error(
                `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
                'Please check your .env file and ensure all required variables are set.'
            );
        }

        // Additional validations
        if (this.JWT_SECRET.length < 32) {
            throw new Error('JWT_SECRET must be at least 32 characters long');
        }

        if (!this.ORASS_HOST || !this.ORASS_SID) {
            throw new Error('ORASS database configuration is incomplete');
        }
    }

    /**
     * Get database configuration object
     */
    public getDatabaseConfig(): DatabaseConfig {
        return {
            host: this.DB_HOST,
            port: this.DB_PORT,
            database: this.DB_NAME,
            username: this.DB_USERNAME,
            password: this.DB_PASSWORD,
            ssl: this.DB_SSL,
            url: this.DATABASE_URL,
        };
    }

    /**
     * Get ORASS configuration object
     */
    public getOrassConfig(): OrassConfig {
        return {
            host: this.ORASS_HOST,
            port: this.ORASS_PORT,
            sid: this.ORASS_SID,
            username: this.ORASS_USERNAME,
            password: this.ORASS_PASSWORD,
            connectionTimeout: this.ORASS_CONNECTION_TIMEOUT,
            requestTimeout: this.ORASS_REQUEST_TIMEOUT,
            autoConnect: this.ORASS_AUTO_CONNECT,
        };
    }

    /**
     * Get ASACI configuration object
     */
    public getAsaciConfig(): AsaciConfig {
        return {
            baseUrl: this.ASACI_BASE_URL,
            email: this.ASACI_EMAIL,
            password: this.ASACI_PASSWORD,
            clientName: this.ASACI_CLIENT_NAME,
            timeout: this.ASACI_TIMEOUT,
        };
    }

    /**
     * Check if we're in development mode
     */
    public isDevelopment(): boolean {
        return this.NODE_ENV === 'development';
    }

    /**
     * Check if we're in production mode
     */
    public isProduction(): boolean {
        return this.NODE_ENV === 'production';
    }

    /**
     * Check if we're in test mode
     */
    public isTest(): boolean {
        return this.NODE_ENV === 'test';
    }

    /**
     * Get all environment variables as an object (for debugging)
     */
    public getAll(): Record<string, any> {
        return {
            // Application Configuration
            NODE_ENV: this.NODE_ENV,
            PORT: this.PORT,
            API_PREFIX: this.API_PREFIX,
            API_VERSION: this.API_VERSION,
            APP_NAME: this.APP_NAME,
            ALLOWED_ORIGINS: this.ALLOWED_ORIGINS,
            DEFAULT_LANGUAGE: this.DEFAULT_LANGUAGE,
            SUPPORTED_LANGUAGES: this.SUPPORTED_LANGUAGES,

            // Database Configuration (excluding sensitive data)
            DB_HOST: this.DB_HOST,
            DB_PORT: this.DB_PORT,
            DB_NAME: this.DB_NAME,
            DB_USERNAME: this.DB_USERNAME,
            DB_DIALECT: this.DB_DIALECT,
            DB_POOL_MAX: this.DB_POOL_MAX,
            DB_POOL_MIN: this.DB_POOL_MIN,
            DB_POOL_ACQUIRE: this.DB_POOL_ACQUIRE,
            DB_POOL_IDLE: this.DB_POOL_IDLE,
            DB_SSL: this.DB_SSL,

            // Feature Flags
            ENABLE_SWAGGER: this.ENABLE_SWAGGER,
            ENABLE_METRICS: this.ENABLE_METRICS,
            ENABLE_TWO_FACTOR: this.ENABLE_TWO_FACTOR,
            ENABLE_EMAIL_VERIFICATION: this.ENABLE_EMAIL_VERIFICATION,

            // Rate Limiting
            RATE_LIMIT_WINDOW_MS: this.RATE_LIMIT_WINDOW_MS,
            RATE_LIMIT_MAX_REQUESTS: this.RATE_LIMIT_MAX_REQUESTS,
            AUTH_RATE_LIMIT_MAX: this.AUTH_RATE_LIMIT_MAX,
            CERT_CREATION_RATE_LIMIT: this.CERT_CREATION_RATE_LIMIT,

            // Logging
            LOG_LEVEL: this.LOG_LEVEL,
            LOG_FILE: this.LOG_FILE,

            // Security Configuration
            BCRYPT_ROUNDS: this.BCRYPT_ROUNDS,
            PASSWORD_MIN_LENGTH: this.PASSWORD_MIN_LENGTH,
            PASSWORD_MAX_LENGTH: this.PASSWORD_MAX_LENGTH,
            MAX_LOGIN_ATTEMPTS: this.MAX_LOGIN_ATTEMPTS,
            ACCOUNT_LOCKOUT_TIME: this.ACCOUNT_LOCKOUT_TIME,
        };
    }

    /**
     * Reload environment variables (useful for testing)
     */
    public static reload(): Environment {
        dotenv.config({
            path: path.resolve(__dirname, '../../.env')
        });
        Environment.instance = new Environment();
        return Environment.instance;
    }
}

export const env = Environment.getInstance();

export function getDatabaseConfig(): DatabaseConfig {
    return env.getDatabaseConfig();
}

export function getOrassConfig(): OrassConfig {
    return env.getOrassConfig();
}

export function getAsaciConfig(): AsaciConfig {
    return env.getAsaciConfig();
}

export function isDevelopment(): boolean {
    return env.isDevelopment();
}

export function isProduction(): boolean {
    return env.isProduction();
}

export function isTest(): boolean {
    return env.isTest();
}