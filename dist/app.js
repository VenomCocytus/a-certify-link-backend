"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = exports.App = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const i18next_1 = __importDefault(require("i18next"));
const i18next_fs_backend_1 = __importDefault(require("i18next-fs-backend"));
const i18next_http_middleware_1 = __importDefault(require("i18next-http-middleware"));
const global_exception_handler_middleware_1 = require("@middlewares/global-exception-handler.middleware");
const environment_1 = require("@config/environment");
const asaci_config_1 = require("@config/asaci-config");
const logger_1 = require("@utils/logger");
const routes_manager_1 = require("@config/routes-manager");
const authentication_service_1 = require("@services/authentication.service");
const process = __importStar(require("node:process"));
const orass_service_manager_1 = require("@config/orass-service-manager");
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.initializeI18n();
        this.setupMiddleware();
        this.initializeServices();
        this.setupRoutes();
        this.setupErrorHandlers();
    }
    /**
     * Initialize i18next for internationalization
     */
    initializeI18n() {
        i18next_1.default
            .use(i18next_fs_backend_1.default)
            .use(i18next_http_middleware_1.default.LanguageDetector)
            .init({
            fallbackLng: environment_1.Environment.DEFAULT_LANGUAGE,
            supportedLngs: environment_1.Environment.SUPPORTED_LANGUAGES?.split(','),
            backend: {
                loadPath: './src/locales/{{lng}}.json',
            },
            detection: {
                order: ['header', 'session'],
                caches: false,
            },
        });
        logger_1.logger.info('✅ i18next initialized successfully');
    }
    /**
     * Setup application middleware
     */
    setupMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)());
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
        // this.app.use(helmet({
        //     contentSecurityPolicy: Environment.isProduction() ? undefined : false,
        //     crossOriginEmbedderPolicy: false
        // }));
        // CORS configuration
        this.app.use((0, cors_1.default)({
            origin: environment_1.Environment.NODE_ENV !== 'production',
            credentials: true,
        }));
        // this.app.use(cors({
        //     origin: Environment.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        //     credentials: true,
        //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        //     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        // }));
        // this.app.use(cors({
        //     origin: Environment.isDevelopment() ? true : Environment.ALLOWED_ORIGINS?.split(','),
        //     credentials: true,
        //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        //     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        // }));
        // Body parsing middleware
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((0, cookie_parser_1.default)());
        // Compression middleware
        this.app.use((0, compression_1.default)());
        //TODO: Enable rate limiting
        // Rate limiting
        // this.app.use(rateLimiter);
        // this.app.use(certificateCreationLimiter);
        // this.app.use(authLimiter);
        // i18n middleware
        this.app.use(i18next_http_middleware_1.default.handle(i18next_1.default));
        logger_1.logger.info('✅ Application middleware initialized');
    }
    /**
     * Initialize Asaci services
     */
    initializeServices() {
        try {
            this.authService = new authentication_service_1.AuthenticationService();
            this.asaciManager = (0, asaci_config_1.createAsaciServiceManager)({
                baseUrl: environment_1.Environment.ASACI_BASE_URL,
                timeout: environment_1.Environment.ASACI_TIMEOUT,
            });
            const orassConfig = (0, orass_service_manager_1.getDefaultOrassConfig)();
            this.orassManager = (0, orass_service_manager_1.createOrassServiceManager)(orassConfig, this.asaciManager.getProductionService());
            // Setup Asaci health check endpoint
            this.app.get('/health/asaci', async (req, res) => {
                try {
                    const health = await this.asaciManager.healthCheck();
                    res.status(200).json(health);
                }
                catch (error) {
                    res.status(500).json({ status: 'error', message: error.message });
                }
            });
            logger_1.logger.info('✅ Asaci services initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to initialize Asaci services:', error.message);
            throw error;
        }
    }
    /**
     * Setup application routes
     */
    setupRoutes() {
        try {
            // Health check endpoints
            this.setupHealthChecks();
            // Get route configuration with all services
            const routeConfig = (0, routes_manager_1.getDefaultRouteConfig)(this.authService, this.asaciManager, this.orassManager);
            // Create and mount application routes
            const applicationRoutes = (0, routes_manager_1.createApplicationRoutes)(this.app, routeConfig);
            this.app.use(environment_1.Environment.API_PREFIX, applicationRoutes);
            // Setup root endpoint
            this.app.get('/', (req, res) => {
                res.json({
                    message: `${environment_1.Environment.APP_NAME} API Server`,
                    environment: environment_1.Environment.NODE_ENV,
                    timestamp: new Date().toISOString()
                });
            });
            logger_1.logger.info('✅ Application routes initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to setup routes:', error.message);
            throw error;
        }
    }
    /**
     * Setup error handlers (must be last)
     */
    setupErrorHandlers() {
        // Global error handler (must be last)
        this.app.use(global_exception_handler_middleware_1.globalExceptionHandlerMiddleware);
        logger_1.logger.info('✅ Error handlers initialized');
    }
    /**
     * Set up health check endpoints
     */
    setupHealthChecks() {
        // General health check endpoint
        this.app.get('/health', async (req, res) => {
            try {
                const health = await this.getHealthStatus();
                const statusCode = health.status === 'healthy' ? 200 : 503;
                res.status(statusCode).json(health);
            }
            catch (error) {
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
        // ORASS health check
        this.app.get('/health/orass', async (req, res) => {
            try {
                const health = await this.orassManager.healthCheck();
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
        logger_1.logger.info('✅ Health check endpoints configured');
    }
    /**
     * Authenticate Asaci services
     */
    async authenticateAsaci() {
        try {
            if (!environment_1.Environment.ASACI_EMAIL || !environment_1.Environment.ASACI_PASSWORD) {
                logger_1.logger.warn('⚠️ Asaci credentials not provided. Services will require manual authentication');
                return;
            }
            await this.asaciManager.authenticate(environment_1.Environment.ASACI_EMAIL, environment_1.Environment.ASACI_PASSWORD, environment_1.Environment.ASACI_CLIENT_NAME);
            logger_1.logger.info('✅ Asaci services authenticated successfully');
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to authenticate Asaci services:', error.message);
            throw error;
        }
    }
    async connectOrass() {
        if (environment_1.Environment.ORASS_AUTO_CONNECT)
            this.orassManager.connect().catch(error => {
                logger_1.logger.error('❌ Failed to connect to ORASS:', error.message);
                throw error;
            });
    }
    /**
     * Disconnect from external services
     */
    async disconnectOrass() {
        const disconnectionPromises = [
            this.orassManager.disconnect().catch(error => {
                logger_1.logger.error('Error disconnecting ORASS:', error);
            })
        ];
        await Promise.allSettled(disconnectionPromises);
        logger_1.logger.info('✅ External services disconnected');
    }
    /**
     * Get the Express app instance
     */
    getApp() {
        return this.app;
    }
    /**
     * Get the Asaci service manager
     */
    getAsaciManager() {
        return this.asaciManager;
    }
    /**
     * Get application health status
     */
    async getHealthStatus() {
        const services = {};
        // Check Asaci service health
        try {
            services.asaci = await this.asaciManager.healthCheck();
        }
        catch (error) {
            services.asaci = {
                status: 'error',
                error: error.message,
                authenticated: false
            };
        }
        // Check ORASS service health
        try {
            services.orass = await this.orassManager.healthCheck();
        }
        catch (error) {
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
            environment: environment_1.Environment.NODE_ENV
        };
        const healthyStatuses = ['healthy', 'ok'];
        const overallStatus = Object.values(services).every(service => healthyStatuses.includes(service.status)) ? 'healthy' : 'degraded';
        return {
            status: overallStatus,
            services,
            timestamp: new Date().toISOString()
        };
    }
}
exports.App = App;
/**
 * Factory function to create and initialize the app
 */
const createApp = () => {
    try {
        const app = new App();
        logger_1.logger.info('✅ Application created successfully');
        return app;
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to create application:', error.message);
        throw error;
    }
};
exports.createApp = createApp;
exports.default = App;
//# sourceMappingURL=app.js.map