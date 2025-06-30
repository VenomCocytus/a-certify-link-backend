import oracledb from 'oracledb';
import { logger } from '@utils/logger';
import { Environment } from '@config/environment';
import { BaseException } from '@exceptions/base.exception';
import {
    OrassConnectionConfig,
    OrassPolicy,
    OrassPolicySearchCriteria,
    OrassQueryResult,
    OrassConnectionStatus
} from '@interfaces/orass.interfaces';
import {ErrorCodes} from "@/constants/error-codes";
import * as console from "node:console";

export class OrassService {
    private pool: oracledb.Pool | null = null;
    private config: OrassConnectionConfig;
    private isConnected: boolean = false;
    private lastConnectionCheck: Date = new Date();

    constructor(config?: OrassConnectionConfig) {
        this.config = config || {
            host: Environment.ORASS_HOST,
            port: Environment.ORASS_PORT,
            sid: Environment.ORASS_SID,
            username: Environment.ORASS_USERNAME,
            password: Environment.ORASS_PASSWORD,
            connectionTimeout: Environment.ORASS_CONNECTION_TIMEOUT || 30000,
            requestTimeout: Environment.ORASS_REQUEST_TIMEOUT || 60000,
        };

        // Initialize the Oracle client if not already initialized
        this.initializeOracleClient();
    }

    /**
     * Initialize Oracle client
     */
    private initializeOracleClient(): void {
        try {
            // Set Oracle client configuration
            oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
            oracledb.autoCommit = true;
            oracledb.initOracleClient();

            logger.info('✅ Oracle client initialized');
        } catch (error: any) {
            logger.error('❌ Failed to initialize Oracle client:', error);
            throw new BaseException(
                'Failed to initialize Oracle client',
                ErrorCodes.DATABASE_CONNECTION_ERROR,
                500,
                { error: error.message }
            );
        }
    }

