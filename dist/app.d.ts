import { Express } from 'express';
import { AsaciServiceManager } from "@config/asaci-config";
export declare class App {
    app: Express;
    private asaciManager;
    private orassManager;
    private authService;
    constructor();
    /**
     * Initialize i18next for internationalization
     */
    private initializeI18n;
    /**
     * Setup application middleware
     */
    private setupMiddleware;
    /**
     * Initialize Asaci services
     */
    private initializeServices;
    /**
     * Setup application routes
     */
    private setupRoutes;
    /**
     * Setup error handlers (must be last)
     */
    private setupErrorHandlers;
    /**
     * Set up health check endpoints
     */
    private setupHealthChecks;
    /**
     * Authenticate Asaci services
     */
    authenticateAsaci(): Promise<void>;
    connectOrass(): Promise<void>;
    /**
     * Disconnect from external services
     */
    disconnectOrass(): Promise<void>;
    /**
     * Get the Express app instance
     */
    getApp(): Express;
    /**
     * Get the Asaci service manager
     */
    getAsaciManager(): AsaciServiceManager;
    /**
     * Get application health status
     */
    getHealthStatus(): Promise<any>;
}
/**
 * Factory function to create and initialize the app
 */
export declare const createApp: () => App;
export default App;
//# sourceMappingURL=app.d.ts.map