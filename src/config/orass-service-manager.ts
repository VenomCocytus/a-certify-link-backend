import { CertifyLinkService } from '@services/certify-link.service';
import { AsaciProductionService } from '@services/asaci-production.service';
import { logger } from '@utils/logger';
import {OrassService} from "@services/orass-database.service";

export class OrassServiceManager {
    private orassService: OrassService;
    private certifyLinkService: CertifyLinkService;
    private isInitialized: boolean = false;

    constructor(private asaciProductionService: AsaciProductionService) {
        this.initializeServices();
    }

    /**
     * Initialize ORASS and CertifyLink services
     */
    private initializeServices(): void {
        try {
            this.orassService = new OrassService();
            this.certifyLinkService = new CertifyLinkService(
                this.orassService,
                this.asaciProductionService
            );

            this.isInitialized = true;
            logger.info('✅ ORASS services initialized successfully');

        } catch (error: any) {
            logger.error('❌ Failed to initialize ORASS services:', error);
            throw error;
        }
    }

    /**
     * Connect to ORASS database
     */
    async connect(): Promise<void> {
        if (!this.isInitialized) {
            throw new Error('ORASS services not initialized');
        }

        try {
            await this.orassService.connect();
            logger.info('✅ ORASS database connected successfully');
        } catch (error: any) {
            logger.error('❌ Failed to connect to ORASS database:', error);
            throw error;
        }
    }

    /**
     * Disconnect from an ORASS database
     */
    async disconnect(): Promise<void> {
        if (!this.isInitialized) {
            return;
        }

        try {
            await this.orassService.disconnect();
            logger.info('✅ ORASS database disconnected successfully');
        } catch (error: any) {
            logger.error('❌ Error disconnecting from ORASS database:', error);
        }
    }

    /**
     * Get ORASS service instance
     */
    getOrassService(): OrassService {
        if (!this.isInitialized) {
            throw new Error('ORASS services not initialized');
        }
        return this.orassService;
    }

    /**
     * Get a CertifyLink service instance
     */
    getCertifyLinkService(): CertifyLinkService {
        if (!this.isInitialized) {
            throw new Error('ORASS services not initialized');
        }
        return this.certifyLinkService;
    }

    /**
     * Health check for all ORASS services
     */
    async healthCheck(): Promise<any> {
        try {
            if (!this.isInitialized) {
                return {
                    status: 'unhealthy',
                    error: 'Services not initialized',
                    timestamp: new Date().toISOString()
                };
            }

            const orassHealth = await this.orassService.healthCheck();
            const certifyLinkHealth = await this.certifyLinkService.healthCheck();

            const overallStatus = orassHealth.status === 'healthy' &&
            certifyLinkHealth.status === 'healthy'
                ? 'healthy' : 'degraded';

            return {
                status: overallStatus,
                services: {
                    orass: orassHealth,
                    certifyLink: certifyLinkHealth
                },
                timestamp: new Date().toISOString()
            };

        } catch (error: any) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get connection status
     */
    async getConnectionStatus(): Promise<any> {
        if (!this.isInitialized) {
            return {
                connected: false,
                error: 'Services not initialized'
            };
        }

        return await this.orassService.getConnectionStatus();
    }
}

/**
 * Factory function to create ORASS service manager
 */
export function createOrassServiceManager(asaciProductionService: AsaciProductionService)
    : OrassServiceManager {
    try {
        const manager = new OrassServiceManager(asaciProductionService);
        logger.info('✅ ORASS service manager created successfully');
        return manager;
    } catch (error: any) {
        logger.error('❌ Failed to create ORASS service manager:', error);
        throw error;
    }
}