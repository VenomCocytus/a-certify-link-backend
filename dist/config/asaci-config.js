"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAsaciServiceManager = exports.defaultPreprodConfig = exports.initializeAsaciServices = exports.AsaciServiceManager = void 0;
const asaci_authentication_service_1 = require("@services/asaci-authentication.service");
const asaci_production_service_1 = require("@services/asaci-production.service");
const asaci_order_service_1 = require("@services/asaci-order.service");
const asaci_certificate_service_1 = require("@services/asaci-certificate.service");
const asaci_transaction_service_1 = require("@services/asaci-transaction.service");
const asaci_authentication_controller_1 = require("@controllers/asaci-authentication.controller");
const asaci_attestation_controller_1 = require("@controllers/asaci-attestation.controller");
const asaci_routes_1 = require("@/routes/asaci.routes");
const global_exception_handler_middleware_1 = require("@middlewares/global-exception-handler.middleware");
class AsaciServiceManager {
    constructor(config) {
        // Initialize services
        this.authService = new asaci_authentication_service_1.AsaciAuthenticationService(config.baseUrl);
        this.asaciService = new asaci_production_service_1.AsaciProductionService(config.baseUrl);
        this.orderService = new asaci_order_service_1.AsaciOrderService(config.baseUrl);
        this.certificateService = new asaci_certificate_service_1.AsaciCertificateService(config.baseUrl);
        this.transactionService = new asaci_transaction_service_1.AsaciTransactionService(config.baseUrl);
        // Initialize controllers
        this.authController = new asaci_authentication_controller_1.AsaciAuthenticationController(this.authService);
        this.attestationController = new asaci_attestation_controller_1.AsaciAttestationController(this.asaciService, this.orderService, this.certificateService, this.transactionService);
    }
    // Method to authenticate and set token for all services
    async authenticate(email, password, clientName) {
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
    setupRoutes(app, basePath = '/api/asaci') {
        const routes = (0, asaci_routes_1.createAsaciRoutes)(this.authController, this.attestationController);
        app.use(basePath, routes);
        // Add error handler middleware
        app.use(global_exception_handler_middleware_1.globalExceptionHandlerMiddleware);
    }
    // Getter methods for services
    getAuthService() {
        return this.authService;
    }
    getProductionService() {
        return this.asaciService;
    }
    getOrderService() {
        return this.orderService;
    }
    getCertificateService() {
        return this.certificateService;
    }
    getTransactionService() {
        return this.transactionService;
    }
    // Health check method
    async healthCheck() {
        return {
            status: 'ok',
            authenticated: this.authService.isAuthenticated(),
            timestamp: new Date().toISOString()
        };
    }
}
exports.AsaciServiceManager = AsaciServiceManager;
const initializeAsaciServices = (config) => {
    return new AsaciServiceManager(config);
};
exports.initializeAsaciServices = initializeAsaciServices;
// Default configuration for preproduction environment
exports.defaultPreprodConfig = {
    baseUrl: 'https://ppcoreeatci.asacitech.com',
    timeout: 30000,
    apiVersion: 'v1'
};
// Factory function to create a configured service manager
const createAsaciServiceManager = (config) => {
    const finalConfig = { ...exports.defaultPreprodConfig, ...config };
    return new AsaciServiceManager(finalConfig);
};
exports.createAsaciServiceManager = createAsaciServiceManager;
//# sourceMappingURL=asaci-config.js.map