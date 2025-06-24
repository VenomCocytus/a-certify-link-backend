import { createApp, App } from './app';
import { logger } from '@utils/logger';
import { sequelize } from './models';
import { Environment } from '@config/environment';
import {validateEnvironment} from "@config/asaci-endpoints";

// Server configuration
const config = {
    port: Environment.PORT || 3000,
    host: '0.0.0.0',
    apiPrefix: Environment.API_PREFIX || '/api/v1',
    environment: Environment.NODE_ENV || 'development'
};

// Application instance
let app: App;
let server: any;

/**
 * Initialize database connection
 */
async function initializeDatabase(): Promise<void> {
    try {
        // Test database connection
        await sequelize.authenticate();
        logger.info('✅ Database connection established successfully');

        // Sync database models (only in development)
        if (Environment.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            logger.info('✅ Database models synchronized');
        }
    } catch (error: any) {
        logger.error('❌ Database initialization failed:', error.message);
        throw error;
    }
}

/**
 * Initialize application
 */
async function initializeApplication(): Promise<void> {
    try {
        // Create an application instance
        app = createApp();

        // Authenticate Asaci services
        await app.authenticateAsaci();

        logger.info('✅ Application initialized successfully');
    } catch (error: any) {
        logger.error('❌ Application initialization failed:', error.message);
        throw error;
    }
}

/**
 * Start the HTTP server
 */
async function startHttpServer(): Promise<void> {
    try {
        server = app.getApp().listen(config.port, config.host, () => {
            logger.info(`🚀 Server running on port ${config.port}`);
            logger.info(`📚 API Documentation: http://localhost:${config.port}${config.apiPrefix}/docs`);
            logger.info(`🏥 Health Check: http://localhost:${config.port}/health`);
            logger.info(`🏥 Asaci Health Check: http://localhost:${config.port}/health/asaci`);
            logger.info(`🔗 API base URL: http://localhost:${config.port}${config.apiPrefix}`);
            logger.info(`📊 Environment: ${config.environment}`);

            // Display available Asaci routes
            logger.info('\n📍 Available Asaci Routes:');
            logger.info(`   POST ${config.apiPrefix}/asaci/auth/login - Asaci Authentication`);
            logger.info(`   GET  ${config.apiPrefix}/asaci/auth/user - Current User Info`);
            logger.info(`   POST ${config.apiPrefix}/asaci/attestations/productions - Create Production Request`);
            logger.info(`   GET  ${config.apiPrefix}/asaci/attestations/certificates - List Certificates`);
            logger.info(`   POST ${config.apiPrefix}/asaci/attestations/orders - Create Order`);
            logger.info(`   POST ${config.apiPrefix}/asaci/attestations/transactions - Create Transaction`);
            logger.info(`   ... and more Asaci endpoints`);

            logger.info('\n🎯 Server ready to accept requests!');
        });

        // Handle server errors
        server.on('error', (error: any) => {
            if (error.syscall !== 'listen') {
                throw error;
            }

            const bind = typeof config.port === 'string'
                ? 'Pipe ' + config.port
                : 'Port ' + config.port;

            switch (error.code) {
                case 'EACCES':
                    logger.error(`❌ ${bind} requires elevated privileges`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    logger.error(`❌ ${bind} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });

    } catch (error: any) {
        logger.error('❌ Failed to start HTTP server:', error.message);
        throw error;
    }
}

/**
 * Perform startup health check
 */
async function performHealthCheck(): Promise<void> {
    try {
        setTimeout(async () => {
            try {
                const health = await app.getHealthStatus();
                logger.info(`📊 Startup Health Check: ${health.status}`);

                if (health.status !== 'healthy') {
                    logger.warn('⚠️ Some services may not be fully operational');
                    logger.warn('Health details:', health.services);
                } else {
                    logger.info('✅ All services are operational');
                }
            } catch (error: any) {
                logger.warn('⚠️ Health check failed on startup:', error.message);
            }
        }, 2000);
    } catch (error: any) {
        logger.warn('⚠️ Could not perform health check:', error.message);
    }
}

/**
 * Set up graceful shutdown handlers
 */
function setupGracefulShutdown(): void {
    const gracefulShutdown = (signal: string) => {
        logger.info(`🔄 Received ${signal}. Starting graceful shutdown...`);

        if (server) {
            server.close(async (err: any) => {
                if (err) {
                    logger.error('❌ Error during server shutdown:', err);
                    process.exit(1);
                }

                try {
                    // Close database connection
                    await sequelize.close();
                    logger.info('✅ Database connection closed');

                    logger.info('✅ Server shutdown completed');
                    process.exit(0);
                } catch (error: any) {
                    logger.error('❌ Error during database shutdown:', error.message);
                    process.exit(1);
                }
            });

            // Force close after 10 seconds
            setTimeout(() => {
                logger.error('❌ Forced shutdown due to timeout');
                process.exit(1);
            }, 10000);
        } else {
            process.exit(0);
        }
    };

    // Handle graceful shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

/**
 * Setup error handlers
 */
function setupErrorHandlers(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        logger.error('❌ Uncaught Exception:', error);
        process.exit(1);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
    });
}

/**
 * Main server startup function
 */
async function startServer(): Promise<void> {
    try {
        logger.info('🚀 Starting eAttestation API Server...');
        logger.info(`Environment: ${config.environment}`);
        logger.info(`Port: ${config.port}`);
        logger.info(`API Prefix: ${config.apiPrefix}`);

        // Validate environment
        validateEnvironment();

        // Setup error handlers
        setupErrorHandlers();

        // Set up a graceful shutdown
        setupGracefulShutdown();

        // Initialize database
        await initializeDatabase();

        // Initialize application
        await initializeApplication();

        // Start HTTP server
        await startHttpServer();

        // Perform health check
        await performHealthCheck();

        //TODO: Add application Insight integration
        //TODO: Add Jira integration
        //TODO: Add callback to Jira and Insight
        //TODO: Add callback when calling asa-ci

    } catch (error: any) {
        logger.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

/**
 * Get server configuration
 */
export function getServerConfig() {
    return config;
}

/**
 * Get an application instance
 */
export function getApp(): App | undefined {
    return app;
}

/**
 * Get server instance
 */
export function getServer() {
    return server;
}

// Start the server if this file is run directly
if (require.main === module) {
    startServer();
}

export { startServer, config };