import { jest } from '@jest/globals';
import oracledb from 'oracledb';
import { OrassService } from '@services/orass.service';
import { logger } from '@utils/logger';
import { getOrassConfig } from '@config/environment';
import { BaseException } from '@exceptions/base.exception';
import { ErrorCodes } from '@/constants/error-codes';
import { ConnectionStatus, HealthStatus } from '@interfaces/common.enum';
import {
    createMockOracleConnection,
    createMockOraclePool,
    createMockOracleQueryResult,
    createMockOrassConfig,
    createValidOrassPolicySearchCriteria,
    setupTestEnvironment,
    expectBaseError,
    CERTIFY_LINK_TEST_DATA
} from '../../helpers/test-utils';

// Mock dependencies
jest.mock('oracledb');
jest.mock('@utils/logger');
jest.mock('@config/environment');

const mockedOracledb = oracledb as jest.Mocked<typeof oracledb>;
const mockedGetOrassConfig = getOrassConfig as jest.MockedFunction<typeof getOrassConfig>;

function mockOracleDbConstants(mockValues: Partial<typeof oracledb>) {
    Object.entries(mockValues).forEach(([key, value]) => {
        Object.defineProperty(mockedOracledb, key, { value, writable: true });
    });
}

describe('OrassService', () => {
    let orassService: OrassService;
    let mockPool: any;
    let mockConnection: any;
    let mockConfig: any;

    beforeEach(() => {
        jest.clearAllMocks();
        setupTestEnvironment();

        // Setup mock configuration
        mockConfig = createMockOrassConfig();
        mockedGetOrassConfig.mockReturnValue(mockConfig);

        // Setup mock Oracle objects
        mockPool = createMockOraclePool();
        mockConnection = createMockOracleConnection();

        // Setup Oracle DB mocks
        mockedOracledb.createPool = jest.fn((...args: any[]) => {
            // Handle both promise and callback cases
            if (args.length > 1 && typeof args[1] === 'function') {
                args[1](null, mockPool);
            } else {
                return Promise.resolve(mockPool);
            }
        }) as jest.MockedFunction<typeof oracledb.createPool>;
        mockOracleDbConstants({ OUT_FORMAT_OBJECT: 4001 });
        mockedOracledb.initOracleClient = jest.fn();
        mockPool.getConnection = jest.fn().mockResolvedValue(mockConnection as never);
        mockPool.close = jest.fn().mockResolvedValue(undefined as never);

        // Create a service instance
        orassService = new OrassService();
    });

    describe('Constructor and Initialization', () => {
        it('should initialize Oracle client successfully', () => {
            // Assert
            expect(mockedOracledb.initOracleClient).toHaveBeenCalled();
            expect(mockedOracledb.outFormat).toBe(mockedOracledb.OUT_FORMAT_OBJECT);
            expect(mockedOracledb.autoCommit).toBe(true);
            expect(logger.info).toHaveBeenCalledWith('✅ Oracle client initialized');
        });

        it('should handle Oracle client initialization failure', () => {
            // Arrange
            const error = new Error('Oracle client initialization failed');
            mockedOracledb.initOracleClient.mockImplementation(() => {
                throw error;
            });

            // Act & Assert
            expect(() => new OrassService()).toThrow(BaseException);
            expect(logger.error).toHaveBeenCalledWith('❌ Failed to initialize Oracle client:', error);
        });

        it('should get configuration from environment', () => {
            // Assert
            expect(mockedGetOrassConfig).toHaveBeenCalled();
        });
    });

    describe('connect', () => {
        it('should connect to ORASS database successfully', async () => {
            // Act
            await orassService.connect();

            // Assert
            expect(mockedOracledb.createPool).toHaveBeenCalledWith({
                user: process.env.ORASS_USERNAME,
                password: process.env.ORASS_PASSWORD,
                connectString: `${mockConfig.host}:${mockConfig.port}/${mockConfig.sid}`,
                poolMin: 2,
                poolMax: 10,
                poolIncrement: 1,
                poolTimeout: 300,
                poolPingInterval: 60,
                stmtCacheSize: 30
            });

            expect(mockPool.getConnection).toHaveBeenCalled();
            expect(mockConnection.execute).toHaveBeenCalledWith('SELECT 1 FROM DUAL');
            expect(mockConnection.close).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith(
                '✅ Connected to ORASS database successfully',
                expect.objectContaining({
                    host: mockConfig.host,
                    port: mockConfig.port,
                    sid: mockConfig.sid,
                    username: mockConfig.username
                })
            );
        });

        it('should not create new pool if already exists', async () => {
            // Arrange
            await orassService.connect(); // First connection
            jest.clearAllMocks();

            // Act
            await orassService.connect(); // Second connection

            // Assert
            expect(mockedOracledb.createPool).not.toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith('ORASS connection pool already exists');
        });

        it('should handle connection failure', async () => {
            // Arrange
            const connectionError = new Error('Connection failed');
            mockedOracledb.createPool.mockRejectedValue(connectionError as never);

            // Act & Assert
            await expect(orassService.connect()).rejects.toThrow(BaseException);
            expect(logger.error).toHaveBeenCalledWith('❌ Failed to connect to ORASS database:', connectionError);
        });

        it('should handle connection test failure', async () => {
            // Arrange
            const testError = new Error('Connection test failed');
            mockConnection.execute.mockRejectedValue(testError);

            // Act & Assert
            await expect(orassService.connect()).rejects.toThrow(BaseException);
            expect(mockConnection.close).toHaveBeenCalled();
        });

        it('should set connection properties correctly', async () => {
            // Act
            await orassService.connect();

            // Assert - verify the service tracks connection state
            const status = await orassService.getConnectionStatus();
            expect(status.connected).toBe(true);
            expect(status.connectionInfo).toEqual({
                host: mockConfig.host,
                port: mockConfig.port,
                sid: mockConfig.sid,
                username: mockConfig.username
            });
        });
    });

    describe('disconnect', () => {
        it('should disconnect from database successfully', async () => {
            // Arrange
            await orassService.connect();

            // Act
            await orassService.disconnect();

            // Assert
            expect(mockPool.close).toHaveBeenCalledWith(10);
            expect(logger.info).toHaveBeenCalledWith('✅ Disconnected from ORASS database');
        });

        it('should handle disconnect when no pool exists', async () => {
            // Act
            await orassService.disconnect();

            // Assert
            expect(mockPool.close).not.toHaveBeenCalled();
        });

        it('should handle disconnect errors', async () => {
            // Arrange
            await orassService.connect();
            const disconnectError = new Error('Disconnect failed');
            mockPool.close.mockRejectedValue(disconnectError);

            // Act
            await orassService.disconnect();

            // Assert
            expect(logger.error).toHaveBeenCalledWith('❌ Error disconnecting from ORASS database:', disconnectError);
        });
    });

    describe('getConnectionStatus', () => {
        it('should return connected status when pool exists and test passes', async () => {
            // Arrange
            await orassService.connect();

            // Act
            const status = await orassService.getConnectionStatus();

            // Assert
            expect(status.connected).toBe(true);
            expect(status.error).toBeUndefined();
            expect(status.lastChecked).toBeInstanceOf(Date);
            expect(status.connectionInfo).toEqual({
                host: mockConfig.host,
                port: mockConfig.port,
                sid: mockConfig.sid,
                username: mockConfig.username
            });
        });

        it('should return disconnected status when no pool exists', async () => {
            // Act
            const status = await orassService.getConnectionStatus();

            // Assert
            expect(status.connected).toBe(false);
            expect(status.error).toBe('Connection test failed');
            expect(status.lastChecked).toBeInstanceOf(Date);
        });

        it('should return disconnected status when connection test fails', async () => {
            // Arrange
            await orassService.connect();
            const testError = new Error('Connection lost');
            mockConnection.execute.mockRejectedValue(testError);

            // Act
            const status = await orassService.getConnectionStatus();

            // Assert
            expect(status.connected).toBe(false);
            expect(status.error).toBe('Connection test failed');
        });

        it('should close connection after test', async () => {
            // Arrange
            await orassService.connect();

            // Act
            await orassService.getConnectionStatus();

            // Assert
            expect(mockConnection.close).toHaveBeenCalled();
        });
    });

    describe('searchPolicies', () => {
        beforeEach(async () => {
            await orassService.connect();
        });

        it('should search policies successfully with all criteria', async () => {
            // Arrange
            const criteria = createValidOrassPolicySearchCriteria();
            const mockRows = [
                createMockOracleQueryResult().orassRow,
                createMockOracleQueryResult().orassRow
            ];

            mockConnection.execute
                .mockResolvedValueOnce({ rows: mockRows }) // Main query
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 2 }] }); // Count query

            // Act
            const result = await orassService.searchPolicies(criteria, 10, 0);

            // Assert
            expect(result.policies).toHaveLength(2);
            expect(result.totalCount).toBe(2);
            expect(result.hasMore).toBe(false);

            // Verify main query
            expect(mockConnection.execute).toHaveBeenCalledWith(
                expect.stringContaining('act_detail_att_digitale'),
                expect.objectContaining({
                    numeropolice: `${criteria.applicantCode}${criteria.policyNumber}${criteria.endorsementNumber}`,
                    max_row: 10,
                    min_row: 0
                })
            );

            // Verify count query
            expect(mockConnection.execute).toHaveBeenCalledWith(
                expect.stringContaining('COUNT(*)'),
                expect.objectContaining({
                    numeropolice: `${criteria.applicantCode}${criteria.policyNumber}${criteria.endorsementNumber}`
                })
            );
        });

        it('should search policies with partial criteria', async () => {
            // Arrange
            const criteria = {
                policyNumber: CERTIFY_LINK_TEST_DATA.VALID_POLICY_NUMBER
                // Only policy number, no other criteria
            };
            const mockRows = [createMockOracleQueryResult().orassRow];

            mockConnection.execute
                .mockResolvedValueOnce({ rows: mockRows })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 1 }] });

            // Act
            const result = await orassService.searchPolicies(criteria, 100, 0);

            // Assert
            expect(result.policies).toHaveLength(1);
            expect(mockConnection.execute).toHaveBeenCalledWith(
                expect.stringContaining('WHERE 1=1'),
                expect.objectContaining({
                    max_row: 100,
                    min_row: 0
                })
            );
        });

        it('should handle empty search results', async () => {
            // Arrange
            const criteria = createValidOrassPolicySearchCriteria();

            mockConnection.execute
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 0 }] });

            // Act
            const result = await orassService.searchPolicies(criteria, 10, 0);

            // Assert
            expect(result.policies).toHaveLength(0);
            expect(result.totalCount).toBe(0);
            expect(result.hasMore).toBe(false);
        });

        it('should calculate pagination correctly', async () => {
            // Arrange
            const criteria = createValidOrassPolicySearchCriteria();
            const mockRows = Array(5).fill(null).map(() => createMockOracleQueryResult().orassRow);

            mockConnection.execute
                .mockResolvedValueOnce({ rows: mockRows })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 15 }] });

            // Act
            const result = await orassService.searchPolicies(criteria, 5, 5);

            // Assert
            expect(result.policies).toHaveLength(5);
            expect(result.totalCount).toBe(15);
            expect(result.hasMore).toBe(true); // 5 + 5 < 15

            expect(mockConnection.execute).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    max_row: 10, // offset + limit
                    min_row: 5   // offset
                })
            );
        });

        it('should handle large offset and limit values', async () => {
            // Arrange
            const criteria = createValidOrassPolicySearchCriteria();
            const mockRows = Array(1000).fill(null).map(() => createMockOracleQueryResult().orassRow);

            mockConnection.execute
                .mockResolvedValueOnce({ rows: mockRows })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 5000 }] });

            // Act
            const result = await orassService.searchPolicies(criteria, 1000, 2000);

            // Assert
            expect(result.policies).toHaveLength(1000);
            expect(result.totalCount).toBe(5000);
            expect(result.hasMore).toBe(true);

            expect(mockConnection.execute).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    max_row: 3000, // 2000 + 1000
                    min_row: 2000
                })
            );
        });

        it('should throw BaseException when not connected', async () => {
            // Arrange
            await orassService.disconnect();
            const criteria = createValidOrassPolicySearchCriteria();

            // Act & Assert
            await expect(orassService.searchPolicies(criteria))
                .rejects.toThrow(BaseException);

            const error = await orassService.searchPolicies(criteria).catch(e => e);
            expect(error.code).toBe(ErrorCodes.DATABASE_CONNECTION_ERROR);
            expect(error.statusCode).toBe(503);
        });

        it('should handle database query errors', async () => {
            // Arrange
            const criteria = createValidOrassPolicySearchCriteria();
            const queryError = new Error('ORA-00942: table or view does not exist');
            mockConnection.execute.mockRejectedValue(queryError);

            // Act & Assert
            await expect(orassService.searchPolicies(criteria))
                .rejects.toThrow(BaseException);

            expect(logger.error).toHaveBeenCalledWith('❌ Error searching ORASS policies:', queryError);
        });

        it('should close connection even if query fails', async () => {
            // Arrange
            const criteria = createValidOrassPolicySearchCriteria();
            const queryError = new Error('Query failed');
            mockConnection.execute.mockRejectedValue(queryError);

            // Act
            await orassService.searchPolicies(criteria).catch(() => {});

            // Assert
            expect(mockConnection.close).toHaveBeenCalled();
        });

        it('should map Oracle rows to policy objects correctly', async () => {
            // Arrange
            const criteria = createValidOrassPolicySearchCriteria();
            const mockOracleRow = {
                NUMERO_DE_POLICE: 'POL123456',
                OFFICE_CODE: 'OFF001',
                ORGANIZATION_CODE: 'ORG001',
                CERTIFICATE_TYPE: 'cima',
                EMAIL_NOTIFICATION: 'test@example.com',
                GENERATED_BY: 'test-generator',
                CHANNEL: 'api',
                COULEUR_D_ATTESTATION_A_EDITER: 'GREEN',
                PRIME_RC: 150000,
                ENERGIE_DU_VEHICULE: 'GASOLINE',
                NUMERO_DE_CHASSIS_DU_VEHICULE: 'VIN123456789',
                MODELE_DU_VEHICULE: 'Camry',
                GENRE_DU_VEHICULE: 'AUTOMOBILE',
                CATEGORIE_DU_VEHICULE: 'PASSENGER',
                USAGE_DU_VEHICULE: 'PERSONAL',
                MARQUE_DU_VEHICULE: 'Toyota',
                TYPE_DU_VEHICULE: 'SEDAN',
                NOMBRE_DE_PLACE_DU_VEHICULE: 5,
                TYPE_DE_SOUSCRIPTEUR: 'INDIVIDUAL',
                NUMERO_DE_TELEPHONE_DU_SOUS: '+1234567890',
                BOITE_POSTALE_DU_SOUSCRIPTEUR: 'PO Box 123',
                ADRESSE_EMAIL_DU_SOUSCRIPTEUR: 'subscriber@example.com',
                NOM_DU_SOUSCRIPTEUR: 'John Doe',
                TELEPHONE_MOBILE_DE_L_ASSURE: '+1234567891',
                BOITE_POSTALE_DE_L_ASSURE: 'PO Box 456',
                NOM_DE_L_ASSURE: 'Jane Doe',
                ADRESSE_EMAIL_DE_L_ASSURE: 'insured@example.com',
                IMMATRICULATION_DU_VEHICULE: 'ABC123',
                DATE_D_EFFET_DU_CONTRAT: new Date('2023-01-01'),
                DATE_D_ECHEANCE_DU_CONTRAT: new Date('2023-12-31'),
                PUISSANCE_FISCALE: 8,
                CHARGE_UTILE: 500,
                REDUCTION_FLOTTE: 0,
                RNUM: 1,
                OP_ATD: 'OP123'
            };

            mockConnection.execute
                .mockResolvedValueOnce({ rows: [mockOracleRow] })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 1 }] });

            // Act
            const result = await orassService.searchPolicies(criteria);

            // Assert
            const policy = result.policies[0];
            expect(policy.policyNumber).toBe('POL123456');
            expect(policy.officeCode).toBe('OFF001');
            expect(policy.organizationCode).toBe('ORG001');
            expect(policy.certificateType).toBe('cima');
            expect(policy.emailNotification).toBe('test@example.com');
            expect(policy.vehicleBrand).toBe('Toyota');
            expect(policy.vehicleModel).toBe('Camry');
            expect(policy.subscriberName).toBe('John Doe');
            expect(policy.insuredName).toBe('Jane Doe');
            expect(policy.premiumRC).toBe(150000);
            expect(policy.vehicleSeats).toBe(5);
            expect(policy.policyEffectiveDate).toEqual(new Date('2023-01-01'));
            expect(policy.policyExpiryDate).toEqual(new Date('2023-12-31'));
        });

        it('should handle null values in Oracle response', async () => {
            // Arrange
            const criteria = createValidOrassPolicySearchCriteria();
            const mockOracleRow = {
                NUMERO_DE_POLICE: 'POL123456',
                OFFICE_CODE: null,
                ORGANIZATION_CODE: 'ORG001',
                CERTIFICATE_TYPE: 'cima',
                EMAIL_NOTIFICATION: null,
                GENERATED_BY: null,
                CHANNEL: 'api',
                COULEUR_D_ATTESTATION_A_EDITER: 'GREEN',
                PRIME_RC: null,
                // ... other required fields
                RNUM: 1,
                OP_ATD: null
            };

            mockConnection.execute
                .mockResolvedValueOnce({ rows: [mockOracleRow] })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 1 }] });

            // Act
            const result = await orassService.searchPolicies(criteria);

            // Assert
            const policy = result.policies[0];
            expect(policy.policyNumber).toBe('POL123456');
            expect(policy.officeCode).toBeNull();
            expect(policy.emailNotification).toBeNull();
            expect(policy.premiumRC).toBeNull();
            expect(policy.opATD).toBeNull();
        });
    });

    describe('buildSearchQuery', () => {
        it('should build query with all criteria', async () => {
            // Arrange
            await orassService.connect();
            const criteria = createValidOrassPolicySearchCriteria();

            mockConnection.execute.mockResolvedValue({ rows: [] });

            // Act
            await orassService.searchPolicies(criteria, 10, 5);

            // Assert
            const queryCall = mockConnection.execute.mock.calls[0];
            const query = queryCall[0];
            const binds = queryCall[1];

            expect(query).toContain('act_detail_att_digitale');
            expect(query).toContain('WHERE 1=1');
            expect(query).toContain('NUMERO_DE_POLICE = :numeropolice');
            expect(query).toContain('ORDER BY NUMERO_DE_POLICE DESC');
            expect(query).toContain('ROWNUM <= :max_row');
            expect(query).toContain('rnum > :min_row');

            expect(binds.numeropolice).toBe(`${criteria.applicantCode}${criteria.policyNumber}${criteria.endorsementNumber}`);
            expect(binds.max_row).toBe(15); // offset + limit
            expect(binds.min_row).toBe(5);  // offset
        });

        it('should build query without criteria when none provided', async () => {
            // Arrange
            await orassService.connect();

            mockConnection.execute.mockResolvedValue({ rows: [] });

            // Act
            await orassService.searchPolicies({}, 10, 0);

            // Assert
            const queryCall = mockConnection.execute.mock.calls[0];
            const query = queryCall[0];
            const binds = queryCall[1];

            expect(query).toContain('WHERE 1=1');
            expect(query).not.toContain('NUMERO_DE_POLICE = :numeropolice');
            expect(binds.numeropolice).toBeUndefined();
            expect(binds.max_row).toBe(10);
            expect(binds.min_row).toBe(0);
        });
    });

    describe('buildCountQuery', () => {
        it('should build count query with same conditions as main query', async () => {
            // Arrange
            await orassService.connect();
            const criteria = createValidOrassPolicySearchCriteria();

            mockConnection.execute
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 0 }] });

            // Act
            await orassService.searchPolicies(criteria);

            // Assert
            const countQueryCall = mockConnection.execute.mock.calls[1];
            const countQuery = countQueryCall[0];
            const countBinds = countQueryCall[1];

            expect(countQuery).toContain('COUNT(*)');
            expect(countQuery).toContain('act_detail_att_digitale');
            expect(countQuery).toContain('WHERE 1=1');
            expect(countQuery).toContain('NUMERO_DE_POLICE = :numeropolice');
            expect(countQuery).not.toContain('ORDER BY');
            expect(countQuery).not.toContain('ROWNUM');

            expect(countBinds.numeropolice).toBe(`${criteria.applicantCode}${criteria.policyNumber}${criteria.endorsementNumber}`);
        });
    });

    describe('healthCheck', () => {
        it('should return healthy status when connected', async () => {
            // Arrange
            await orassService.connect();

            // Act
            const health = await orassService.healthCheck();

            // Assert
            expect(health.connection).toBe(ConnectionStatus.ACTIVE);
            expect(health.status).toBe(HealthStatus.HEALTHY);
            expect(health.details.connected).toBe(true);
            expect(health.timestamp).toBeDefined();
        });

        it('should return unhealthy status when not connected', async () => {
            // Act
            const health = await orassService.healthCheck();

            // Assert
            expect(health.connection).toBe(ConnectionStatus.FAILED);
            expect(health.status).toBe(HealthStatus.UNHEALTHY);
            expect(health.details.connected).toBe(false);
            expect(health.timestamp).toBeDefined();
        });

        it('should handle health check errors gracefully', async () => {
            // Arrange
            await orassService.connect();
            const healthError = new Error('Health check failed');
            mockConnection.execute.mockRejectedValue(healthError);

            // Act
            const health = await orassService.healthCheck();

            // Assert
            expect(health.connection).toBe(ConnectionStatus.FAILED);
            expect(health.status).toBe(HealthStatus.UNHEALTHY);
            expect(health.error).toBe('Health check failed');
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle connection pool creation failure', async () => {
            // Arrange
            const poolError = new Error('Pool creation failed');
            mockedOracledb.createPool.mockRejectedValue(poolError as never);

            // Act & Assert
            const error = await orassService.connect().catch(e => e);
            expectBaseError(error, 503, 'Failed to connect to ORASS database');
            expect(error.details).toEqual({
                error: poolError.message,
                host: mockConfig.host,
                port: mockConfig.port,
                sid: mockConfig.sid
            });
        });

        it('should handle connection retrieval failure', async () => {
            // Arrange
            await orassService.connect();
            const connectionError = new Error('No connections available');
            mockPool.getConnection.mockRejectedValue(connectionError);

            // Act & Assert
            await expect(orassService.searchPolicies({}))
                .rejects.toThrow(BaseException);
        });

        it('should handle query execution timeout', async () => {
            // Arrange
            await orassService.connect();
            const timeoutError = new Error('ORA-01013: user requested cancel of current operation');
            mockConnection.execute.mockRejectedValue(timeoutError);

            // Act & Assert
            await expect(orassService.searchPolicies({}))
                .rejects.toThrow(BaseException);
            expect(logger.error).toHaveBeenCalledWith('❌ Error searching ORASS policies:', timeoutError);
        });

        it('should handle malformed query results', async () => {
            // Arrange
            await orassService.connect();
            const criteria = createValidOrassPolicySearchCriteria();

            // Mock malformed response
            mockConnection.execute
                .mockResolvedValueOnce({ rows: null }) // Invalid rows
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 0 }] });

            // Act & Assert
            await expect(orassService.searchPolicies(criteria))
                .rejects.toThrow();
        });

        it('should handle missing count query result', async () => {
            // Arrange
            await orassService.connect();
            const criteria = createValidOrassPolicySearchCriteria();

            mockConnection.execute
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] }); // No count result

            // Act
            const result = await orassService.searchPolicies(criteria);

            // Assert
            expect(result.totalCount).toBe(0);
        });

        it('should handle very large result sets', async () => {
            // Arrange
            await orassService.connect();
            const criteria = createValidOrassPolicySearchCriteria();
            const largeRowSet = Array(10000).fill(null).map(() => createMockOracleQueryResult().orassRow);

            mockConnection.execute
                .mockResolvedValueOnce({ rows: largeRowSet })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 50000 }] });

            // Act
            const result = await orassService.searchPolicies(criteria, 10000, 0);

            // Assert
            expect(result.policies).toHaveLength(10000);
            expect(result.totalCount).toBe(50000);
            expect(result.hasMore).toBe(true);
        });

        it('should handle zero limit gracefully', async () => {
            // Arrange
            await orassService.connect();
            const criteria = createValidOrassPolicySearchCriteria();

            mockConnection.execute
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 100 }] });

            // Act
            const result = await orassService.searchPolicies(criteria, 0, 0);

            // Assert
            expect(result.policies).toHaveLength(0);
            expect(result.totalCount).toBe(100);
            expect(result.hasMore).toBe(true);
        });

        it('should handle negative offset and limit', async () => {
            // Arrange
            await orassService.connect();
            const criteria = createValidOrassPolicySearchCriteria();

            mockConnection.execute
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 0 }] });

            // Act
            const result = await orassService.searchPolicies(criteria, -10, -5);

            // Assert
            expect(mockConnection.execute).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    max_row: -15, // offset + limit
                    min_row: -5   // offset
                })
            );
        });
    });

    describe('Performance and Concurrency', () => {
        it('should handle concurrent connection requests', async () => {
            // Arrange
            const connectionPromises = Array(5).fill(null).map(() => orassService.connect());

            // Act
            await Promise.all(connectionPromises);

            // Assert
            expect(mockedOracledb.createPool).toHaveBeenCalledTimes(1); // Only one pool created
        });

        it('should handle concurrent search requests', async () => {
            // Arrange
            await orassService.connect();
            const criteria = createValidOrassPolicySearchCriteria();

            mockConnection.execute
                .mockResolvedValue({ rows: [] })
                .mockResolvedValue({ rows: [{ TOTAL_COUNT: 0 }] });

            const searchPromises = Array(10).fill(null).map(() =>
                orassService.searchPolicies(criteria, 10, 0)
            );

            // Act
            const results = await Promise.all(searchPromises);

            // Assert
            expect(results).toHaveLength(10);
            results.forEach(result => {
                expect(result.policies).toBeDefined();
                expect(result.totalCount).toBeDefined();
                expect(result.hasMore).toBeDefined();
            });
        });

        it('should handle connection pool exhaustion', async () => {
            // Arrange
            await orassService.connect();
            const poolExhaustionError = new Error('ORA-12520: TNS:listener could not find available handler');
            mockPool.getConnection.mockRejectedValue(poolExhaustionError);

            // Act & Assert
            await expect(orassService.searchPolicies({}))
                .rejects.toThrow(BaseException);
        });

        it('should measure query execution time for performance monitoring', async () => {
            // Arrange
            await orassService.connect();
            const criteria = createValidOrassPolicySearchCriteria();

            // Simulate slow query
            mockConnection.execute.mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve({ rows: [] }), 100))
            );

            const startTime = Date.now();

            // Act
            await orassService.searchPolicies(criteria);

            // Assert
            const executionTime = Date.now() - startTime;
            expect(executionTime).toBeGreaterThan(100);
        });
    });

    describe('Memory Management', () => {
        it('should always close connections even on error', async () => {
            // Arrange
            await orassService.connect();
            const queryError = new Error('Query failed');
            mockConnection.execute.mockRejectedValue(queryError);

            // Act
            await orassService.searchPolicies({}).catch(() => {});

            // Assert
            expect(mockConnection.close).toHaveBeenCalled();
        });

        it('should handle connection close failures', async () => {
            // Arrange
            await orassService.connect();
            const closeError = new Error('Connection close failed');
            mockConnection.close.mockRejectedValue(closeError);
            mockConnection.execute.mockResolvedValue({ rows: [] });

            // Act & Assert
            // Should not throw even if connection close fails
            await expect(orassService.searchPolicies({})).resolves.toBeDefined();
        });

        it('should properly cleanup resources on disconnect', async () => {
            // Arrange
            await orassService.connect();

            // Act
            await orassService.disconnect();

            // Assert
            expect(mockPool.close).toHaveBeenCalledWith(10);

            // Verify service state is reset
            const status = await orassService.getConnectionStatus();
            expect(status.connected).toBe(false);
        });
    });

    describe('Configuration and Environment', () => {
        it('should use environment variables for connection', async () => {
            // Arrange
            process.env.ORASS_USERNAME = 'test-user';
            process.env.ORASS_PASSWORD = 'test-password';

            // Act
            await orassService.connect();

            // Assert
            expect(mockedOracledb.createPool).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: 'test-user',
                    password: 'test-password'
                })
            );
        });

        it('should handle missing environment variables', async () => {
            // Arrange
            delete process.env.ORASS_USERNAME;
            delete process.env.ORASS_PASSWORD;

            // Act
            await orassService.connect();

            // Assert
            expect(mockedOracledb.createPool).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: undefined,
                    password: undefined
                })
            );
        });

        it('should use correct connection string format', async () => {
            // Arrange
            const expectedConnectionString = `${mockConfig.host}:${mockConfig.port}/${mockConfig.sid}`;

            // Act
            await orassService.connect();

            // Assert
            expect(mockedOracledb.createPool).toHaveBeenCalledWith(
                expect.objectContaining({
                    connectString: expectedConnectionString
                })
            );
        });

        it('should use configured pool settings', async () => {
            // Act
            await orassService.connect();

            // Assert
            expect(mockedOracledb.createPool).toHaveBeenCalledWith(
                expect.objectContaining({
                    poolMin: 2,
                    poolMax: 10,
                    poolIncrement: 1,
                    poolTimeout: 300,
                    poolPingInterval: 60,
                    stmtCacheSize: 30
                })
            );
        });
    });

    describe('Data Type Handling', () => {
        it('should handle Oracle DATE types correctly', async () => {
            // Arrange
            await orassService.connect();
            const criteria = createValidOrassPolicySearchCriteria();
            const mockRow = {
                ...createMockOracleQueryResult().orassRow,
                DATE_D_EFFET_DU_CONTRAT: new Date('2023-01-01T00:00:00.000Z'),
                DATE_D_ECHEANCE_DU_CONTRAT: new Date('2023-12-31T23:59:59.999Z')
            };

            mockConnection.execute
                .mockResolvedValueOnce({ rows: [mockRow] })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 1 }] });

            // Act
            const result = await orassService.searchPolicies(criteria);

            // Assert
            const policy = result.policies[0];
            expect(policy.policyEffectiveDate).toBeInstanceOf(Date);
            expect(policy.policyExpiryDate).toBeInstanceOf(Date);
            expect(policy.policyEffectiveDate.getFullYear()).toBe(2023);
            expect(policy.policyExpiryDate.getMonth()).toBe(11); // December (0-indexed)
        });

        it('should handle Oracle NUMBER types correctly', async () => {
            // Arrange
            await orassService.connect();
            const criteria = createValidOrassPolicySearchCriteria();
            const mockRow = {
                ...createMockOracleQueryResult().orassRow,
                PRIME_RC: 150000.50,
                NOMBRE_DE_PLACE_DU_VEHICULE: 5,
                PUISSANCE_FISCALE: 8.5,
                CHARGE_UTILE: 1500.75,
                REDUCTION_FLOTTE: 10.25,
                RNUM: 1
            };

            mockConnection.execute
                .mockResolvedValueOnce({ rows: [mockRow] })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 1 }] });

            // Act
            const result = await orassService.searchPolicies(criteria);

            // Assert
            const policy = result.policies[0];
            expect(typeof policy.premiumRC).toBe('number');
            expect(typeof policy.vehicleSeats).toBe('number');
            expect(typeof policy.vehicleFiscalPower).toBe('number');
            expect(typeof policy.vehicleUsefulLoad).toBe('number');
            expect(typeof policy.fleetReduction).toBe('number');
            expect(policy.premiumRC).toBe(150000.50);
            expect(policy.vehicleSeats).toBe(5);
        });

        it('should handle Oracle VARCHAR2 types correctly', async () => {
            // Arrange
            await orassService.connect();
            const criteria = createValidOrassPolicySearchCriteria();
            const mockRow = {
                ...createMockOracleQueryResult().orassRow,
                NUMERO_DE_POLICE: 'POL123456789',
                NOM_DU_SOUSCRIPTEUR: 'Jean-Baptiste De La Salle',
                ADRESSE_EMAIL_DU_SOUSCRIPTEUR: 'jean.baptiste@example.com',
                NUMERO_DE_CHASSIS_DU_VEHICULE: 'WVWZZZ1JZ3W386752'
            };

            mockConnection.execute
                .mockResolvedValueOnce({ rows: [mockRow] })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 1 }] });

            // Act
            const result = await orassService.searchPolicies(criteria);

            // Assert
            const policy = result.policies[0];
            expect(typeof policy.policyNumber).toBe('string');
            expect(typeof policy.subscriberName).toBe('string');
            expect(typeof policy.subscriberEmail).toBe('string');
            expect(typeof policy.vehicleChassisNumber).toBe('string');
            expect(policy.subscriberName).toBe('Jean-Baptiste De La Salle');
        });

        it('should handle NULL values from Oracle correctly', async () => {
            // Arrange
            await orassService.connect();
            const criteria = createValidOrassPolicySearchCriteria();
            const mockRow = {
                ...createMockOracleQueryResult().orassRow,
                EMAIL_NOTIFICATION: null,
                GENERATED_BY: null,
                OP_ATD: null,
                PUISSANCE_FISCALE: null,
                CHARGE_UTILE: null,
                REDUCTION_FLOTTE: null
            };

            mockConnection.execute
                .mockResolvedValueOnce({ rows: [mockRow] })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 1 }] });

            // Act
            const result = await orassService.searchPolicies(criteria);

            // Assert
            const policy = result.policies[0];
            expect(policy.emailNotification).toBeNull();
            expect(policy.generatedBy).toBeNull();
            expect(policy.opATD).toBeNull();
            expect(policy.vehicleFiscalPower).toBeNull();
            expect(policy.vehicleUsefulLoad).toBeNull();
            expect(policy.fleetReduction).toBeNull();
        });
    });

    describe('SQL Injection Prevention', () => {
        it('should use parameterized queries to prevent SQL injection', async () => {
            // Arrange
            await orassService.connect();
            const maliciousCriteria = {
                policyNumber: "'; DROP TABLE act_detail_att_digitale; --",
                applicantCode: "APP123",
                endorsementNumber: "END789"
            };

            mockConnection.execute
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 0 }] });

            // Act
            await orassService.searchPolicies(maliciousCriteria);

            // Assert
            const queryCall = mockConnection.execute.mock.calls[0];
            const query = queryCall[0];
            const binds = queryCall[1];

            // Verify query uses bind parameters
            expect(query).toContain(':numeropolice');
            expect(query).not.toContain("DROP TABLE");
            expect(binds.numeropolice).toBe("APP123'; DROP TABLE act_detail_att_digitale; --END789");
        });

        it('should sanitize special characters in search criteria', async () => {
            // Arrange
            await orassService.connect();
            const specialCharsCriteria = {
                policyNumber: "POL'123\"456",
                applicantCode: "APP;123",
                endorsementNumber: "END%789"
            };

            mockConnection.execute
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 0 }] });

            // Act
            await orassService.searchPolicies(specialCharsCriteria);

            // Assert
            const queryCall = mockConnection.execute.mock.calls[0];
            const binds = queryCall[1];

            expect(binds.numeropolice).toBe("APP;123POL'123\"456END%789");
        });
    });

    describe('Logging and Debugging', () => {
        it('should log debug information for queries', async () => {
            // Arrange
            await orassService.connect();
            const criteria = createValidOrassPolicySearchCriteria();

            mockConnection.execute
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 0 }] });

            // Act
            await orassService.searchPolicies(criteria);

            // Assert
            expect(logger.debug).toHaveBeenCalledWith(
                'Executing ORASS query:',
                expect.objectContaining({
                    query: expect.stringContaining('act_detail_att_digitale'),
                    binds: expect.any(Object)
                })
            );
        });

        it('should log connection events', async () => {
            // Act
            await orassService.connect();
            await orassService.disconnect();

            // Assert
            expect(logger.info).toHaveBeenCalledWith('✅ Connected to ORASS database successfully', expect.any(Object));
            expect(logger.info).toHaveBeenCalledWith('✅ Disconnected from ORASS database');
        });

        it('should log errors with context', async () => {
            // Arrange
            const connectionError = new Error('Network timeout');
            mockedOracledb.createPool.mockRejectedValue(connectionError as never);

            // Act
            await orassService.connect().catch(() => {});

            // Assert
            expect(logger.error).toHaveBeenCalledWith('❌ Failed to connect to ORASS database:', connectionError);
        });
    });
});