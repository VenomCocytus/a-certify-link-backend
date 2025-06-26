import 'reflect-metadata';
import { createApp, App } from './app';
import { logger } from '@utils/logger';
import {initializeDatabase, sequelize} from './models';
import { Environment } from '@config/environment';
import {validateEnvironment} from "@config/asaci-endpoints";

const config = {
    appName: Environment.APP_NAME,
    port: Environment.PORT,
    apiPrefix: Environment.API_PREFIX,
    environment: Environment.NODE_ENV
};

let app: App;
let server: any;

async function initializeApplication(): Promise<void> {
    try {
        app = createApp();
        await app.authenticateAsaci();

        logger.info('✅ Application initialized successfully');
    } catch (error: any) {
        logger.error('❌ Application initialization failed:', error.message);
        throw error;
    }
}

async function startHttpServer(): Promise<void> {
    try {
        server = app.getApp().listen(config.port, () => {
            logger.info(`🚀 Server running on port ${config.port}`);
            logger.info(`📚 API Documentation: http://localhost:${config.port}${config.apiPrefix}/docs`);
            logger.info(`🏥 Health Check: http://localhost:${config.port}/health`);
            logger.info(`🏥 Asaci Health Check: http://localhost:${config.port}/health/asaci`);
            logger.info(`🔗 API base URL: http://localhost:${config.port}${config.apiPrefix}`);
            logger.info(`📊 Environment: ${config.environment}`);

            logger.info('\n🎯 Server ready to accept requests!');
        });

        // Handle server errors
        server.on('error', (error: any) => {
            if (error.syscall !== 'listen') {
                throw error;
            }

            const bind = 'Port ' + config.port;

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

async function startServer(): Promise<void> {
    try {
        logger.info(`🚀 Starting ${config.appName} API Server...`);
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

export function getServerConfig() {
    return config;
}

export function getApp(): App | undefined {
    return app;
}

export function getServer() {
    return server;
}

// Start the server if this file is run directly
if (require.main === module) {
    startServer();
}

export { startServer, config };