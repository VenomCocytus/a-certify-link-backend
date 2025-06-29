"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCertifyLinkRoutes = exports.createAuthRoutes = exports.createAsaciRoutes = exports.getDefaultRouteConfig = exports.createApplicationRoutes = exports.RoutesManager = void 0;
const express_1 = require("express");
const logger_1 = require("@utils/logger");
const asaci_authentication_controller_1 = require("@controllers/asaci-authentication.controller");
const asaci_attestation_controller_1 = require("@controllers/asaci-attestation.controller");
const asaci_routes_1 = require("@/routes/asaci.routes");
Object.defineProperty(exports, "createAsaciRoutes", { enumerable: true, get: function () { return asaci_routes_1.createAsaciRoutes; } });
const auth_routes_1 = require("@/routes/auth.routes");
Object.defineProperty(exports, "createAuthRoutes", { enumerable: true, get: function () { return auth_routes_1.createAuthRoutes; } });
const authentication_controller_1 = require("@controllers/authentication.controller");
const environment_1 = require("@config/environment");
const swagger_1 = require("@config/swagger");
const certify_link_controller_1 = require("@controllers/certify-link.controller");
const certify_link_routes_1 = require("@/routes/certify-link.routes");
Object.defineProperty(exports, "createCertifyLinkRoutes", { enumerable: true, get: function () { return certify_link_routes_1.createCertifyLinkRoutes; } });
class RoutesManager {
    constructor(app, config = {}) {
        this.app = app;
        this.config = config;
        this.routes = (0, express_1.Router)();
    }
    /**
     * Initialize and setup all application routes
     */
    setupRoutes() {
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
            // Setup CertifyLink/ORASS routes if enabled
            if (this.config.certifyLink?.enabled !== false) {
                this.setupCertifyLinkRoutes();
            }
            logger_1.logger.info('✅ All application routes initialized successfully');
            return this.routes;
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to setup routes:', error.message);
            throw error;
        }
    }
    /**
     * Setup Swagger documentation routes
     */
    setupSwaggerRoutes() {
        try {
            // Setup Swagger documentation
            (0, swagger_1.setupSwagger)(this.app);
            // Add swagger routes info to the main router (for route listing)
            const basePath = this.config.swagger?.basePath || '/docs';
            // Add a route that lists all available documentation endpoints
            this.routes.get('/docs', (req, res) => {
                const apiPrefix = environment_1.Environment.API_PREFIX || '/api';
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
                        title: `${environment_1.Environment.APP_NAME} Management API`,
                        version: '1.0.0',
                        description: 'Comprehensive API documentation for the eAttestation system'
                    },
                    timestamp: new Date().toISOString()
                });
            });
            logger_1.logger.info(`✅ Swagger documentation routes initialized at: ${environment_1.Environment.API_PREFIX}/docs`);
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to setup Swagger routes:', error.message);
            // Don't throw error for swagger setup failure
            logger_1.logger.warn('⚠️ Continuing without Swagger documentation');
        }
    }
    /**
     * Setup health check routes
     */
    setupHealthRoutes() {
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
                }
                catch (error) {
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
                }
                catch (error) {
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
                        const health = await this.config.asaci.manager.healthCheck();
                        const statusCode = health.status === 'healthy' ? 200 : 503;
                        res.status(statusCode).json(health);
                    }
                    catch (error) {
                        res.status(503).json({
                            status: 'unhealthy',
                            service: 'asaci',
                            error: error.message,
                            timestamp: new Date().toISOString()
                        });
                    }
                });
            }
            // ORASS service health check
            if (this.config.certifyLink?.enabled) {
                this.routes.get(`${basePath}/orass`, async (req, res) => {
                    try {
                        const health = await this.config.certifyLink.orassManager.healthCheck();
                        const statusCode = health.status === 'healthy' ? 200 : 503;
                        res.status(statusCode).json(health);
                    }
                    catch (error) {
                        res.status(503).json({
                            status: 'unhealthy',
                            service: 'orass',
                            error: error.message,
                            timestamp: new Date().toISOString()
                        });
                    }
                });
            }
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
                }
                catch (error) {
                    res.status(503).json({
                        status: 'not_ready',
                        error: 'Health check failed',
                        timestamp: new Date().toISOString()
                    });
                }
            });
            logger_1.logger.info(`✅ Health check routes mounted at: ${basePath}`);
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to setup Health routes:', error.message);
        }
    }
    /**
     * Setup Authentication routes
     */
    setupAuthRoutes() {
        try {
            if (!this.config.auth?.authService) {
                throw new Error('Authentication service not provided in route config');
            }
            const authService = this.config.auth.authService;
            // Create an authentication controller
            const authController = new authentication_controller_1.AuthenticationController(authService);
            // Create and mount authentication routes
            const authRoutes = (0, auth_routes_1.createAuthRoutes)(authController);
            const basePath = this.config.auth.basePath || '/auth';
            this.routes.use(basePath, authRoutes);
            logger_1.logger.info(`✅ Authentication routes mounted at: ${basePath}`);
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to setup Authentication routes:', error.message);
            throw error;
        }
    }
    /**
     * Setup Asaci eAttestation routes
     */
    setupAsaciRoutes() {
        try {
            if (!this.config.asaci?.manager) {
                throw new Error('Asaci service manager not provided in route config');
            }
            const asaciManager = this.config.asaci.manager;
            // Create controllers
            const authController = new asaci_authentication_controller_1.AsaciAuthenticationController(asaciManager.getAuthService());
            const attestationController = new asaci_attestation_controller_1.AsaciAttestationController(asaciManager.getProductionService(), asaciManager.getOrderService(), asaciManager.getCertificateService(), asaciManager.getTransactionService());
            // Create and mount Asaci routes
            const asaciRoutes = (0, asaci_routes_1.createAsaciRoutes)(authController, attestationController);
            const basePath = this.config.asaci.basePath || '/asaci';
            this.routes.use(basePath, asaciRoutes);
            logger_1.logger.info(`✅ Asaci routes mounted at: ${basePath}`);
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to setup Asaci routes:', error.message);
            throw error;
        }
    }
    /**
     * Setup CertifyLink/ORASS routes
     */
    setupCertifyLinkRoutes() {
        try {
            if (!this.config.certifyLink?.orassManager) {
                throw new Error('ORASS service manager not provided in route config');
            }
            const orassManager = this.config.certifyLink.orassManager;
            // Create CertifyLink controller
            const certifyLinkController = new certify_link_controller_1.CertifyLinkController(orassManager.getCertifyLinkService());
            // Create and mount CertifyLink routes
            const certifyLinkRoutes = (0, certify_link_routes_1.createCertifyLinkRoutes)(certifyLinkController);
            const basePath = this.config.certifyLink.basePath || '/certify-link';
            this.routes.use(basePath, certifyLinkRoutes);
            logger_1.logger.info(`✅ CertifyLink routes mounted at: ${basePath}`);
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to setup CertifyLink routes:', error.message);
            throw error;
        }
    }
    /**
     * Get application health status
     */
    async getApplicationHealthStatus() {
        const startTime = Date.now();
        const services = {};
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
                }
                catch (error) {
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
        }
        catch (error) {
            logger_1.logger.error('Health check error:', error);
        }
        const responseTime = Date.now() - startTime;
        const overallStatus = Object.values(services).every(service => service.status === 'healthy') ? 'healthy' : 'unhealthy';
        return {
            status: overallStatus,
            services,
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: environment_1.Environment.NODE_ENV
        };
    }
    /**
     * Get detailed health status with more comprehensive checks
     */
    async getDetailedHealthStatus() {
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
                apiPrefix: environment_1.Environment.API_PREFIX,
                nodeEnv: environment_1.Environment.NODE_ENV,
                appName: environment_1.Environment.APP_NAME
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
    async checkReadiness() {
        try {
            // Check if authentication service is ready
            if (this.config.auth?.enabled !== false && !this.config.auth?.authService) {
                return false;
            }
            // Check if Asaci service is ready (if enabled)
            if (this.config.asaci?.enabled !== false && this.config.asaci?.manager) {
                try {
                    await this.config.asaci.manager.healthCheck();
                }
                catch (error) {
                    return false;
                }
            }
            // Add other readiness checks here (database, external services, etc.)
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get the main routes router
     */
    getRoutes() {
        return this.routes;
    }
    /**
     * Setup 404 handler for API routes
     */
    setup404Handler() {
        this.routes.use('*', (req, res) => {
            const apiPrefix = environment_1.Environment.API_PREFIX || '/api';
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
    getRouteInfo() {
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
exports.RoutesManager = RoutesManager;
/**
 * Factory function to create routes with configuration
 */
const createApplicationRoutes = (app, config = {}) => {
    const routesManager = new RoutesManager(app, config);
    const routes = routesManager.setupRoutes();
    // Setup 404 handler for API routes
    routesManager.setup404Handler();
    return routes;
};
exports.createApplicationRoutes = createApplicationRoutes;
/**
 * Get default route configuration
 */
const getDefaultRouteConfig = (authService, asaciManager, orassManager) => {
    return {
        auth: {
            enabled: true,
            basePath: '/auth',
            authService
        },
        asaci: {
            enabled: true,
            basePath: '/asaci', //TODO: Make this configurable
            manager: asaciManager
        },
        certifyLink: {
            enabled: true,
            basePath: '/certify-link',
            orassManager: orassManager
        },
        swagger: {
            enabled: environment_1.Environment.NODE_ENV !== 'production', // Enable swagger in development by default
            basePath: '/docs'
        },
        health: {
            enabled: true,
            basePath: '/health'
        }
    };
};
exports.getDefaultRouteConfig = getDefaultRouteConfig;
//# sourceMappingURL=routes-manager.js.map