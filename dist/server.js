"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const logger_1 = require("@utils/logger");
const models_1 = require("./models");
const environment_1 = require("@config/environment");
const PORT = environment_1.Environment.PORT || 3000;
const API_PREFIX = environment_1.Environment.API_PREFIX || '/api/v1';
const ENV = environment_1.Environment.NODE_ENV || 'development';
async function startServer() {
    try {
        //TODO: add a callback to Jira and Insight
        //TODO: add a callback when calling asa-ci
        // Test database connection
        await models_1.sequelize.authenticate();
        logger_1.logger.info('Database connection established successfully');
        //TODO: Determine the purpose
        // Sync database models (only in development)
        // if (Environment.NODE_ENV === 'development') {
        //     await sequelize.sync({ alter: true });
        //     logger.info('Database models synchronized');
        // }
        // Start server
        const server = app_1.app.listen(PORT, () => {
            logger_1.logger.info(`🚀 Server running on port ${PORT}`);
            logger_1.logger.info(`📚 API Documentation: http://localhost:${PORT}${API_PREFIX}/docs`);
            logger_1.logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
            logger_1.logger.info(`🔗 API base URL: http://localhost:${PORT}${API_PREFIX}`);
            logger_1.logger.info(`📊 Environment: ${ENV}`);
        });
        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger_1.logger.info('SIGTERM received, shutting down gracefully');
            server.close(() => {
                models_1.sequelize.close();
                process.exit(0);
            });
        });
        process.on('SIGINT', () => {
            logger_1.logger.info('SIGINT received, shutting down gracefully');
            server.close(() => {
                models_1.sequelize.close();
                process.exit(0);
            });
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//TODO: Add application Insight
//TODO: Add Jira
//# sourceMappingURL=server.js.map