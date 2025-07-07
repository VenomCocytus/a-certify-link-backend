import dotenv from "dotenv";
import { App, createApp } from "@/app";
import { logger } from "@utils/logger";
import { initializeDatabase, sequelize } from "@/models";
import { validateEnvironment } from "@config/asaci-endpoints";
import {HealthStatus} from "@interfaces/common.enum";

dotenv.config();

let app: App;
let server: any;

export async function initializeApplication(): Promise<void> {
    try {
        //TODO: The app must not freeze on startup if not able to connect to ORASS
        //TODO: Check if the orass service is healthy before making a new attestation creation
        app = createApp();
        await app.authenticateAsaci();
        // await app.connectOrass();

        logger.info('✅ Application initialized successfully');
    } catch (error: any) {
        logger.error('❌ Application initialization failed:', error.message);
        throw error;
    }
}

export async function startHttpServer(): Promise<void> {
    try {
        if (!app) {
            throw new Error('Application not initialized');
        }

        const port = process.env.PORT;
        if (!port) {
            throw new Error('Port not configured');
        }

        server = app.getApp().listen(port, () => {
            logger.info(`🚀 Server running on port ${port}`);
            logger.info(`📚 API Documentation: http://localhost:${port}${process.env.API_PREFIX}/docs`);
            logger.info(`🏥 Health Check: http://localhost:${port}/health`);
            logger.info(`🏥 Asaci Health Check: http://localhost:${port}/health/asaci`);
            logger.info(`🔗 API base URL: http://localhost:${port}${process.env.API_PREFIX}`);
            logger.info(`📊 Environment: ${process.env.NODE_ENV}`);

            logger.info('\n🎯 Server ready to accept requests!');
        });

        // Handling server errors
        server.on('error', (error: any) => {
            if (error.syscall !== 'listen') {
                throw error;
            }
            const bind = 'Port ' + port;

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

export async function performHealthCheck(): Promise<void> {
    try {
        if (!app) {
            throw new Error('Application not initialized');
        }

        setTimeout(async () => {
            try {
                const health = await app.getHealthStatus();
                logger.info(`📊 Startup Health Check: ${health.status}`);

                if (health.status !== HealthStatus.HEALTHY) {
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

export function setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
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

                    if (app) {
                        await app.disconnectOrass();
                    }

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

export function setupErrorHandlers(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        logger.error('❌ Uncaught Exception:', error);
        process.exit(1);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason: any, promise) => {
        logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
    });
}

export async function startServer(): Promise<void> {
    try {
        logger.info(`🚀 Starting ${process.env.APP_NAME} API Server...`);
        logger.info(`Environment: ${process.env.NODE_ENV}`);
        logger.info(`Port: ${process.env.PORT}`);
        logger.info(`API Prefix: ${process.env.API_PREFIX}`);

        validateEnvironment();
        await initializeDatabase();
        await initializeApplication();
        setupErrorHandlers();
        setupGracefulShutdown();
        await startHttpServer();
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