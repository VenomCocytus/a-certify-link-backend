import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import { globalExceptionHandlerMiddleware } from '@middlewares/global-exception-handler.middleware';
import {authLimiter, certificateCreationLimiter, rateLimiter,} from '@middlewares/rate-limiter.middleware';
import { Environment } from '@config/environment';
import { createAsaciServiceManager, AsaciServiceManager } from "@config/asaci-config";
import { logger } from '@utils/logger';
import {createApplicationRoutes, getDefaultRouteConfig} from "@config/routes-manager";
import {AuthenticationService} from "@services/authentication.service";
import * as process from "node:process";

export class App {
    public app: Express;
    private asaciManager: AsaciServiceManager;
    private authService: AuthenticationService;

    constructor() {
        this.app = express();
        this.initializeI18n();
        this.setupMiddleware();
        this.initializeAsaciServices();
        this.setupRoutes();
        this.setupErrorHandlers();
    }

    /**
     * Initialize i18next for internationalization
     */
    private initializeI18n(): void {
        i18next
            .use(Backend)
            .use(i18nextMiddleware.LanguageDetector)
            .init({
                fallbackLng: Environment.DEFAULT_LANGUAGE,
                supportedLngs: Environment.SUPPORTED_LANGUAGES?.split(','),
                backend: {
                    loadPath: './src/locales/{{lng}}.json',
                },
                detection: {
                    order: ['header', 'session'],
                    caches: false,
                },
            });

        logger.info('✅ i18next initialized successfully');
    }

    /**
     * Setup application middleware
     */
    private setupMiddleware(): void {
        // Security middleware
        this.app.use(helmet());
        // this.app.use(helmet({
        //     contentSecurityPolicy: {
        //         directives: {
        //             defaultSrc: ["'self'"],
        //             styleSrc: ["'self'", "'unsafe-inline'"],
        //             scriptSrc: ["'self'"],
        //             imgSrc: ["'self'", "data:", "https:"],
        //         },
        //     },
        // }));

        // CORS configuration
        this.app.use(cors({
            origin: Environment.NODE_ENV !== 'production',
            credentials: true,
        }));
        // this.app.use(cors({
        //     origin: Environment.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        //     credentials: true,
        //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        //     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        // }));

        // Body parsing middleware
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Compression middleware
        this.app.use(compression());

        //TODO: Enable rate limiting
        // Rate limiting
        // this.app.use(rateLimiter);
        // this.app.use(certificateCreationLimiter);
        // this.app.use(authLimiter);

        // i18n middleware
        this.app.use(i18nextMiddleware.handle(i18next));

        logger.info('✅ Application middleware initialized');
    }

    /**
     * Initialize Asaci services
     */
    private initializeAsaciServices(): void {
        try {
            this.authService = new AuthenticationService();
            this.asaciManager = createAsaciServiceManager({
                baseUrl: Environment.ASACI_BASE_URL,
                timeout: Environment.ASACI_TIMEOUT,
            });

            // Setup Asaci health check endpoint
            this.app.get('/health/asaci', async (req, res) => {
                try {
                    const health = await this.asaciManager.healthCheck();
                    res.status(200).json(health);
                } catch (error: any) {
                    res.status(500).json({ status: 'error', message: error.message });
                }
            });

            logger.info('✅ Asaci services initialized successfully');
        } catch (error: any) {
            logger.error('❌ Failed to initialize Asaci services:', error.message);
            throw error;
        }
    }

    /**
     * Setup application routes
     */
    private setupRoutes(): void {
        try {
            // Get route configuration with Asaci manager
            const routeConfig = getDefaultRouteConfig(this.authService, this.asaciManager);

            // Create and mount application routes
            const applicationRoutes = createApplicationRoutes(this.app, routeConfig);
            this.app.use(Environment.API_PREFIX as string, applicationRoutes);

            // Setup root endpoint
            this.app.get('/', (req, res) => {
                res.json({
                    message: `${Environment.APP_NAME} API Server`,
                    environment: Environment.NODE_ENV,
                    timestamp: new Date().toISOString()
                });
            });

            // Set up a general health check endpoint
            this.app.get('/health', (req, res) => {
                res.json({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    environment: Environment.NODE_ENV
                });
            });

            logger.info('✅ Application routes initialized successfully');
        } catch (error: any) {
            logger.error('❌ Failed to setup routes:', error.message);
            throw error;
        }
    }

    /**
     * Setup error handlers (must be last)
     */
    private setupErrorHandlers(): void {
        // Global error handler (must be last)
        this.app.use(globalExceptionHandlerMiddleware);

        logger.info('✅ Error handlers initialized');
    }

    /**
     * Authenticate Asaci services
     */
    async authenticateAsaci(): Promise<void> {
        try {
            if (!Environment.ASACI_EMAIL || !Environment.ASACI_PASSWORD) {
                logger.warn('⚠️ Asaci credentials not provided. Services will require manual authentication');
                return;
            }

            await this.asaciManager.authenticate(
                Environment.ASACI_EMAIL,
                Environment.ASACI_PASSWORD,
                Environment.ASACI_CLIENT_NAME
            );

            logger.info('✅ Asaci services authenticated successfully');
        } catch (error: any) {
            logger.error('❌ Failed to authenticate Asaci services:', error.message);
            throw error;
        }
    }

    /**
     * Get the Express app instance
     */
    getApp(): Express {
        return this.app;
    }

    /**
     * Get the Asaci service manager
     */
    getAsaciManager(): AsaciServiceManager {
        return this.asaciManager;
    }

    /**
     * Get application health status
     */
    async getHealthStatus(): Promise<any> {
        const services: Record<string, any> = {};

        // Check Asaci service health
        try {
            services.asaci = await this.asaciManager.healthCheck();
        } catch (error: any) {
            services.asaci = {
                status: 'error',
                error: error.message,
                authenticated: false
            };
        }

        // Add database health check
        services.database = {
            status: 'healthy', // This should be replaced with actual database health check
            connection: 'active'
        };

        // Add other service health checks
        services.application = {
            status: 'healthy',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: Environment.NODE_ENV
        };

        const overallStatus = Object.values(services).every(service =>
            service.status === 'healthy' || service.status === 'ok'
        ) ? 'healthy' : 'degraded';

        return {
            status: overallStatus,
            services,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Factory function to create and initialize the app
 */
export const createApp = (): App => {
    try {
        const app = new App();
        logger.info('✅ Application created successfully');
        return app;
    } catch (error: any) {
        logger.error('❌ Failed to create application:', error.message);
        throw error;
    }
};
export default App;