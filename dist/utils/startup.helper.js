"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeApplication = initializeApplication;
exports.startHttpServer = startHttpServer;
exports.performHealthCheck = performHealthCheck;
exports.setupGracefulShutdown = setupGracefulShutdown;
exports.setupErrorHandlers = setupErrorHandlers;
exports.startServer = startServer;
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("@/app");
const logger_1 = require("@utils/logger");
const models_1 = require("@/models");
const asaci_endpoints_1 = require("@config/asaci-endpoints");
dotenv_1.default.config();
let app;
let server;
async function initializeApplication() {
    try {
        app = (0, app_1.createApp)();
        await app.authenticateAsaci();
        await app.connectOrass();
        logger_1.logger.info('✅ Application initialized successfully');
    }
    catch (error) {
        logger_1.logger.error('❌ Application initialization failed:', error.message);
        throw error;
    }
}
async function startHttpServer() {
    try {
        if (!app) {
            throw new Error('Application not initialized');
        }
        const port = process.env.PORT || process.env.port; // Added fallback
        if (!port) {
            throw new Error('Port not configured');
        }
        server = app.getApp().listen(port, () => {
            logger_1.logger.info(`🚀 Server running on port ${port}`);
            logger_1.logger.info(`📚 API Documentation: http://localhost:${port}${process.env.apiPrefix}/docs`);
            logger_1.logger.info(`🏥 Health Check: http://localhost:${port}/health`);
            logger_1.logger.info(`🏥 Asaci Health Check: http://localhost:${port}/health/asaci`);
            logger_1.logger.info(`🔗 API base URL: http://localhost:${port}${process.env.apiPrefix}`);
            logger_1.logger.info(`📊 Environment: ${process.env.environment}`);
            logger_1.logger.info('\n🎯 Server ready to accept requests!');
        });
        // Handling server errors
        server.on('error', (error) => {
            if (error.syscall !== 'listen') {
                throw error;
            }
            const bind = 'Port ' + port;
            switch (error.code) {
                case 'EACCES':
                    logger_1.logger.error(`❌ ${bind} requires elevated privileges`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    logger_1.logger.error(`❌ ${bind} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to start HTTP server:', error.message);
        throw error;
    }
}
async function performHealthCheck() {
    try {
        if (!app) {
            throw new Error('Application not initialized');
        }
        setTimeout(async () => {
            try {
                const health = await app.getHealthStatus();
                logger_1.logger.info(`📊 Startup Health Check: ${health.status}`);
                if (health.status !== 'healthy') {
                    logger_1.logger.warn('⚠️ Some services may not be fully operational');
                    logger_1.logger.warn('Health details:', health.services);
                }
                else {
                    logger_1.logger.info('✅ All services are operational');
                }
            }
            catch (error) {
                logger_1.logger.warn('⚠️ Health check failed on startup:', error.message);
            }
        }, 2000);
    }
    catch (error) {
        logger_1.logger.warn('⚠️ Could not perform health check:', error.message);
    }
}
function setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
        logger_1.logger.info(`🔄 Received ${signal}. Starting graceful shutdown...`);
        if (server) {
            server.close(async (err) => {
                if (err) {
                    logger_1.logger.error('❌ Error during server shutdown:', err);
                    process.exit(1);
                }
                try {
                    // Close database connection
                    await models_1.sequelize.close();
                    logger_1.logger.info('✅ Database connection closed');
                    if (app) {
                        await app.disconnectOrass();
                    }
                    logger_1.logger.info('✅ Server shutdown completed');
                    process.exit(0);
                }
                catch (error) {
                    logger_1.logger.error('❌ Error during database shutdown:', error.message);
                    process.exit(1);
                }
            });
            // Force close after 10 seconds
            setTimeout(() => {
                logger_1.logger.error('❌ Forced shutdown due to timeout');
                process.exit(1);
            }, 10000);
        }
        else {
            process.exit(0);
        }
    };
    // Handle graceful shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
function setupErrorHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        logger_1.logger.error('❌ Uncaught Exception:', error);
        process.exit(1);
    });
    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
        logger_1.logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
    });
}
async function startServer() {
    try {
        logger_1.logger.info(`🚀 Starting ${process.env.appName} API Server...`);
        logger_1.logger.info(`Environment: ${process.env.environment}`);
        logger_1.logger.info(`Port: ${process.env.PORT || process.env.port}`);
        logger_1.logger.info(`API Prefix: ${process.env.apiPrefix}`);
        (0, asaci_endpoints_1.validateEnvironment)();
        await (0, models_1.initializeDatabase)();
        await initializeApplication();
        setupErrorHandlers();
        setupGracefulShutdown();
        await startHttpServer();
        await performHealthCheck();
        //TODO: Add application Insight integration
        //TODO: Add Jira integration
        //TODO: Add callback to Jira and Insight
        //TODO: Add callback when calling asa-ci
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}
//# sourceMappingURL=startup.helper.js.map