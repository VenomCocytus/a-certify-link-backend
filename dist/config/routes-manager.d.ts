import { Router, Express } from 'express';
import { AsaciServiceManager } from '@config/asaci-config';
import { createAsaciRoutes } from "@/routes/asaci.routes";
import { createAuthRoutes } from "@/routes/auth.routes";
import { AuthenticationService } from "@services/authentication.service";
export interface RouteConfig {
    auth?: {
        enabled?: boolean;
        basePath?: string;
        authService?: AuthenticationService;
    };
    asaci?: {
        enabled?: boolean;
        basePath?: string;
        manager?: AsaciServiceManager;
    };
    swagger?: {
        enabled?: boolean;
        basePath?: string;
    };
    health?: {
        enabled?: boolean;
        basePath?: string;
    };
}
export declare class RoutesManager {
    private app;
    private config;
    private routes;
    constructor(app: Express, config?: RouteConfig);
    /**
     * Initialize and setup all application routes
     */
    setupRoutes(): Router;
    /**
     * Setup Swagger documentation routes
     */
    private setupSwaggerRoutes;
    /**
     * Setup health check routes
     */
    private setupHealthRoutes;
    /**
     * Setup Authentication routes
     */
    private setupAuthRoutes;
    /**
     * Setup Asaci eAttestation routes
     */
    private setupAsaciRoutes;
    /**
     * Get application health status
     */
    private getApplicationHealthStatus;
    /**
     * Get detailed health status with more comprehensive checks
     */
    private getDetailedHealthStatus;
    /**
     * Check if the application is ready to serve requests
     */
    private checkReadiness;
    /**
     * Get the main routes router
     */
    getRoutes(): Router;
    /**
     * Setup 404 handler for API routes
     */
    setup404Handler(): void;
    /**
     * Get route information for debugging
     */
    getRouteInfo(): any;
}
/**
 * Factory function to create routes with configuration
 */
export declare const createApplicationRoutes: (app: Express, config?: RouteConfig) => Router;
/**
 * Get default route configuration
 */
export declare const getDefaultRouteConfig: (authService?: AuthenticationService, asaciManager?: AsaciServiceManager) => RouteConfig;
export { createAsaciRoutes, createAuthRoutes };
//# sourceMappingURL=routes-manager.d.ts.map