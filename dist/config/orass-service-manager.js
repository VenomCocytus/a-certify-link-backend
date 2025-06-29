"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrassServiceManager = void 0;
exports.createOrassServiceManager = createOrassServiceManager;
exports.getDefaultOrassConfig = getDefaultOrassConfig;
const certify_link_service_1 = require("@services/certify-link.service");
const logger_1 = require("@utils/logger");
const environment_1 = require("@config/environment");
const orass_database_service_1 = require("@services/orass-database.service");
class OrassServiceManager {
    constructor(config, asaciProductionService) {
        this.config = config;
        this.asaciProductionService = asaciProductionService;
        this.isInitialized = false;
        this.initializeServices();
    }
    /**
     * Initialize ORASS and CertifyLink services
     */
    initializeServices() {
        try {
            // Create ORASS connection config
            const connectionConfig = {
                host: this.config.host,
                port: this.config.port,
                sid: this.config.sid,
                username: this.config.username,
                password: this.config.password,
                connectionTimeout: this.config.connectionTimeout || 30000,
                requestTimeout: this.config.requestTimeout || 60000,
            };
            // Initialize ORASS service
            this.orassService = new orass_database_service_1.OrassService(connectionConfig);
            // Initialize CertifyLink service with dependencies
            this.certifyLinkService = new certify_link_service_1.CertifyLinkService(this.orassService, this.asaciProductionService);
            this.isInitialized = true;
            logger_1.logger.info('✅ ORASS services initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to initialize ORASS services:', error);
            throw error;
        }
    }
    /**
     * Connect to ORASS database
     */
    async connect() {
        if (!this.isInitialized) {
            throw new Error('ORASS services not initialized');
        }
        try {
            await this.orassService.connect();
            logger_1.logger.info('✅ ORASS database connected successfully');
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to connect to ORASS database:', error);
            throw error;
        }
    }
    /**
     * Disconnect from ORASS database
     */
    async disconnect() {
        if (!this.isInitialized) {
            return;
        }
        try {
            await this.orassService.disconnect();
            logger_1.logger.info('✅ ORASS database disconnected successfully');
        }
        catch (error) {
            logger_1.logger.error('❌ Error disconnecting from ORASS database:', error);
        }
    }
    /**
     * Get ORASS service instance
     */
    getOrassService() {
        if (!this.isInitialized) {
            throw new Error('ORASS services not initialized');
        }
        return this.orassService;
    }
    /**
     * Get CertifyLink service instance
     */
    getCertifyLinkService() {
        if (!this.isInitialized) {
            throw new Error('ORASS services not initialized');
        }
        return this.certifyLinkService;
    }
    /**
     * Health check for all ORASS services
     */
    async healthCheck() {
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
        }
        catch (error) {
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
    async getConnectionStatus() {
        if (!this.isInitialized) {
            return {
                connected: false,
                error: 'Services not initialized'
            };
        }
        return await this.orassService.getConnectionStatus();
    }
}
exports.OrassServiceManager = OrassServiceManager;
/**
 * Factory function to create ORASS service manager
 */
function createOrassServiceManager(config, asaciProductionService) {
    try {
        const manager = new OrassServiceManager(config, asaciProductionService);
        logger_1.logger.info('✅ ORASS service manager created successfully');
        return manager;
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to create ORASS service manager:', error);
        throw error;
    }
}
/**
 * Get default ORASS configuration from environment
 */
function getDefaultOrassConfig() {
    return {
        host: environment_1.Environment.ORASS_HOST,
        port: environment_1.Environment.ORASS_PORT,
        sid: environment_1.Environment.ORASS_SID,
        username: environment_1.Environment.ORASS_USERNAME,
        password: environment_1.Environment.ORASS_PASSWORD,
        connectionTimeout: environment_1.Environment.ORASS_CONNECTION_TIMEOUT || 30000,
        requestTimeout: environment_1.Environment.ORASS_REQUEST_TIMEOUT || 60000,
        autoConnect: environment_1.Environment.ORASS_AUTO_CONNECT
    };
}
//# sourceMappingURL=orass-service-manager.js.map