
import {AsaciAuthenticationService} from "@services/asaci-authentication.service";
import {AsaciProductionService} from "@services/asaci-production.service";
import {AsaciOrderService} from "@services/asaci-order.service";
import {AsaciCertificateService} from "@services/asaci-certificate.service";
import {AsaciTransactionService} from "@services/asaci-transaction.service";
import {AsaciConfig} from "@interfaces/common.interfaces";
import {getAsaciConfig} from "@config/environment";
import {ConnectionStatus, HealthStatus} from "@interfaces/common.enum";

export class AsaciServices {
    private asaciAuthService: AsaciAuthenticationService;
    private asaciProductionService: AsaciProductionService;
    private asaciOrderService: AsaciOrderService;
    private asaciCertificateService: AsaciCertificateService;
    private asaciTransactionService: AsaciTransactionService;

    constructor(config: AsaciConfig) {
        this.asaciAuthService = new AsaciAuthenticationService(config.baseUrl);
        this.asaciProductionService = new AsaciProductionService(config.baseUrl);
        this.asaciOrderService = new AsaciOrderService(config.baseUrl);
        this.asaciCertificateService = new AsaciCertificateService(config.baseUrl);
        this.asaciTransactionService = new AsaciTransactionService(config.baseUrl);
    }

    async authenticate(email: string, password: string, clientName?: string): Promise<any> {
        const tokenResponse = await this.asaciAuthService.generateAccessToken({
            email,
            password,
            client_name: clientName
        });

        if (tokenResponse && tokenResponse.token) {
            const token = tokenResponse.token;

            this.asaciProductionService.setAuthToken(token);
            this.asaciOrderService.setAuthToken(token);
            this.asaciCertificateService.setAuthToken(token);
            this.asaciTransactionService.setAuthToken(token);
        }

        return tokenResponse;
    }

    // Getter methods for services
    getAuthService(): AsaciAuthenticationService {
        return this.asaciAuthService;
    }

    getProductionService(): AsaciProductionService {
        return this.asaciProductionService;
    }

    getOrderService(): AsaciOrderService {
        return this.asaciOrderService;
    }

    getCertificateService(): AsaciCertificateService {
        return this.asaciCertificateService;
    }

    getTransactionService(): AsaciTransactionService {
        return this.asaciTransactionService;
    }

    async healthCheck(): Promise<{ status: string; connection: string; timestamp: string; error?: any }> {
        try {
            return {
                status: HealthStatus.HEALTHY,
                connection: this.asaciAuthService.isAuthenticated() ?
                    ConnectionStatus.ACTIVE : ConnectionStatus.FAILED,
                timestamp: new Date().toISOString()
            };
        }
        catch (error: any) {
            return {
                status: HealthStatus.UNHEALTHY,
                connection: ConnectionStatus.FAILED,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }

    }
}

export const initializeAsaciServices = (config: AsaciConfig): AsaciServices => {
    return new AsaciServices(config);
};

export const defaultPreprodConfig: AsaciConfig = getAsaciConfig();

// Factory function to create a configured service manager
export const createAsaciServiceManager = (config?: Partial<AsaciConfig>): AsaciServices => {
    const finalConfig = { ...defaultPreprodConfig, ...config };
    return new AsaciServices(finalConfig);
};