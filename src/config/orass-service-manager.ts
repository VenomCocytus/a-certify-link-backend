import { CertifyLinkService } from '@services/certify-link.service';
import { AsaciProductionService } from '@services/asaci-production.service';
import { logger } from '@utils/logger';
import { Environment } from '@config/environment';
import {OrassService} from "@services/orass-database.service";
import {OrassConnectionConfig} from "@interfaces/orass.interfaces";

export interface OrassServiceManagerConfig {
    host: string;
    port: number;
    sid: string;
    username: string;
    password: string;
    connectionTimeout?: number;
    requestTimeout?: number;
    autoConnect?: boolean;
}

export class OrassServiceManager {
    private orassService: OrassService;
    private certifyLinkService: CertifyLinkService;
    private isInitialized: boolean = false;

    constructor(
        private config: OrassServiceManagerConfig,
        private asaciProductionService: AsaciProductionService
    ) {
        this.initializeServices();
    }

    /**
     * Initialize ORASS and CertifyLink services
     */
    private initializeServices(): void {
        try {
            // Create ORASS connection config
            const connectionConfig: OrassConnectionConfig = {
                host: this.config.host,
                port: this.config.port,
                sid: this.config.sid,
                username: this.config.username,
                password: this.config.password,
                connectionTimeout: this.config.connectionTimeout || 30000,
                requestTimeout: this.config.requestTimeout || 60000,
            };

            // Initialize ORASS service
            this.orassService = new OrassService(connectionConfig);

            // Initialize CertifyLink service with dependencies
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
     * Disconnect from ORASS database
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
     * Get CertifyLink service instance
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
export function createOrassServiceManager(
    config: OrassServiceManagerConfig,
    asaciProductionService: AsaciProductionService
): OrassServiceManager {
    try {
        const manager = new OrassServiceManager(config, asaciProductionService);
        logger.info('✅ ORASS service manager created successfully');
        return manager;
    } catch (error: any) {
        logger.error('❌ Failed to create ORASS service manager:', error);
        throw error;
    }
}

/**
 * Get default ORASS configuration from environment
 */
export function getDefaultOrassConfig(): OrassServiceManagerConfig {
    return {
        host: Environment.ORASS_HOST,
        port: Environment.ORASS_PORT,
        sid: Environment.ORASS_SID,
        username: Environment.ORASS_USERNAME,
        password: Environment.ORASS_PASSWORD,
        connectionTimeout: Environment.ORASS_CONNECTION_TIMEOUT || 30000,
        requestTimeout: Environment.ORASS_REQUEST_TIMEOUT || 60000,
        autoConnect: Environment.ORASS_AUTO_CONNECT
    };
}