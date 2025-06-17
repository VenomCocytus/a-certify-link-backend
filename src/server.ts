import { app } from './app';
import { logger } from '@utils/logger';
import { sequelize } from './models';
import { Environment } from '@config/environment';

const PORT = Environment.PORT || 3000;
const API_PREFIX = Environment.API_PREFIX || '/api/v1';
const ENV = Environment.NODE_ENV || 'development';

async function startServer(): Promise<void> {
    try {
        // // Test database connection
        // awaits sequelize.authenticate();
        // logger.info('Database connection established successfully');
        //
        // // Sync database models (only in development)
        // if (Environment.NODE_ENV === 'development') {
        //     await sequelize.sync({ alter: true });
        //     logger.info('Database models synchronized');
        // }

        // Start server
        const server = app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`📚 API Documentation: http://localhost:${PORT}${API_PREFIX}/docs`);
            logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
            logger.info(`🔗 API base URL: http://localhost:${PORT}${API_PREFIX}`);
            logger.info(`📊 Environment: ${ENV}`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received, shutting down gracefully');
            server.close(() => {
                sequelize.close();
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            logger.info('SIGINT received, shutting down gracefully');
            server.close(() => {
                sequelize.close();
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer()