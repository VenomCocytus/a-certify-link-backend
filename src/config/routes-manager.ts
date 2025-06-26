import { Router, Express } from 'express';
import { AsaciServiceManager } from '@config/asaci-config';
import { logger } from '@utils/logger';
import { AsaciAuthenticationController } from "@controllers/asaci-authentication.controller";
import { AsaciAttestationController } from "@controllers/asaci-attestation.controller";
import { createAsaciRoutes } from "@/routes/asaci.routes";
import { createAuthRoutes } from "@/routes/auth.routes";
import {AuthenticationService} from "@services/authentication.service";
import {AuthenticationController} from "@controllers/authentication.controller";

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
}

export class RoutesManager {
    private config: RouteConfig;
    private routes: Router;

    constructor(app: Express, config: RouteConfig = {}) {
        this.config = config;
        this.routes = Router();
    }

    /**
     * Initialize and setup all application routes
     */
    setupRoutes(): Router {
        try {
            // Set up Authentication routes first (required for other routes)
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
    authService?: AsaciServiceManager,
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
        }
    };
};

// Export individual route creators for direct use if needed
export { createAsaciRoutes, createAuthRoutes };