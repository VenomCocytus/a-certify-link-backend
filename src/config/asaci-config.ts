
import { Express } from 'express';
import {AsaciAuthenticationService} from "@services/asaci-authentication.service";
import {AsaciProductionService} from "@services/asaci-production.service";
import {AsaciOrderService} from "@services/asaci-order.service";
import {AsaciCertificateService} from "@services/asaci-certificate.service";
import {AsaciTransactionService} from "@services/asaci-transaction.service";
import {AsaciAuthenticationController} from "@controllers/asaci-authentication.controller";
import {AsaciAttestationController} from "@controllers/asaci-attestation.controller";
import {createAsaciRoutes} from "@/routes/asaci.routes";
import {globalExceptionHandlerMiddleware} from "@middlewares/global-exception-handler.middleware";

// asaci-config.ts
export interface AsaciConfig {
    baseUrl: string;
    timeout?: number;
    apiVersion?: string;
}

export class AsaciServiceManager {
    private authService: AsaciAuthenticationService;
    private asaciService: AsaciProductionService;
    private orderService: AsaciOrderService;
    private certificateService: AsaciCertificateService;
    private transactionService: AsaciTransactionService;
    private authController: AsaciAuthenticationController;
    private attestationController: AsaciAttestationController;

    constructor(config: AsaciConfig) {
        // Initialize services
        this.authService = new AsaciAuthenticationService(config.baseUrl);
        this.asaciService = new AsaciProductionService(config.baseUrl);
        this.orderService = new AsaciOrderService(config.baseUrl);
        this.certificateService = new AsaciCertificateService(config.baseUrl);
        this.transactionService = new AsaciTransactionService(config.baseUrl);

        // Initialize controllers
        this.authController = new AsaciAuthenticationController(this.authService);
        this.attestationController = new AsaciAttestationController(
            this.asaciService,
            this.orderService,
            this.certificateService,
            this.transactionService
        );
    }

    // Method to authenticate and set token for all services
    async authenticate(email: string, password: string, clientName?: string): Promise<any> {
        const tokenResponse = await this.authService.generateAccessToken({
            email,
            password,
            client_name: clientName
        });

        if (tokenResponse && tokenResponse.token) {
            const token = tokenResponse.token;

            // Set auth token for all services
            this.asaciService.setAuthToken(token);
            this.orderService.setAuthToken(token);
            this.certificateService.setAuthToken(token);
            this.transactionService.setAuthToken(token);
        }

        return tokenResponse;
    }

    // Method to set up routes on an Express app
    setupRoutes(app: Express, basePath: string = '/api/asaci'): void {
        const routes = createAsaciRoutes(this.authController, this.attestationController);
        app.use(basePath, routes);

        // Add error handler middleware
        app.use(globalExceptionHandlerMiddleware);
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

// Default configuration for preproduction environment
export const defaultPreprodConfig: AsaciConfig = {
    baseUrl: 'https://ppcoreeatci.asacitech.com',
    timeout: 30000,
    apiVersion: 'v1'
};

// Factory function to create a configured service manager
export const createAsaciServiceManager = (config?: Partial<AsaciConfig>): AsaciServiceManager => {
    const finalConfig = { ...defaultPreprodConfig, ...config };
    return new AsaciServiceManager(finalConfig);
};