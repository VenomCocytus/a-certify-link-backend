import { HealthServiceInterface } from '../interfaces/serviceInterfaces';
import { HealthCheckResult, ServiceHealth } from '@interfaces/common';
import { sequelize } from '@/models';
import { OrassService } from './orassService';
import { IvoryAttestationService } from './ivoryAttestationService';
import { Environment } from '@config/environment';
import { logger } from '@utils/logger';
import os from 'os';

export class HealthService implements HealthServiceInterface {
    private orassService: OrassService;
    private ivoryAttestationService: IvoryAttestationService;

    constructor() {
        this.orassService = new OrassService();
        this.ivoryAttestationService = new IvoryAttestationService();
    }

    /**
     * Check overall application health
     */
    async checkApplicationHealth(): Promise<HealthCheckResult> {
        const timestamp = new Date().toISOString();
        const services: Record<string, ServiceHealth> = {};

        try {
            // Check all services in parallel
            const [dbHealth, orassHealth, ivoryHealth] = await Promise.allSettled([
                this.checkDatabaseHealth(),
                this.checkOrassHealth(),
                this.checkIvoryAttestationHealth(),
            ]);

            // Process database health
            services.database = dbHealth.status === 'fulfilled'
                ? dbHealth.value
                : { status: 'unhealthy', message: 'Database check failed' };

            // Process Orass health
            services.orass = orassHealth.status === 'fulfilled'
                ? orassHealth.value
                : { status: 'unhealthy', message: 'Orass check failed' };

            // Process IvoryAttestation health
            services.ivoryAttestation = ivoryHealth.status === 'fulfilled'
                ? ivoryHealth.value
                : { status: 'unhealthy', message: 'IvoryAttestation check failed' };

            // Add system health
            services.system = this.getSystemHealth();

            // Determine overall status
            const healthyServices = Object.values(services).filter(s => s.status === 'healthy').length;
            const totalServices = Object.values(services).length;
            const unhealthyServices = Object.values(services).filter(s => s.status === 'unhealthy');

            let overallStatus: 'healthy' | 'unhealthy' | 'degraded';
            if (unhealthyServices.length === 0) {
                overallStatus = 'healthy';
            } else if (unhealthyServices.some(s => ['database', 'system'].includes(Object.keys(services).find(key => services[key] === s) || ''))) {
                overallStatus = 'unhealthy'; // Critical services are down
            } else {
                overallStatus = 'degraded'; // Only external services are down
            }

            return {
                status: overallStatus,
                timestamp,
                services,
                version: '1.0.0',
                environment: Environment.NODE_ENV,
            };
        } catch (error) {
            logger.error('Health check error:', error);
            return {
                status: 'unhealthy',
                timestamp,
                services: {
                    system: { status: 'unhealthy', message: 'Health check failed' },
                },
                version: '1.0.0',
                environment: Environment.NODE_ENV,
            };
        }
    }

    /**
     * Check database health
     */
    async checkDatabaseHealth(): Promise<ServiceHealth> {
        const startTime = Date.now();

        try {
            // Test authentication
            await sequelize.authenticate();

            // Test a simple query
            await sequelize.query('SELECT 1 as health_check');

            // Check connection pool status
            const pool = sequelize.connectionManager.pool;
            const poolInfo = {
                size: pool?.size || 0,
                available: pool?.available || 0,
                using: pool?.using || 0,
                waiting: pool?.waiting || 0,
            };

            const responseTime = Date.now() - startTime;

            // Determine status based on response time and pool health
            let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
            let message = 'Database connection is working normally';

            if (responseTime > 5000) {
                status = 'degraded';
                message = 'Database response time is high';
            }

            if (poolInfo.using / (poolInfo.size || 1) > 0.8) {
                status = 'degraded';
                message = 'Database connection pool is heavily utilized';
            }

            return {
                status,
                responseTime,
                message,
                lastCheck: new Date().toISOString(),
                metadata: {
                    connectionPool: poolInfo,
                    queryTest: 'passed',
                },
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            logger.error('Database health check failed:', error);

            return {
                status: 'unhealthy',
                responseTime,
                message: error instanceof Error ? error.message : 'Database connection failed',
                lastCheck: new Date().toISOString(),
                metadata: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                },
            };
        }
    }

