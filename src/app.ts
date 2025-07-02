import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import { globalExceptionHandlerMiddleware } from '@middlewares/global-exception-handler.middleware';
import { Environment } from '@config/environment';
import { createAsaciServiceManager, AsaciServiceManager } from "@config/asaci-config";
import { logger } from '@utils/logger';
import {createApplicationRoutes, getDefaultRouteConfig} from "@config/routes-manager";
import {AuthenticationService} from "@services/authentication.service";
import * as process from "node:process";
import {createOrassServiceManager, getDefaultOrassConfig, OrassServiceManager} from "@config/orass-service-manager";

export class App {
    public app: Express;
    private asaciManager: AsaciServiceManager;
    private orassManager: OrassServiceManager;
    private authService: AuthenticationService;

    constructor() {
        this.app = express();
        this.setupMiddlewares();
        this.initializeServices();
        this.setupApplicationRoutes();
        this.setupErrorHandlers();
    }

    private setupMiddlewares(): void {
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));

        this.app.use(cors({
            origin: Environment.NODE_ENV !== 'production',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        }));

        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());

        this.app.use(compression());

        //TODO: Enable rate limiting
        // this.app.use(rateLimiter);
        // this.app.use(certificateCreationLimiter);
        // this.app.use(authLimiter);

        // i18n middleware
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
        this.app.use(i18nextMiddleware.handle(i18next));

        logger.info('✅ Application middleware initialized');
    }

    private initializeServices(): void {
        try {
            this.authService = new AuthenticationService();
            this.asaciManager = createAsaciServiceManager({
                baseUrl: Environment.ASACI_BASE_URL,
                timeout: Environment.ASACI_TIMEOUT,
            });
            const orassConfig = getDefaultOrassConfig();
            this.orassManager = createOrassServiceManager(
                orassConfig,
                this.asaciManager.getProductionService()
            );

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

    private setupApplicationRoutes(): void {
        try {
            // Health check endpoints
            this.setupHealthChecks();

            // Get route configuration with all services
            const routeConfig = getDefaultRouteConfig(
                this.authService,
                this.asaciManager,
                this.orassManager
            );

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

            logger.info('✅ Application routes initialized successfully');
        } catch (error: any) {
            logger.error('❌ Failed to setup routes:', error.message);
            throw error;
        }
    }

    private setupErrorHandlers(): void {
        // Global error handler (must be last)
        this.app.use(globalExceptionHandlerMiddleware);

        logger.info('✅ Error handlers initialized');
    }

    private setupHealthChecks(): void {
        // General health check endpoint
        this.app.get('/health', async (req, res) => {
            try {
                const health = await this.getHealthStatus();
                const statusCode = health.status === 'healthy' ? 200 : 503;
                res.status(statusCode).json(health);
            } catch (error: any) {
                res.status(503).json({
                    status: 'unhealthy',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // ASACI health check
        this.app.get('/health/asaci', async (req, res) => {
            try {
                const health = await this.asaciManager.healthCheck();
                const statusCode = health.status === 'healthy' ? 200 : 503;
                res.status(statusCode).json(health);
            } catch (error: any) {
                res.status(503).json({
                    status: 'unhealthy',
                    service: 'asaci',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // ORASS health check
        this.app.get('/health/orass', async (req, res) => {
            try {
                const health = await this.orassManager.healthCheck();
                const statusCode = health.status === 'healthy' ? 200 : 503;
                res.status(statusCode).json(health);
            } catch (error: any) {
                res.status(503).json({
                    status: 'unhealthy',
                    service: 'orass',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        logger.info('✅ Health check endpoints configured');
    }

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

    async connectOrass(): Promise<void> {
        if(process.env.ORASS_AUTO_CONNECT)
            this.orassManager.connect().catch(error => {
                logger.error('❌ Failed to connect to ORASS:', error.message);
                throw error;
            });
    }

    async disconnectOrass(): Promise<void> {
        const disconnectionPromises: Promise<void>[] = [
            this.orassManager.disconnect().catch(error => {
                logger.error('Error disconnecting ORASS:', error);
            })
        ];

        await Promise.allSettled(disconnectionPromises);
        logger.info('✅ Orass services disconnected');
    }

    getApp(): Express {
        return this.app;
    }

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

        // Check ORASS service health
        try {
            services.orass = await this.orassManager.healthCheck();
        } catch (error: any) {
            services.orass = {
                status: 'error',
                error: error.message,
                connected: false
            };
        }

        // Add database health check
        services.database = {
            status: 'healthy', // This should be replaced with an actual database health check
            connection: 'active'
        };

        // Add authentication service health
        services.authentication = {
            status: 'healthy',
            initialized: true
        };

        // Add other service health checks
        services.application = {
            status: 'healthy',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: Environment.NODE_ENV
        };

        const healthyStatuses = ['healthy', 'ok'];
        const overallStatus = Object.values(services).every(service =>
            healthyStatuses.includes(service.status)
        ) ? 'healthy' : 'degraded';

        return {
            status: overallStatus,
            services,
            timestamp: new Date().toISOString()
        };
    }
}

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