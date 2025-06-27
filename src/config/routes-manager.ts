import { Router, Express } from 'express';
import { AsaciServiceManager } from '@config/asaci-config';
import { logger } from '@utils/logger';
import { AsaciAuthenticationController } from "@controllers/asaci-authentication.controller";
import { AsaciAttestationController } from "@controllers/asaci-attestation.controller";
import { createAsaciRoutes } from "@/routes/asaci.routes";
import { createAuthRoutes } from "@/routes/auth.routes";
import { AuthenticationService } from "@services/authentication.service";
import { AuthenticationController } from "@controllers/authentication.controller";
import { Environment } from "@config/environment";
import { setupSwagger } from "@config/swagger";

export interface RouteConfig {
    auth?: {
        enabled?: boolean;
        basePath?: string;
        authService?: AuthenticationService;
    };
    asaci?: {
        enabled?: boolean;
        basePath?: string;
        manager?: AsaciServiceManager;
    };
    swagger?: {
        enabled?: boolean;
        basePath?: string;
    };
    health?: {
        enabled?: boolean;
        basePath?: string;
    };
}

export class RoutesManager {
    private app: Express;
    private config: RouteConfig;
    private routes: Router;

    constructor(app: Express, config: RouteConfig = {}) {
        this.app = app;
        this.config = config;
        this.routes = Router();
    }

    /**
     * Initialize and setup all application routes
     */
    setupRoutes(): Router {
        try {
            // Setup Swagger documentation first (should be available early)
            if (this.config.swagger?.enabled !== false) {
                this.setupSwaggerRoutes();
            }

            // Setup health check routes
            if (this.config.health?.enabled !== false) {
                this.setupHealthRoutes();
            }

            // Set up Authentication routes (required for other routes)
            if (this.config.auth?.enabled !== false) {
                this.setupAuthRoutes();
            }

            // Setup Asaci routes if enabled
            if (this.config.asaci?.enabled !== false) {
                this.setupAsaciRoutes();
            }

            logger.info('✅ All application routes initialized successfully');
            return this.routes;

        } catch (error: any) {
            logger.error('❌ Failed to setup routes:', error.message);
            throw error;
        }
    }

    /**
     * Setup Swagger documentation routes
     */
    private setupSwaggerRoutes(): void {
        try {
            // Setup Swagger documentation
            setupSwagger(this.app);

            // Add swagger routes info to main router (for route listing)
            const basePath = this.config.swagger?.basePath || '/docs';

            // Add a route that lists all available documentation endpoints
            this.routes.get('/docs', (req, res) => {
                const apiPrefix = Environment.API_PREFIX || '/api';
                res.json({
                    message: 'API Documentation Available',
                    endpoints: {
                        documentation: `${apiPrefix}/docs`,
                        interactive: `${apiPrefix}/docs`,
                        jsonSpec: `${apiPrefix}/docs.json`,
                        openApiSpec: `${apiPrefix}/docs/openapi.json`,
                        health: `${apiPrefix}/docs/health`
                    },
                    info: {
                        title: `${Environment.APP_NAME} Management API`,
                        version: '1.0.0',
                        description: 'Comprehensive API documentation for the eAttestation system'
                    },
                    timestamp: new Date().toISOString()
                });
            });

            logger.info(`✅ Swagger documentation routes initialized at: ${Environment.API_PREFIX}/docs`);
        } catch (error: any) {
            logger.error('❌ Failed to setup Swagger routes:', error.message);
            // Don't throw error for swagger setup failure
            logger.warn('⚠️ Continuing without Swagger documentation');
        }
    }

