"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.getServerConfig = getServerConfig;
exports.getApp = getApp;
exports.getServer = getServer;
exports.startServer = startServer;
require("reflect-metadata");
const app_1 = require("./app");
const logger_1 = require("@utils/logger");
const models_1 = require("./models");
const environment_1 = require("@config/environment");
const asaci_endpoints_1 = require("@config/asaci-endpoints");
const config = {
    appName: environment_1.Environment.APP_NAME,
    port: environment_1.Environment.PORT,
    apiPrefix: environment_1.Environment.API_PREFIX,
    environment: environment_1.Environment.NODE_ENV
};
exports.config = config;
let app;
let server;
async function initializeApplication() {
    try {
        app = (0, app_1.createApp)();
        await app.authenticateAsaci();
        logger_1.logger.info('✅ Application initialized successfully');
    }
    catch (error) {
        logger_1.logger.error('❌ Application initialization failed:', error.message);
        throw error;
    }
}
async function startHttpServer() {
    try {
        server = app.getApp().listen(config.port, () => {
            logger_1.logger.info(`🚀 Server running on port ${config.port}`);
            logger_1.logger.info(`📚 API Documentation: http://localhost:${config.port}${config.apiPrefix}/docs`);
            logger_1.logger.info(`🏥 Health Check: http://localhost:${config.port}/health`);
            logger_1.logger.info(`🏥 Asaci Health Check: http://localhost:${config.port}/health/asaci`);
            logger_1.logger.info(`🔗 API base URL: http://localhost:${config.port}${config.apiPrefix}`);
            logger_1.logger.info(`📊 Environment: ${config.environment}`);
            logger_1.logger.info('\n🎯 Server ready to accept requests!');
        });
        // Handle server errors
        server.on('error', (error) => {
            if (error.syscall !== 'listen') {
                throw error;
            }
            const bind = 'Port ' + config.port;
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
    const gracefulShutdown = (signal) => {
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
        logger_1.logger.info(`🚀 Starting ${config.appName} API Server...`);
        logger_1.logger.info(`Environment: ${config.environment}`);
        logger_1.logger.info(`Port: ${config.port}`);
        logger_1.logger.info(`API Prefix: ${config.apiPrefix}`);
        // Validate environment
        (0, asaci_endpoints_1.validateEnvironment)();
        // Initialize application
        await initializeApplication();
        // Setup error handlers
        setupErrorHandlers();
        // Set up a graceful shutdown
        setupGracefulShutdown();
        // Initialize database
        await (0, models_1.initializeDatabase)();
        // Start HTTP server
        await startHttpServer();
        // Perform health check
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
function getServerConfig() {
    return config;
}
function getApp() {
    return app;
}
function getServer() {
    return server;
}
// Start the server if this file is run directly
if (require.main === module) {
    startServer();
}
//# sourceMappingURL=server.js.map