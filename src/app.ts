import express, {Express} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import {globalExceptionHandlerMiddleware} from '@middlewares/global-exception-handler.middleware';
import {AsaciServices, createAsaciServiceManager} from "@services/asaci-services";
import {logger} from '@utils/logger';
import {createApplicationRoutes, getDefaultRouteConfig} from "@config/routes-config";
import {AuthenticationService} from "@services/authentication.service";
import * as process from "node:process";
import {getAsaciConfig, isProduction} from "@config/environment";
import {checkDatabaseHealth} from "@/models";
import {HealthStatus} from "@interfaces/common.enum";
import {OrassService} from "@services/orass.service";
import {CertifyLinkService} from "@services/certify-link.service";

export class App {
    public app: Express;
    private asaciServices: AsaciServices;
    private authService: AuthenticationService;
    private orassService: OrassService;
    private certificateLinkService: CertifyLinkService;

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
            origin: isProduction,
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
                fallbackLng: process.env.DEFAULT_LANGUAGE,
                supportedLngs: process.env.SUPPORTED_LANGUAGES?.split(','),
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
            this.orassService = new OrassService();
            this.asaciServices = createAsaciServiceManager(getAsaciConfig());
            this.certificateLinkService = new CertifyLinkService(
                this.orassService, this.asaciServices.getProductionService());
            //TODO: Automatically start Orass at launch without failure

            logger.info('✅ Services initialized successfully');
        } catch (error: any) {
            logger.error('❌ Failed to initialize Asaci services:', error.message);
            throw error;
        }
    }

    private setupApplicationRoutes(): void {
        try {
            this.setupHealthChecks();

            const routeConfig = getDefaultRouteConfig(
                this.authService,
                this.asaciServices,
                this.orassService,
                this.certificateLinkService
            );

            const applicationRoutes = createApplicationRoutes(this.app, routeConfig);
            this.app.use(process.env.API_PREFIX as string, applicationRoutes);

            // Setup root endpoint
            this.app.get('/', (req, res) => {
                res.json({
                    message: `${process.env.APP_NAME} API Server`,
                    environment: process.env.NODE_ENV,
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
        this.app.use(globalExceptionHandlerMiddleware);
        logger.info('✅ Error handlers initialized');
    }

    private setupHealthChecks(): void {
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

        this.app.get('/health/database', async (req, res) => {
            try {
                const health = await checkDatabaseHealth();
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
                const health = await this.asaciServices.healthCheck();
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
                const health = await this.orassService.healthCheck();
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
            if (!process.env.ASACI_EMAIL || !process.env.ASACI_PASSWORD) {
                logger.warn('⚠️ Asaci credentials not provided. Services will require manual authentication');
                return;
            }

            await this.asaciServices.authenticate(
                process.env.ASACI_EMAIL,
                process.env.ASACI_PASSWORD,
                process.env.ASACI_CLIENT_NAME
            );

            logger.info('✅ Asaci services authenticated successfully');
        } catch (error: any) {
            logger.error('❌ Failed to authenticate Asaci services:', error.message);
            throw error;
        }
    }

    async connectOrass(): Promise<void> {
        if(process.env.ORASS_AUTO_CONNECT)
            this.orassService.connect().catch(error => {
                logger.error('❌ Failed to connect to ORASS:', error.message);
                throw error;
            });
    }

    async disconnectOrass(): Promise<void> {
        const disconnectionPromises: Promise<void>[] = [
            this.orassService.disconnect().catch(error => {
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

        //TODO: correctly build the responses of this service
        services.asaci = await this.asaciServices.healthCheck();
        services.orass = await this.orassService.healthCheck();
        services.database = await checkDatabaseHealth();

        //TODO: Check application health
        const overallStatus = Object.values(services)
            .every(service =>
                HealthStatus.HEALTHY.includes(service.status))
            ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY;

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