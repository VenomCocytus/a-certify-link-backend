"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrassService = void 0;
const oracledb_1 = __importDefault(require("oracledb"));
const logger_1 = require("@utils/logger");
const environment_1 = require("@config/environment");
const base_exception_1 = require("@exceptions/base.exception");
const error_codes_1 = require("@/constants/error-codes");
class OrassService {
    constructor(config) {
        this.pool = null;
        this.isConnected = false;
        this.lastConnectionCheck = new Date();
        this.config = config || {
            host: environment_1.Environment.ORASS_HOST,
            port: environment_1.Environment.ORASS_PORT,
            sid: environment_1.Environment.ORASS_SID,
            username: environment_1.Environment.ORASS_USERNAME,
            password: environment_1.Environment.ORASS_PASSWORD,
            connectionTimeout: environment_1.Environment.ORASS_CONNECTION_TIMEOUT || 30000,
            requestTimeout: environment_1.Environment.ORASS_REQUEST_TIMEOUT || 60000,
        };
        // Initialize the Oracle client if not already initialized
        this.initializeOracleClient();
    }
    /**
     * Initialize Oracle client
     */
    initializeOracleClient() {
        try {
            // Set Oracle client configuration
            oracledb_1.default.outFormat = oracledb_1.default.OUT_FORMAT_OBJECT;
            oracledb_1.default.autoCommit = true;
            logger_1.logger.info('✅ Oracle client initialized');
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to initialize Oracle client:', error);
            throw new base_exception_1.BaseException('Failed to initialize Oracle client', error_codes_1.ErrorCodes.DATABASE_CONNECTION_ERROR, 500, { error: error.message });
        }
    }
    /**
     * Connect to ORASS database
     */
    async connect() {
        try {
            if (this.pool) {
                logger_1.logger.info('ORASS connection pool already exists');
                return;
            }
            const connectionString = `${this.config.host}:${this.config.port}/${this.config.sid}`;
            this.pool = await oracledb_1.default.createPool({
                user: this.config.username,
                password: this.config.password,
                connectString: connectionString,
                poolMin: 2,
                poolMax: 10,
                poolIncrement: 1,
                poolTimeout: 300, // 5 minutes
                poolPingInterval: 60, // 1 minute
                stmtCacheSize: 30,
            });
            // Test connection
            await this.testConnection();
            this.isConnected = true;
            this.lastConnectionCheck = new Date();
            logger_1.logger.info('✅ Connected to ORASS database successfully', {
                host: this.config.host,
                port: this.config.port,
                sid: this.config.sid,
                username: this.config.username,
            });
        }
        catch (error) {
            this.isConnected = false;
            logger_1.logger.error('❌ Failed to connect to ORASS database:', error);
            throw new base_exception_1.BaseException('Failed to connect to ORASS database', error_codes_1.ErrorCodes.DATABASE_CONNECTION_ERROR, 503, {
                error: error.message,
                host: this.config.host,
                port: this.config.port,
                sid: this.config.sid
            });
        }
    }
    /**
     * Test database connection
     */
    async testConnection() {
        if (!this.pool) {
            throw new Error('Connection pool not initialized');
        }
        let connection = null;
        try {
            connection = await this.pool.getConnection();
            await connection.execute('SELECT 1 FROM DUAL');
            logger_1.logger.debug('ORASS database connection test successful');
        }
        catch (error) {
            throw new Error(`Connection test failed: ${error.message}`);
        }
        finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    /**
     * Disconnect from database
     */
    async disconnect() {
        try {
            if (this.pool) {
                await this.pool.close(10); // 10 seconds timeout
                this.pool = null;
                this.isConnected = false;
                logger_1.logger.info('✅ Disconnected from ORASS database');
            }
        }
        catch (error) {
            logger_1.logger.error('❌ Error disconnecting from ORASS database:', error);
        }
    }
    /**
     * Get connection status
     */
    async getConnectionStatus() {
        try {
            if (this.pool) {
                await this.testConnection();
                this.isConnected = true;
            }
            else {
                this.isConnected = false;
            }
        }
        catch (error) {
            this.isConnected = false;
        }
        this.lastConnectionCheck = new Date();
        return {
            connected: this.isConnected,
            lastChecked: this.lastConnectionCheck,
            error: this.isConnected ? undefined : 'Connection test failed',
            connectionInfo: {
                host: this.config.host,
                port: this.config.port,
                sid: this.config.sid,
                username: this.config.username
            }
        };
    }
    /**
     * Search policies based on criteria
     */
    async searchPolicies(criteria, limit = 100, offset = 0) {
        if (!this.pool) {
            throw new base_exception_1.BaseException('ORASS database not connected', error_codes_1.ErrorCodes.DATABASE_CONNECTION_ERROR, 503);
        }
        let connection = null;
        try {
            connection = await this.pool.getConnection();
            const { query, binds } = this.buildSearchQuery(criteria, limit, offset);
            logger_1.logger.debug('Executing ORASS query:', { query, binds });
            const result = await connection.execute(query, binds);
            const rows = result.rows;
            const policies = rows.map(row => this.mapRowToPolicy(row));
            // Get total count for pagination
            const countQuery = this.buildCountQuery(criteria);
            const countResult = await connection.execute(countQuery.query, countQuery.binds);
            const totalCount = countResult.rows[0]?.TOTAL_COUNT || 0;
            return {
                policies,
                totalCount,
                hasMore: offset + policies.length < totalCount
            };
        }
        catch (error) {
            logger_1.logger.error('❌ Error searching ORASS policies:', error);
            throw new base_exception_1.BaseException('Failed to search policies in ORASS database', error_codes_1.ErrorCodes.DATABASE_QUERY_ERROR, 500, { error: error.message, criteria });
        }
        finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    /**
     * Get policy by policy number
     */
    async getPolicyByNumber(policyNumber) {
        const result = await this.searchPolicies({ policyNumber }, 1);
        return result.policies.length > 0 ? result.policies[0] : null;
    }
    /**
     * Get policies by vehicle registration
     */
    async getPoliciesByVehicleRegistration(vehicleRegistration) {
        const result = await this.searchPolicies({ vehicleRegistration });
        return result.policies;
    }
    /**
     * Get policies by chassis number
     */
    async getPoliciesByChassisNumber(chassisNumber) {
        const result = await this.searchPolicies({ vehicleChassisNumber: chassisNumber });
        return result.policies;
    }
    /**
     * Build search query with dynamic WHERE conditions
     */
    buildSearchQuery(criteria, limit, offset) {
        let query = `
      SELECT 
        p.POLICY_NUMBER,
        p.ORGANIZATION_CODE,
        p.OFFICE_CODE,
        p.SUBSCRIBER_NAME,
        p.SUBSCRIBER_PHONE,
        p.SUBSCRIBER_EMAIL,
        p.SUBSCRIBER_ADDRESS,
        p.INSURED_NAME,
        p.INSURED_PHONE,
        p.INSURED_EMAIL,
        p.INSURED_ADDRESS,
        p.VEHICLE_REGISTRATION,
        p.VEHICLE_CHASSIS_NUMBER,
        p.VEHICLE_BRAND,
        p.VEHICLE_MODEL,
        p.VEHICLE_TYPE,
        p.VEHICLE_CATEGORY,
        p.VEHICLE_USAGE,
        p.VEHICLE_GENRE,
        p.VEHICLE_ENERGY,
        p.VEHICLE_SEATS,
        p.VEHICLE_FISCAL_POWER,
        p.VEHICLE_USEFUL_LOAD,
        p.FLEET_REDUCTION,
        p.SUBSCRIBER_TYPE,
        p.PREMIUM_RC,
        p.CONTRACT_START_DATE,
        p.CONTRACT_END_DATE,
        p.OP_ATD,
        p.CERTIFICATE_COLOR,
        p.CREATED_AT,
        p.UPDATED_AT
      FROM ORASS_POLICIES p
      WHERE 1=1
    `;
        const binds = {};
        const conditions = [];
        // Build dynamic WHERE conditions
        if (criteria.policyNumber) {
            conditions.push('p.POLICY_NUMBER = :policyNumber');
            binds.policyNumber = criteria.policyNumber;
        }
        if (criteria.vehicleRegistration) {
            conditions.push('UPPER(p.VEHICLE_REGISTRATION) = UPPER(:vehicleRegistration)');
            binds.vehicleRegistration = criteria.vehicleRegistration;
        }
        if (criteria.vehicleChassisNumber) {
            conditions.push('UPPER(p.VEHICLE_CHASSIS_NUMBER) = UPPER(:vehicleChassisNumber)');
            binds.vehicleChassisNumber = criteria.vehicleChassisNumber;
        }
        if (criteria.subscriberName) {
            conditions.push('UPPER(p.SUBSCRIBER_NAME) LIKE UPPER(:subscriberName)');
            binds.subscriberName = `%${criteria.subscriberName}%`;
        }
        if (criteria.insuredName) {
            conditions.push('UPPER(p.INSURED_NAME) LIKE UPPER(:insuredName)');
            binds.insuredName = `%${criteria.insuredName}%`;
        }
        if (criteria.organizationCode) {
            conditions.push('p.ORGANIZATION_CODE = :organizationCode');
            binds.organizationCode = criteria.organizationCode;
        }
        if (criteria.officeCode) {
            conditions.push('p.OFFICE_CODE = :officeCode');
            binds.officeCode = criteria.officeCode;
        }
        if (criteria.certificateColor) {
            conditions.push('p.CERTIFICATE_COLOR = :certificateColor');
            binds.certificateColor = criteria.certificateColor;
        }
        if (criteria.contractStartDate) {
            conditions.push('p.CONTRACT_START_DATE >= :contractStartDate');
            binds.contractStartDate = criteria.contractStartDate;
        }
        if (criteria.contractEndDate) {
            conditions.push('p.CONTRACT_END_DATE <= :contractEndDate');
            binds.contractEndDate = criteria.contractEndDate;
        }
        // Add conditions to query
        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }
        // Add ordering and pagination
        query += ` 
      ORDER BY p.CREATED_AT DESC
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;
        binds.offset = offset;
        binds.limit = limit;
        return { query, binds };
    }
    /**
     * Build count query for pagination
     */
    buildCountQuery(criteria) {
        let query = 'SELECT COUNT(*) as TOTAL_COUNT FROM ORASS_POLICIES p WHERE 1=1';
        const binds = {};
        const conditions = [];
        // Same conditions as a search query (without SELECT fields and pagination)
        if (criteria.policyNumber) {
            conditions.push('p.POLICY_NUMBER = :policyNumber');
            binds.policyNumber = criteria.policyNumber;
        }
        if (criteria.vehicleRegistration) {
            conditions.push('UPPER(p.VEHICLE_REGISTRATION) = UPPER(:vehicleRegistration)');
            binds.vehicleRegistration = criteria.vehicleRegistration;
        }
        if (criteria.vehicleChassisNumber) {
            conditions.push('UPPER(p.VEHICLE_CHASSIS_NUMBER) = UPPER(:vehicleChassisNumber)');
            binds.vehicleChassisNumber = criteria.vehicleChassisNumber;
        }
        if (criteria.subscriberName) {
            conditions.push('UPPER(p.SUBSCRIBER_NAME) LIKE UPPER(:subscriberName)');
            binds.subscriberName = `%${criteria.subscriberName}%`;
        }
        if (criteria.insuredName) {
            conditions.push('UPPER(p.INSURED_NAME) LIKE UPPER(:insuredName)');
            binds.insuredName = `%${criteria.insuredName}%`;
        }
        if (criteria.organizationCode) {
            conditions.push('p.ORGANIZATION_CODE = :organizationCode');
            binds.organizationCode = criteria.organizationCode;
        }
        if (criteria.officeCode) {
            conditions.push('p.OFFICE_CODE = :officeCode');
            binds.officeCode = criteria.officeCode;
        }
        if (criteria.certificateColor) {
            conditions.push('p.CERTIFICATE_COLOR = :certificateColor');
            binds.certificateColor = criteria.certificateColor;
        }
        if (criteria.contractStartDate) {
            conditions.push('p.CONTRACT_START_DATE >= :contractStartDate');
            binds.contractStartDate = criteria.contractStartDate;
        }
        if (criteria.contractEndDate) {
            conditions.push('p.CONTRACT_END_DATE <= :contractEndDate');
            binds.contractEndDate = criteria.contractEndDate;
        }
        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }
        return { query, binds };
    }
    /**
     * Map database row to OrassPolicy object
     */
    mapRowToPolicy(row) {
        return {
            policyNumber: row.POLICY_NUMBER,
            organizationCode: row.ORGANIZATION_CODE,
            officeCode: row.OFFICE_CODE,
            subscriberName: row.SUBSCRIBER_NAME,
            subscriberPhone: row.SUBSCRIBER_PHONE,
            subscriberEmail: row.SUBSCRIBER_EMAIL,
            subscriberAddress: row.SUBSCRIBER_ADDRESS,
            insuredName: row.INSURED_NAME,
            insuredPhone: row.INSURED_PHONE,
            insuredEmail: row.INSURED_EMAIL,
            insuredAddress: row.INSURED_ADDRESS,
            vehicleRegistration: row.VEHICLE_REGISTRATION,
            vehicleChassisNumber: row.VEHICLE_CHASSIS_NUMBER,
            vehicleBrand: row.VEHICLE_BRAND,
            vehicleModel: row.VEHICLE_MODEL,
            vehicleType: row.VEHICLE_TYPE,
            vehicleCategory: row.VEHICLE_CATEGORY,
            vehicleUsage: row.VEHICLE_USAGE,
            vehicleGenre: row.VEHICLE_GENRE,
            vehicleEnergy: row.VEHICLE_ENERGY,
            vehicleSeats: row.VEHICLE_SEATS,
            vehicleFiscalPower: row.VEHICLE_FISCAL_POWER,
            vehicleUsefulLoad: row.VEHICLE_USEFUL_LOAD,
            fleetReduction: row.FLEET_REDUCTION,
            subscriberType: row.SUBSCRIBER_TYPE,
            premiumRC: row.PREMIUM_RC,
            contractStartDate: row.CONTRACT_START_DATE,
            contractEndDate: row.CONTRACT_END_DATE,
            opATD: row.OP_ATD,
            certificateColor: row.CERTIFICATE_COLOR,
            createdAt: row.CREATED_AT,
            updatedAt: row.UPDATED_AT,
        };
    }
    /**
     * Health check for the service
     */
    async healthCheck() {
        const status = await this.getConnectionStatus();
        return {
            service: 'orass',
            status: status.connected ? 'healthy' : 'unhealthy',
            ...status,
            timestamp: new Date().toISOString()
        };
    }
}
exports.OrassService = OrassService;
//# sourceMappingURL=orass-database.service.js.map