    /**
     * Connect to ORASS database
     */
    async connect(): Promise<void> {
        try {
            if (this.pool) {
                logger.info('ORASS connection pool already exists');
                return;
            }

            const connectionString = `${this.config.host}:${this.config.port}/${this.config.sid}`;

            this.pool = await oracledb.createPool({
                user: process.env.ORASS_USERNAME,
                password: process.env.ORASS_PASSWORD,
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

            logger.info('✅ Connected to ORASS database successfully', {
                host: this.config.host,
                port: this.config.port,
                sid: this.config.sid,
                username: this.config.username,
            });

        } catch (error: any) {
            this.isConnected = false;
            logger.error('❌ Failed to connect to ORASS database:', error);

            throw new BaseException(
                'Failed to connect to ORASS database',
                ErrorCodes.DATABASE_CONNECTION_ERROR,
                503,
                {
                    error: error.message,
                    host: this.config.host,
                    port: this.config.port,
                    sid: this.config.sid
                }
            );
        }
    }

    /**
     * Test database connection
     */
    private async testConnection(): Promise<void> {
        if (!this.pool) {
            throw new Error('Connection pool not initialized');
        }

        let connection: oracledb.Connection | null = null;

        try {
            connection = await this.pool.getConnection();
            await connection.execute('SELECT 1 FROM DUAL');

            logger.debug('ORASS database connection test successful');
        } catch (error: any) {
            throw new Error(`Connection test failed: ${error.message}`);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    /**
     * Disconnect from the database
     */
    async disconnect(): Promise<void> {
        try {
            if (this.pool) {
                await this.pool.close(10); // 10 seconds timeout
                this.pool = null;
                this.isConnected = false;
                logger.info('✅ Disconnected from ORASS database');
            }
        } catch (error: any) {
            logger.error('❌ Error disconnecting from ORASS database:', error);
        }
    }

    /**
     * Get connection status
     */
    async getConnectionStatus(): Promise<OrassConnectionStatus> {
        try {
            if (this.pool) {
                await this.testConnection();
                this.isConnected = true;
            } else {
                this.isConnected = false;
            }
        } catch (error: any) {
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
    async searchPolicies(criteria: OrassPolicySearchCriteria, limit: number = 100, offset: number = 0): Promise<OrassQueryResult> {
        if (!this.pool) {
            throw new BaseException(
                'ORASS database not connected',
                ErrorCodes.DATABASE_CONNECTION_ERROR,
                503
            );
        }

        let connection: oracledb.Connection | null = null;

        try {
            connection = await this.pool.getConnection();

            const { query, binds } = this.buildSearchQuery(criteria, limit, offset);

            logger.debug('Executing ORASS query:', { query, binds });

            const result = await connection.execute(query, binds);
            const rows = result.rows as any[];

            const policies = rows.map(row => this.mapRowToPolicy(row));

            // Get total count for pagination
            const countQuery = this.buildCountQuery(criteria);
            const countResult = await connection.execute(countQuery.query, countQuery.binds);
            const totalCount = (countResult.rows as any[])[0]?.TOTAL_COUNT || 0;

            return {
                policies,
                totalCount,
                hasMore: offset + policies.length < totalCount
            };

        } catch (error: any) {
            logger.error('❌ Error searching ORASS policies:', error);

            //TODO: return an external api exception instead
            throw new BaseException(
                'Failed to search policies in ORASS database',
                ErrorCodes.DATABASE_QUERY_ERROR,
                500,
                { error: error.message, criteria }
            );
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    /**
     * Get policy by policy number
     */
    async getPolicyByNumber(policyNumber: string): Promise<OrassPolicy | null> {
        const result = await this.searchPolicies({ policyNumber }, 1);
        return result.policies.length > 0 ? result.policies[0] : null;
    }

    /**
     * Build search query with dynamic WHERE conditions
     */
    // private buildSearchQuery(criteria: OrassPolicySearchCriteria, limit: number, offset: number): { query: string; binds: any } {
    //     let query = `
    //         SELECT *
    //         FROM act_detail_att_digitale
    //         WHERE 1=1
    //     `;
    //
    //     const binds: any = {};
    //     const conditions: string[] = [];
    //
    //     if (criteria.applicantCode && criteria.policyNumber && criteria.endorsementNumber) {
    //         const searchString = `${criteria.applicantCode}${criteria.policyNumber}${criteria.endorsementNumber}`;
    //         conditions.push('NUMERO_DE_POLICE = :numeropolice');
    //         binds.numeropolice = searchString;
    //     }
    //
    //     // Add conditions to a query
    //     if (conditions.length > 0) {
    //         query += ' AND ' + conditions.join(' AND ');
    //     }
    //
    //     // Add ordering and pagination for Oracle 12c+
    //     query += `
    //     ORDER BY CREATED_AT DESC
    //     OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    // `;
    //
    //     binds.offset = offset;
    //     binds.limit = limit;
    //
    //     return { query, binds };
    // }

    private buildSearchQuery(criteria: OrassPolicySearchCriteria, limit: number, offset: number): { query: string; binds: any } {
        let query = `
        SELECT * FROM (
            SELECT a.*, ROWNUM rnum FROM (
                SELECT *
                FROM act_detail_att_digitale
                WHERE 1=1
    `;

        const binds: any = {};
        const conditions: string[] = [];

        if (criteria.applicantCode && criteria.policyNumber && criteria.endorsementNumber) {
            const searchString = `${criteria.applicantCode}${criteria.policyNumber}${criteria.endorsementNumber}`;
            conditions.push('NUMERO_DE_POLICE = :numeropolice');
            binds.numeropolice = searchString;
        }

        // Add conditions to a query
        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        // Add ordering and pagination for Oracle 11g and earlier
        query += `
                ORDER BY CREATED_AT DESC
            ) a
            WHERE ROWNUM <= :max_row
        )
        WHERE rnum > :min_row
    `;

        binds.max_row = offset + limit;
        binds.min_row = offset;

        return { query, binds };
    }

    /**
     * Build count query for pagination
     */
    private buildCountQuery(criteria: OrassPolicySearchCriteria): { query: string; binds: any } {
        let query = 'SELECT COUNT(*) as TOTAL_COUNT FROM act_detail_att_digitale  p WHERE 1=1';
        const binds: any = {};
        const conditions: string[] = [];

        // Same conditions as a search query (without SELECT fields and pagination)
        if (criteria.applicantCode && criteria.policyNumber && criteria.endorsementNumber) {
            const searchString = `${criteria.applicantCode}${criteria.policyNumber}${criteria.endorsementNumber}`;
            conditions.push('NUMERO_DE_POLICE = :numeropolice');
            binds.numeropolice = searchString;
        }

        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        return { query, binds };
    }

    /**
     * Map database row to OrassPolicy object
     */
    private mapRowToPolicy(row: any): OrassPolicy {
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
    async healthCheck(): Promise<any> {
        const status = await this.getConnectionStatus();

        return {
            service: 'orass',
            status: status.connected ? 'healthy' : 'unhealthy',
            ...status,
            timestamp: new Date().toISOString()
        };
    }
}