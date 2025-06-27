import { Express } from 'express';
import { AsaciAuthenticationService } from "@services/asaci-authentication.service";
import { AsaciProductionService } from "@services/asaci-production.service";
import { AsaciOrderService } from "@services/asaci-order.service";
import { AsaciCertificateService } from "@services/asaci-certificate.service";
import { AsaciTransactionService } from "@services/asaci-transaction.service";
export interface AsaciConfig {
    baseUrl: string;
    timeout?: number;
    apiVersion?: string;
}
export declare class AsaciServiceManager {
    private authService;
    private asaciService;
    private orderService;
    private certificateService;
    private transactionService;
    private authController;
    private attestationController;
    constructor(config: AsaciConfig);
    authenticate(email: string, password: string, clientName?: string): Promise<any>;
    setupRoutes(app: Express, basePath?: string): void;
    getAuthService(): AsaciAuthenticationService;
    getProductionService(): AsaciProductionService;
    getOrderService(): AsaciOrderService;
    getCertificateService(): AsaciCertificateService;
    getTransactionService(): AsaciTransactionService;
    healthCheck(): Promise<{
        status: string;
        authenticated: boolean;
        timestamp: string;
    }>;
}
export declare const initializeAsaciServices: (config: AsaciConfig) => AsaciServiceManager;
export declare const defaultPreprodConfig: AsaciConfig;
export declare const createAsaciServiceManager: (config?: Partial<AsaciConfig>) => AsaciServiceManager;
//# sourceMappingURL=asaci-config.d.ts.map