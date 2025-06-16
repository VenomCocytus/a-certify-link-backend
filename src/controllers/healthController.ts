import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../services/healthService';
import { logger } from '@utils/logger';

export class HealthController {
    private healthService: HealthService;

    constructor() {
        this.healthService = new HealthService();
    }

    /**
     * Basic health check
     */
    basicHealthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const healthResult = await this.healthService.checkApplicationHealth();

            const statusCode = healthResult.status === 'healthy' ? 200 : 503;

            res.status(statusCode).json({
                status: healthResult.status,
                timestamp: healthResult.timestamp,
                version: healthResult.version,
                environment: healthResult.environment,
            });
        } catch (error) {
            logger.error('Health check failed:',