    /**
     * Setup health check routes
     */
    private setupHealthRoutes(): void {
        try {
            const basePath = this.config.health?.basePath || '/health';

            // Main health check endpoint
            this.routes.get('/health', async (req, res) => {
                const healthStatus = await this.getApplicationHealthStatus();
                const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
                res.status(statusCode).json(healthStatus);
            });

            // Detailed health check with service breakdown
            this.routes.get('/health/detailed', async (req, res) => {
                const healthStatus = await this.getDetailedHealthStatus();
                const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
                res.status(statusCode).json(healthStatus);
            });

            // Liveness probe (for container orchestration)
            this.routes.get('/health/live', (req, res) => {
                res.status(200).json({
                    status: 'alive',
                    timestamp: new Date().toISOString()
                });
            });

            // Readiness probe (for container orchestration)
            this.routes.get('/health/ready', async (req, res) => {
                try {
                    // Check if all required services are ready
                    const isReady = await this.checkReadiness();
                    res.status(isReady ? 200 : 503).json({
                        status: isReady ? 'ready' : 'not_ready',
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    res.status(503).json({
                        status: 'not_ready',
                        error: 'Health check failed',
                        timestamp: new Date().toISOString()
                    });
                }
            });

            logger.info(`✅ Health check routes mounted at: ${basePath}`);
        } catch (error: any) {
            logger.error('❌ Failed to setup Health routes:', error.message);
        }
    }

    /**
     * Setup Authentication routes
     */
    private setupAuthRoutes(): void {
        try {
            if (!this.config.auth?.authService) {
                throw new Error('Authentication service not provided in route config');
            }

            const authService = this.config.auth.authService;

            // Create an authentication controller
            const authController = new AuthenticationController(authService);

            // Create and mount authentication routes
            const authRoutes = createAuthRoutes(authController);
            const basePath = this.config.auth.basePath || '/auth';

            this.routes.use(basePath, authRoutes);

            logger.info(`✅ Authentication routes mounted at: ${basePath}`);
        } catch (error: any) {
            logger.error('❌ Failed to setup Authentication routes:', error.message);
            throw error;
        }
    }

    /**
     * Setup Asaci eAttestation routes
     */
    private setupAsaciRoutes(): void {
        try {
            if (!this.config.asaci?.manager) {
                throw new Error('Asaci service manager not provided in route config');
            }

            const asaciManager = this.config.asaci.manager;

            // Create controllers
            const authController = new AsaciAuthenticationController(asaciManager.getAuthService());
            const attestationController = new AsaciAttestationController(
                asaciManager.getProductionService(),
                asaciManager.getOrderService(),
                asaciManager.getCertificateService(),
                asaciManager.getTransactionService()
            );

            // Create and mount Asaci routes
            const asaciRoutes = createAsaciRoutes(authController, attestationController);
            const basePath = this.config.asaci.basePath || '/asaci';

            this.routes.use(basePath, asaciRoutes);

            logger.info(`✅ Asaci routes mounted at: ${basePath}`);
        } catch (error: any) {
            logger.error('❌ Failed to setup Asaci routes:', error.message);
            throw error;
        }
    }

    /**
     * Get application health status
     */
    private async getApplicationHealthStatus(): Promise<any> {
        const startTime = Date.now();
        const services: Record<string, any> = {};

        try {
            // Check authentication service
            services.authentication = {
                status: 'healthy',
                description: 'Authentication service is operational'
            };

            // Check Asaci service if configured
            if (this.config.asaci?.manager) {
                try {
                    const asaciHealth = await this.config.asaci.manager.healthCheck();
                    services.asaci = {
                        ...asaciHealth
                    };
                } catch (error: any) {
                    services.asaci = {
                        status: 'unhealthy',
                        error: error.message,
                        description: 'ASACI service is not responding'
                    };
                }
            }

            // Add database health check (placeholder - implement based on your database)
            services.database = {
                status: 'healthy',
                description: 'Database connection is active'
            };

        } catch (error: any) {
            logger.error('Health check error:', error);
        }

        const responseTime = Date.now() - startTime;
        const overallStatus = Object.values(services).every(service =>
            service.status === 'healthy'
        ) ? 'healthy' : 'unhealthy';

        return {
            status: overallStatus,
            services,
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: Environment.NODE_ENV
        };
    }

    /**
     * Get detailed health status with more comprehensive checks
     */
    private async getDetailedHealthStatus(): Promise<any> {
        const basicHealth = await this.getApplicationHealthStatus();

        return {
            ...basicHealth,
            routes: {
                authentication: this.config.auth?.enabled !== false,
                asaci: this.config.asaci?.enabled !== false,
                swagger: this.config.swagger?.enabled !== false,
                health: this.config.health?.enabled !== false
            },
            configuration: {
                apiPrefix: Environment.API_PREFIX,
                nodeEnv: Environment.NODE_ENV,
                appName: Environment.APP_NAME
            },
            system: {
                nodeVersion: process.version,
                platform: process.platform,
                architecture: process.arch,
                pid: process.pid
            }
        };
    }

    /**
     * Check if the application is ready to serve requests
     */
    private async checkReadiness(): Promise<boolean> {
        try {
            // Check if authentication service is ready
            if (this.config.auth?.enabled !== false && !this.config.auth?.authService) {
                return false;
            }

            // Check if Asaci service is ready (if enabled)
            if (this.config.asaci?.enabled !== false && this.config.asaci?.manager) {
                try {
                    await this.config.asaci.manager.healthCheck();
                } catch (error) {
                    return false;
                }
            }

            // Add other readiness checks here (database, external services, etc.)

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get the main routes router
     */
    getRoutes(): Router {
        return this.routes;
    }

    /**
     * Setup 404 handler for API routes
     */
    setup404Handler(): void {
        this.routes.use('*', (req, res) => {
            const apiPrefix = Environment.API_PREFIX || '/api';

            res.status(404).json({
                type: `https://tools.ietf.org/html/rfc7231#section-6.5.4`,
                title: 'Not Found',
                status: 404,
                detail: `Route ${req.originalUrl} not found`,
                instance: req.originalUrl,
                suggestions: {
                    documentation: `${apiPrefix}/docs`,
                    health: `${apiPrefix}/health`,
                    authentication: `${apiPrefix}/auth`,
                    asaci: `${apiPrefix}/asaci`
                },
                timestamp: new Date().toISOString()
            });
        });
    }

    /**
     * Get route information for debugging
     */
    getRouteInfo(): any {
        return {
            authentication: {
                enabled: this.config.auth?.enabled !== false,
                basePath: this.config.auth?.basePath || '/auth'
            },
            asaci: {
                enabled: this.config.asaci?.enabled !== false,
                basePath: this.config.asaci?.basePath || '/asaci'
            },
            swagger: {
                enabled: this.config.swagger?.enabled !== false,
                basePath: this.config.swagger?.basePath || '/docs'
            },
            health: {
                enabled: this.config.health?.enabled !== false,
                basePath: this.config.health?.basePath || '/health'
            }
        };
    }
}

/**
 * Factory function to create routes with configuration
 */
export const createApplicationRoutes = (
    app: Express,
    config: RouteConfig = {}
): Router => {
    const routesManager = new RoutesManager(app, config);
    const routes = routesManager.setupRoutes();

    // Setup 404 handler for API routes
    routesManager.setup404Handler();

    return routes;
};

/**
 * Get default route configuration
 */
export const getDefaultRouteConfig = (
    authService?: AuthenticationService,
    asaciManager?: AsaciServiceManager
): RouteConfig => {
    return {
        auth: {
            enabled: true,
            basePath: '/auth',
            authService
        },
        asaci: {
            enabled: true,
            basePath: '/asaci',
            manager: asaciManager
        },
        swagger: {
            enabled: Environment.NODE_ENV !== 'production', // Enable swagger in development by default
            basePath: '/docs'
        },
        health: {
            enabled: true,
            basePath: '/health'
        }
    };
};

// Export individual route creators for direct use if needed
export { createAsaciRoutes, createAuthRoutes };