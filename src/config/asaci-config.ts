
import {AsaciAuthenticationService} from "@services/asaci-authentication.service";
import {AsaciProductionService} from "@services/asaci-production.service";
import {AsaciOrderService} from "@services/asaci-order.service";
import {AsaciCertificateService} from "@services/asaci-certificate.service";
import {AsaciTransactionService} from "@services/asaci-transaction.service";
import {AsaciConfig} from "@interfaces/common.interfaces";
import {getAsaciConfig} from "@config/environment";

export class AsaciServiceManager {
    private authService: AsaciAuthenticationService;
    private asaciService: AsaciProductionService;
    private orderService: AsaciOrderService;
    private certificateService: AsaciCertificateService;
    private transactionService: AsaciTransactionService;

    constructor(config: AsaciConfig) {
        this.authService = new AsaciAuthenticationService(config.baseUrl);
        this.asaciService = new AsaciProductionService(config.baseUrl);
        this.orderService = new AsaciOrderService(config.baseUrl);
        this.certificateService = new AsaciCertificateService(config.baseUrl);
        this.transactionService = new AsaciTransactionService(config.baseUrl);
    }

    async authenticate(email: string, password: string, clientName?: string): Promise<any> {
        const tokenResponse = await this.authService.generateAccessToken({
            email,
            password,
            client_name: clientName
        });

        if (tokenResponse && tokenResponse.token) {
            const token = tokenResponse.token;

            this.asaciService.setAuthToken(token);
            this.orderService.setAuthToken(token);
            this.certificateService.setAuthToken(token);
            this.transactionService.setAuthToken(token);
        }

        return tokenResponse;
    }

    // Getter methods for services
    getAuthService(): AsaciAuthenticationService {
        return this.authService;
    }

    getProductionService(): AsaciProductionService {
        return this.asaciService;
    }

    getOrderService(): AsaciOrderService {
        return this.orderService;
    }

    getCertificateService(): AsaciCertificateService {
        return this.certificateService;
    }

    getTransactionService(): AsaciTransactionService {
        return this.transactionService;
    }

    // Health check method
    async healthCheck(): Promise<{ status: string; authenticated: boolean; timestamp: string }> {
        return {
            status: 'ok',
            authenticated: this.authService.isAuthenticated(),
            timestamp: new Date().toISOString()
        };
    }
}

export const initializeAsaciServices = (config: AsaciConfig): AsaciServiceManager => {
    return new AsaciServiceManager(config);
};

export const defaultPreprodConfig: AsaciConfig = getAsaciConfig();

// Factory function to create a configured service manager
export const createAsaciServiceManager = (config?: Partial<AsaciConfig>): AsaciServiceManager => {
    const finalConfig = { ...defaultPreprodConfig, ...config };
    return new AsaciServiceManager(finalConfig);
};