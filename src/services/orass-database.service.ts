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
import {CertificateColor, CertificateType, ChannelType} from "@dto/asaci.dto";

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
     * Build a search query with dynamic WHERE conditions
     */
    //TODO: clean this code
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

        // Add conditions to the query
        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        //TODO: Add a proper ordering based on requirements
        // Oracle 11g pagination using ROWNUM
        query += `
                ORDER BY NUMERO_DE_POLICE DESC
            ) a
            WHERE ROWNUM <= :max_row
        )
        WHERE rnum > :min_row
    `;

        binds.max_row = offset + limit;  // Upper bound (e.g., OFFSET 10 + LIMIT 10 → max_row = 20)
        binds.min_row = offset;          // Lower bound (e.g., OFFSET 10 → min_row = 10)

        return { query, binds };
    }

    /**
     * Build a count query for pagination
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
            policyNumber: row.NUMERO_DE_POLICE,
            officeCode: row.OFFICE_CODE,
            organizationCode: row.ORGANIZATION_CODE,
            certificateType: row.CERTIFICATE_TYPE as CertificateType,
            emailNotification: row.EMAIL_NOTIFICATION,
            generatedBy: row.GENERATED_BY,
            channel: row.CHANNEL as ChannelType,
            certificateColor: row.COULEUR_D_ATTESTATION_A_EDITER as CertificateColor,
            premiumRC: row.PRIME_RC,
            vehicleEnergy: row.ENERGIE_DU_VEHICULE,
            vehicleChassisNumber: row.NUMERO_DE_CHASSIS_DU_VEHICULE,
            vehicleModel: row.MODELE_DU_VEHICULE,
            vehicleGenre: row.GENRE_DU_VEHICULE,
            vehicleCategory: row.CATEGORIE_DU_VEHICULE,
            vehicleUsage: row.USAGE_DU_VEHICULE,
            vehicleBrand: row.MARQUE_DU_VEHICULE,
            vehicleType: row.TYPE_DU_VEHICULE,
            vehicleSeats: row.NOMBRE_DE_PLACE_DU_VEHICULE,
            subscriberType: row.TYPE_DE_SOUSCRIPTEUR,
            subscriberPhone: row.NUMERO_DE_TELEPHONE_DU_SOUS,
            subscriberPoBox: row.BOITE_POSTALE_DU_SOUSCRIPTEUR,
            subscriberEmail: row.ADRESSE_EMAIL_DU_SOUSCRIPTEUR,
            subscriberName: row.NOM_DU_SOUSCRIPTEUR,
            insuredPhone: row.TELEPHONE_MOBILE_DE_L_ASSURE,
            insuredPoBox: row.BOITE_POSTALE_DE_L_ASSURE,
            insuredName: row.NOM_DE_L_ASSURE,
            insuredEmail: row.ADRESSE_EMAIL_DE_L_ASSURE,
            vehicleRegistrationNumber: row.IMMATRICULATION_DU_VEHICULE,
            policyEffectiveDate: row.DATE_D_EFFET_DU_CONTRAT as Date,
            policyExpiryDate: row.DATE_D_ECHEANCE_DU_CONTRAT as Date,
            vehicleFiscalPower: row.PUISSANCE_FISCALE,
            vehicleUsefulLoad: row.CHARGE_UTILE,
            fleetReduction: row.REDUCTION_FLOTTE,
            rNum: row.RNUM,
            opATD: row.OP_ATD
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