import { CertifyLinkService } from '@services/certify-link.service';
import { AsaciProductionService } from '@services/asaci-production.service';
import { OrassService } from "@services/orass-database.service";
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
export declare class OrassServiceManager {
    private config;
    private asaciProductionService;
    private orassService;
    private certifyLinkService;
    private isInitialized;
    constructor(config: OrassServiceManagerConfig, asaciProductionService: AsaciProductionService);
    /**
     * Initialize ORASS and CertifyLink services
     */
    private initializeServices;
    /**
     * Connect to ORASS database
     */
    connect(): Promise<void>;
    /**
     * Disconnect from ORASS database
     */
    disconnect(): Promise<void>;
    /**
     * Get ORASS service instance
     */
    getOrassService(): OrassService;
    /**
     * Get CertifyLink service instance
     */
    getCertifyLinkService(): CertifyLinkService;
    /**
     * Health check for all ORASS services
     */
    healthCheck(): Promise<any>;
    /**
     * Get connection status
     */
    getConnectionStatus(): Promise<any>;
}
/**
 * Factory function to create ORASS service manager
 */
export declare function createOrassServiceManager(config: OrassServiceManagerConfig, asaciProductionService: AsaciProductionService): OrassServiceManager;
/**
 * Get default ORASS configuration from environment
 */
export declare function getDefaultOrassConfig(): OrassServiceManagerConfig;
//# sourceMappingURL=orass-service-manager.d.ts.map