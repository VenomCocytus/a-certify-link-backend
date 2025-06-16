import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@utils/logger';

interface RequestWithLogging extends Request {
    requestId: string;
    startTime: number;
}

export const requestLogger = (
    req: RequestWithLogging,
    res: Response,
    next: NextFunction
): void => {
    // Generate unique request ID
    req.requestId = uuidv4();
    req.startTime = Date.now();

    // Add request ID to response headers
    res.set('X-Request-ID', req.requestId);

    // Log request start
    logger.info('Request started', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
        contentType: req.get('Content-Type'),
        contentLength: req.get('Content-Length'),
    });

    // Override res.json to log response
    const originalJson = res.json;
    res.json = function (body: any) {
        const responseTime = Date.now() - req.startTime;

        logger.info('Request completed', {
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime,
            contentLength: JSON.stringify(body).length,
            userId: (req as any).user?.id,
        });

        return originalJson.call(this, body);
    };

    // Override res.send to log response
    const originalSend = res.send;
    res.send = function (body: any) {
        const responseTime = Date.now() - req.startTime;

        logger.info('Request completed', {
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime,
            contentLength: typeof body === 'string' ? body.length : JSON.stringify(body).length,
            userId: (req as any).user?.id,
        });

        return originalSend.call(this, body);
    };

    next();
};