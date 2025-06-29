import { OrassConnectionConfig, OrassPolicy, OrassPolicySearchCriteria, OrassQueryResult, OrassConnectionStatus } from '@interfaces/orass.interfaces';
export declare class OrassService {
    private pool;
    private config;
    private isConnected;
    private lastConnectionCheck;
    constructor(config?: OrassConnectionConfig);
    /**
     * Initialize Oracle client
     */
    private initializeOracleClient;
    /**
     * Connect to ORASS database
     */
    connect(): Promise<void>;
    /**
     * Test database connection
     */
    private testConnection;
    /**
     * Disconnect from database
     */
    disconnect(): Promise<void>;
    /**
     * Get connection status
     */
    getConnectionStatus(): Promise<OrassConnectionStatus>;
    /**
     * Search policies based on criteria
     */
    searchPolicies(criteria: OrassPolicySearchCriteria, limit?: number, offset?: number): Promise<OrassQueryResult>;
    /**
     * Get policy by policy number
     */
    getPolicyByNumber(policyNumber: string): Promise<OrassPolicy | null>;
    /**
     * Get policies by vehicle registration
     */
    getPoliciesByVehicleRegistration(vehicleRegistration: string): Promise<OrassPolicy[]>;
    /**
     * Get policies by chassis number
     */
    getPoliciesByChassisNumber(chassisNumber: string): Promise<OrassPolicy[]>;
    /**
     * Build search query with dynamic WHERE conditions
     */
    private buildSearchQuery;
    /**
     * Build count query for pagination
     */
    private buildCountQuery;
    /**
     * Map database row to OrassPolicy object
     */
    private mapRowToPolicy;
    /**
     * Health check for the service
     */
    healthCheck(): Promise<any>;
}
//# sourceMappingURL=orass-database.service.d.ts.map