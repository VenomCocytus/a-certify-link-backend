import winston from 'winston';
import {isDevelopment, isTest} from '@config/environment';

const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL,
    format: logFormat,
    defaultMeta: { service: process.env.APP_NAME },
    transports: [
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        }),
        new winston.transports.File({
            filename: process.env.LOG_FILE,
        }),
    ],
});

if (isDevelopment() || isTest()) {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        })
    );
}

export { logger };