    /**
     * Check Orass system health
     */
    async checkOrassHealth(): Promise<ServiceHealth> {
        const startTime = Date.now();

        try {
            const isConnected = await this.orassService.checkConnection();
            const responseTime = Date.now() - startTime;

            if (isConnected) {
                return {
                    status: responseTime > 10000 ? 'degraded' : 'healthy',
                    responseTime,
                    message: responseTime > 10000
                        ? 'Orass system is responding but slowly'
                        : 'Orass system is responding normally',
                    lastCheck: new Date().toISOString(),
                    metadata: {
                        baseUrl: Environment.ORASS_BASE_URL,
                        timeout: Environment.ORASS_TIMEOUT,
                    },
                };
            } else {
                return {
                    status: 'unhealthy',
                    responseTime,
                    message: 'Orass system is not responding',
                    lastCheck: new Date().toISOString(),
                    metadata: {
                        baseUrl: Environment.ORASS_BASE_URL,
                        connectionTest: 'failed',
                    },
                };
            }
        } catch (error) {
            const responseTime = Date.now() - startTime;
            logger.error('Orass health check failed:', error);

            return {
                status: 'unhealthy',
                responseTime,
                message: error instanceof Error ? error.message : 'Orass connection failed',
                lastCheck: new Date().toISOString(),
                metadata: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    baseUrl: Environment.ORASS_BASE_URL,
                },
            };
        }
    }

    /**
     * Check IvoryAttestation system health
     */
    async checkIvoryAttestationHealth(): Promise<ServiceHealth> {
        const startTime = Date.now();

        try {
            const isConnected = await this.ivoryAttestationService.checkConnection();
            const responseTime = Date.now() - startTime;

            if (isConnected) {
                return {
                    status: responseTime > 15000 ? 'degraded' : 'healthy',
                    responseTime,
                    message: responseTime > 15000
                        ? 'IvoryAttestation system is responding but slowly'
                        : 'IvoryAttestation system is responding normally',
                    lastCheck: new Date().toISOString(),
                    metadata: {
                        baseUrl: Environment.IVORY_ATTESTATION_BASE_URL,
                        timeout: Environment.IVORY_ATTESTATION_TIMEOUT,
                    },
                };
            } else {
                return {
                    status: 'unhealthy',
                    responseTime,
                    message: 'IvoryAttestation system is not responding',
                    lastCheck: new Date().toISOString(),
                    metadata: {
                        baseUrl: Environment.IVORY_ATTESTATION_BASE_URL,
                        connectionTest: 'failed',
                    },
                };
            }
        } catch (error) {
            const responseTime = Date.now() - startTime;
            logger.error('IvoryAttestation health check failed:', error);

            return {
                status: 'unhealthy',
                responseTime,
                message: error instanceof Error ? error.message : 'IvoryAttestation connection failed',
                lastCheck: new Date().toISOString(),
                metadata: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    baseUrl: Environment.IVORY_ATTESTATION_BASE_URL,
                },
            };
        }
    }

    /**
     * Get detailed health check
     */
    async getDetailedHealthCheck(): Promise<HealthCheckResult> {
        return this.checkApplicationHealth();
    }

    /**
     * Get system health information
     */
    private getSystemHealth(): ServiceHealth {
        try {
            const memoryUsage = process.memoryUsage();
            const systemMemory = {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem(),
            };

            const cpuUsage = os.loadavg();
            const uptime = process.uptime();

            // Determine system health status
            const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
            const systemMemoryUsagePercent = (systemMemory.used / systemMemory.total) * 100;

            let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
            let message = 'System is running normally';

            if (memoryUsagePercent > 90 || systemMemoryUsagePercent > 95) {
                status = 'unhealthy';
                message = 'High memory usage detected';
            } else if (memoryUsagePercent > 80 || systemMemoryUsagePercent > 85) {
                status = 'degraded';
                message = 'Elevated memory usage';
            }

            if (cpuUsage[0] > 5) { // 1-minute load average
                if (status === 'healthy') {
                    status = 'degraded';
                    message = 'High CPU load detected';
                } else {
                    message += ', high CPU load detected';
                }
            }

            return {
                status,
                message,
                lastCheck: new Date().toISOString(),
                metadata: {
                    nodeVersion: process.version,
                    platform: os.platform(),
                    architecture: os.arch(),
                    uptime: Math.floor(uptime),
                    memoryUsage: {
                        heap: {
                            used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
                            total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
                            percentage: Math.round(memoryUsagePercent),
                        },
                        system: {
                            total: Math.round(systemMemory.total / 1024 / 1024 / 1024), // GB
                            free: Math.round(systemMemory.free / 1024 / 1024 / 1024), // GB
                            used: Math.round(systemMemory.used / 1024 / 1024 / 1024), // GB
                            percentage: Math.round(systemMemoryUsagePercent),
                        },
                    },
                    cpuLoad: {
                        oneMinute: cpuUsage[0],
                        fiveMinutes: cpuUsage[1],
                        fifteenMinutes: cpuUsage[2],
                    },
                    diskSpace: this.getDiskSpace(),
                },
            };
        } catch (error) {
            logger.error('System health check error:', error);
            return {
                status: 'unhealthy',
                message: 'Failed to get system health information',
                lastCheck: new Date().toISOString(),
            };
        }
    }

    /**
     * Get disk space information (simplified)
     */
    private getDiskSpace(): any {
        try {
            // This is a simplified version. In production, you might want to use a library like 'diskusage'
            return {
                available: 'N/A - require diskusage library for accurate disk space monitoring',
            };
        } catch (error) {
            return {
                error: 'Failed to get disk space information',
            };
        }
    }

    /**
     * Run health checks with custom timeout
     */
    async runHealthChecksWithTimeout(timeoutMs: number = 30000): Promise<HealthCheckResult> {
        return Promise.race([
            this.checkApplicationHealth(),
            new Promise<HealthCheckResult>((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Health check timeout after ${timeoutMs}ms`));
                }, timeoutMs);
            }),
        ]).catch((error) => {
            logger.error('Health check timeout or error:', error);
            return {
                status: 'unhealthy' as const,
                timestamp: new Date().toISOString(),
                services: {
                    system: {
                        status: 'unhealthy' as const,
                        message: error.message || 'Health check failed',
                    },
                },
                version: '1.0.0',
                environment: Environment.NODE_ENV,
            };
        });
    }
}