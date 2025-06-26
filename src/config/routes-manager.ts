import { Router, Express } from 'express';
import { AsaciServiceManager } from '@config/asaci-config';
import { logger } from '@utils/logger';
import { AsaciAuthenticationController } from "@controllers/asaci-authentication.controller";
import { AsaciAttestationController } from "@controllers/asaci-attestation.controller";
import { createAsaciRoutes } from "@/routes/asaci.routes";
import { createAuthRoutes } from "@/routes/auth.routes";
import {AuthenticationService} from "@services/authentication.service";
import {AuthenticationController} from "@controllers/auth.controller";

// Import other route modules (add as needed)
// import { createUserRoutes } from './user.routes';
// import { createHealthRoutes } from './health.routes';
// import { createAdminRoutes } from './admin.routes';

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
    users?: {
        enabled?: boolean;
        basePath?: string;
    };
    health?: {
        enabled?: boolean;
        basePath?: string;
    };
    admin?: {
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
            // Setup Authentication routes first (required for other routes)
            if (this.config.auth?.enabled !== false) {
                this.setupAuthRoutes();
            }

            // Setup Asaci routes if enabled
            if (this.config.asaci?.enabled !== false) {
                this.setupAsaciRoutes();
            }

            // Setup other routes (add as needed)
            if (this.config.users?.enabled) {
                this.setupUserRoutes();
            }

            if (this.config.health?.enabled) {
                this.setupHealthRoutes();
            }

            if (this.config.admin?.enabled) {
                this.setupAdminRoutes();
            }

            logger.info('✅ All application routes initialized successfully');
            return this.routes;

        } catch (error: any) {
            logger.error('❌ Failed to setup routes:', error.message);
            throw error;
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
     * Setup user management routes
     */
    private setupUserRoutes(): void {
        try {
            // const userRoutes = createUserRoutes();
            // const basePath = this.config.users?.basePath || '/users';
            // this.routes.use(basePath, userRoutes);

            // Placeholder for user routes
            const basePath = this.config.users?.basePath || '/users';
            this.routes.get(`${basePath}/profile`, (req, res) => {
                res.json({ message: 'User profile endpoint - to be implemented' });
            });

            logger.info(`✅ User routes mounted at: ${basePath}`);
        } catch (error: any) {
            logger.error('❌ Failed to setup User routes:', error.message);
        }
    }

    /**
     * Setup health check routes
     */
    private setupHealthRoutes(): void {
        try {
            const basePath = this.config.health?.basePath || '/health';

            // Application health check
            this.routes.get(`${basePath}/app`, (req, res) => {
                res.json({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    environment: process.env.NODE_ENV || 'development'
                });
            });

            // Database health check
            this.routes.get(`${basePath}/db`, async (req, res) => {
                try {
                    // Add your database health check here
                    // await sequelize.authenticate();
                    res.json({
                        status: 'healthy',
                        database: 'connected',
                        timestamp: new Date().toISOString()
                    });
                } catch (error: any) {
                    res.status(503).json({
                        status: 'unhealthy',
                        database: 'disconnected',
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                }
            });

            // Authentication service health check
            this.routes.get(`${basePath}/auth`, async (req, res) => {
                try {
                    res.json({
                        status: 'healthy',
                        service: 'authentication',
                        timestamp: new Date().toISOString()
                    });
                } catch (error: any) {
                    res.status(503).json({
                        status: 'unhealthy',
                        service: 'authentication',
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                }
            });

            // ASACI service health check
            if (this.config.asaci?.enabled) {
                this.routes.get(`${basePath}/asaci`, async (req, res) => {
                    try {
                        // You could ping ASACI service here
                        res.json({
                            status: 'healthy',
                            service: 'asaci',
                            timestamp: new Date().toISOString()
                        });
                    } catch (error: any) {
                        res.status(503).json({
                            status: 'unhealthy',
                            service: 'asaci',
                            error: error.message,
                            timestamp: new Date().toISOString()
                        });
                    }
                });
            }

            logger.info(`✅ Health routes mounted at: ${basePath}`);
        } catch (error: any) {
            logger.error('❌ Failed to setup Health routes:', error.message);
        }
    }

    /**
     * Setup admin routes
     */
    private setupAdminRoutes(): void {
        try {
            const basePath = this.config.admin?.basePath || '/admin';

            // Placeholder for admin routes
            this.routes.get(`${basePath}/stats`, (req, res) => {
                res.json({
                    message: 'Admin statistics endpoint - to be implemented',
                    timestamp: new Date().toISOString()
                });
            });

            logger.info(`✅ Admin routes mounted at: ${basePath}`);
        } catch (error: any) {
            logger.error('❌ Failed to setup Admin routes:', error.message);
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
            res.status(404).json({
                type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
                title: 'Not Found',
                status: 404,
                detail: `API route ${req.originalUrl} not found`,
                instance: req.originalUrl,
            });
        });
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
        users: {
            enabled: false, // Enable when user routes are implemented
            basePath: '/users'
        },
        health: {
            enabled: true,
            basePath: '/health'
        },
        admin: {
            enabled: false, // Enable when admin routes are implemented
            basePath: '/admin'
        }
    };
};

// Export individual route creators for direct use if needed
export { createAsaciRoutes, createAuthRoutes };