jest.mock('oracledb');
jest.mock('@utils/logger', () => ({ 
    logger: { 
        info: jest.fn(), 
        error: jest.fn(), 
        debug: jest.fn(), 
        warn: jest.fn() 
    } 
}));
jest.mock('@config/environment', () => ({ 
    getOrassConfig: jest.fn(() => ({
        host: 'localhost',
        port: 1521,
        sid: 'ORASS',
        username: 'testuser'
    }))
}));

import { OrassService } from '@services/orass.service';
import { BaseException } from '@exceptions/base.exception';
import { ConnectionStatus, HealthStatus, CertificateType, ChannelType, CertificateColor } from '@interfaces/common.enum';
import { logger } from '@utils/logger';

const mockOracledb = {
    createPool: jest.fn(),
    OUT_FORMAT_OBJECT: 1,
    initOracleClient: jest.fn(),
    autoCommit: true,
    outFormat: 1
};

const orassConfig = {
    host: 'localhost',
    port: 1521,
    sid: 'ORASS',
    username: 'testuser'
};

describe('OrassService', () => {
    let service: OrassService;
    let mockPool: any;
    let mockConnection: any;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Set up environment variables
        process.env.ORASS_USERNAME = 'testuser';
        process.env.ORASS_PASSWORD = 'testpass';
        
        // Re-setup the getOrassConfig mock after clearAllMocks
        const { getOrassConfig } = require('@config/environment');
        (getOrassConfig as jest.Mock).mockReturnValue(orassConfig);
        
        mockConnection = {
            execute: jest.fn(),
            close: jest.fn()
        };
        
        mockPool = {
            getConnection: jest.fn().mockResolvedValue(mockConnection),
            close: jest.fn()
        };
        
        (mockOracledb.createPool as jest.Mock).mockResolvedValue(mockPool);
        (mockOracledb.initOracleClient as jest.Mock).mockImplementation(() => {});
        
        service = new OrassService(mockOracledb);
    });

    describe('constructor', () => {
        it('should initialize Oracle client successfully', () => {
            expect(mockOracledb.initOracleClient).toHaveBeenCalled();
            expect(mockOracledb.outFormat).toBe(mockOracledb.OUT_FORMAT_OBJECT);
            expect(mockOracledb.autoCommit).toBe(true);
            expect(logger.info).toHaveBeenCalledWith('✅ Oracle client initialized');
        });

        it('should throw BaseException when Oracle client initialization fails', () => {
            const errorMock = jest.fn().mockImplementation(() => {
                throw new Error('Oracle client init failed');
            });
            
            const failingOracledb = {
                ...mockOracledb,
                initOracleClient: errorMock
            };

            expect(() => new OrassService(failingOracledb)).toThrow(BaseException);
            expect(logger.error).toHaveBeenCalledWith('❌ Failed to initialize Oracle client:', expect.any(Error));
        });
    });

    describe('connect', () => {
        beforeEach(() => {
            (service as any).pool = null;
            (service as any).isConnected = false;
        });

        it('should create a pool and set isConnected when successful', async () => {
            mockConnection.execute.mockResolvedValue({ rows: [] });
            
            await service.connect();
            
            expect(mockOracledb.createPool).toHaveBeenCalledWith({
                user: 'testuser',
                password: 'testpass',
                connectString: 'localhost:1521/ORASS',
                poolMin: 2,
                poolMax: 10,
                poolIncrement: 1,
                poolTimeout: 300,
                poolPingInterval: 60,
                stmtCacheSize: 30,
            });
            expect((service as any).isConnected).toBe(true);
            expect((service as any).lastConnectionCheck).toBeInstanceOf(Date);
            expect(logger.info).toHaveBeenCalledWith('✅ Connected to ORASS database successfully', expect.any(Object));
        });

        it('should not create a pool if already exists', async () => {
            (service as any).pool = mockPool;
            
            await service.connect();
            
            expect(mockOracledb.createPool).not.toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith('ORASS connection pool already exists');
        });

        it('should throw BaseException when pool creation fails', async () => {
            const error = new Error('Pool creation failed');
            (mockOracledb.createPool as jest.Mock).mockRejectedValue(error);
            
            await expect(service.connect()).rejects.toThrow(BaseException);
            expect((service as any).isConnected).toBe(false);
            expect(logger.error).toHaveBeenCalledWith('❌ Failed to connect to ORASS database:', error);
        });

        it('should throw BaseException when test connection fails', async () => {
            const error = new Error('Test connection failed');
            mockConnection.execute.mockRejectedValue(error);
            
            await expect(service.connect()).rejects.toThrow(BaseException);
            expect((service as any).isConnected).toBe(false);
        });
    });

    describe('testConnection', () => {
        it('should execute test query successfully', async () => {
            (service as any).pool = mockPool;
            mockConnection.execute.mockResolvedValue({ rows: [] });
            
            await (service as any).testConnection();
            
            expect(mockConnection.execute).toHaveBeenCalledWith('SELECT 1 FROM DUAL');
            expect(mockConnection.close).toHaveBeenCalled();
            expect(logger.debug).toHaveBeenCalledWith('ORASS database connection test successful');
        });

        it('should throw BaseException when pool is not initialized', async () => {
            (service as any).pool = null;
            
            await expect((service as any).testConnection()).rejects.toThrow(BaseException);
        });

        it('should throw BaseException when test query fails', async () => {
            (service as any).pool = mockPool;
            const error = new Error('Query failed');
            mockConnection.execute.mockRejectedValue(error);
            
            await expect((service as any).testConnection()).rejects.toThrow(BaseException);
            expect(logger.error).toHaveBeenCalledWith('❌ ORASS database connection test failed:', error);
        });

        it('should handle connection close error gracefully', async () => {
            (service as any).pool = mockPool;
            mockConnection.execute.mockResolvedValue({ rows: [] });
            const closeError = new Error('Close failed');
            mockConnection.close.mockRejectedValue(closeError);
            
            await (service as any).testConnection();
            
            expect(logger.warn).toHaveBeenCalledWith('⚠️ Failed to close ORASS test connection:', closeError);
        });

        it('should close connection even when execute fails', async () => {
            (service as any).pool = mockPool;
            mockConnection.execute.mockRejectedValue(new Error('Execute failed'));
            
            await expect((service as any).testConnection()).rejects.toThrow(BaseException);
            expect(mockConnection.close).toHaveBeenCalled();
        });
    });

    describe('disconnect', () => {
        it('should close the pool and reset state when pool exists', async () => {
            (service as any).pool = mockPool;
            (service as any).isConnected = true;
            
            await service.disconnect();
            
            expect(mockPool.close).toHaveBeenCalledWith(10);
            expect((service as any).pool).toBeNull();
            expect((service as any).isConnected).toBe(false);
            expect(logger.info).toHaveBeenCalledWith('✅ Disconnected from ORASS database');
        });

        it('should do nothing if pool is null', async () => {
            (service as any).pool = null;
            
            await service.disconnect();
            
            expect(mockPool.close).not.toHaveBeenCalled();
        });

        it('should handle disconnect errors gracefully', async () => {
            (service as any).pool = mockPool;
            const error = new Error('Disconnect failed');
            mockPool.close.mockRejectedValue(error);
            
            await service.disconnect();
            
            expect(logger.error).toHaveBeenCalledWith('❌ Error disconnecting from ORASS database:', error);
        });
    });

    describe('getConnectionStatus', () => {
        it('should return connected status when pool exists and test succeeds', async () => {
            (service as any).pool = mockPool;
            mockConnection.execute.mockResolvedValue({ rows: [] });
            
            const status = await service.getConnectionStatus();
            
            expect(status.connected).toBe(true);
            expect(status.error).toBeUndefined();
            expect(status.connectionInfo).toEqual(orassConfig);
            expect(status.lastChecked).toBeInstanceOf(Date);
        });

        it('should return disconnected status when pool is null', async () => {
            (service as any).pool = null;
            
            const status = await service.getConnectionStatus();
            
            expect(status.connected).toBe(false);
            expect(status.error).toBe('Connection test failed');
        });

        it('should return disconnected status when test connection fails', async () => {
            (service as any).pool = mockPool;
            mockConnection.execute.mockRejectedValue(new Error('Test failed'));
            
            const status = await service.getConnectionStatus();
            
            expect(status.connected).toBe(false);
            expect(status.error).toBe('Connection test failed');
        });
    });

    describe('searchPolicies', () => {
        beforeEach(() => {
            (service as any).pool = mockPool;
        });

        it('should throw BaseException when not connected', async () => {
            (service as any).pool = null;
            
            await expect(service.searchPolicies({}, 10, 0)).rejects.toThrow(BaseException);
        });

        it('should execute search and return policies with pagination', async () => {
            const mockRows = [
                {
                    NUMERO_DE_POLICE: '123456',
                    OFFICE_CODE: 'OFF001',
                    ORGANIZATION_CODE: 'ORG001',
                    CERTIFICATE_TYPE: CertificateType.CIMA,
                    CHANNEL: ChannelType.WEB,
                    COULEUR_D_ATTESTATION_A_EDITER: CertificateColor.CIMA_JAUNE,
                    RNUM: 1
                }
            ];
            
            mockConnection.execute
                .mockResolvedValueOnce({ rows: mockRows })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 5 }] });
            
            const result = await service.searchPolicies({}, 10, 0);
            
            expect(result.policies).toHaveLength(1);
            expect(result.totalCount).toBe(5);
            expect(result.hasMore).toBe(true);
            expect(result.policies[0].policyNumber).toBe('123456');
            expect(logger.debug).toHaveBeenCalledWith('Executing ORASS query:', expect.any(Object));
        });

        it('should handle search criteria with all fields', async () => {
            const criteria = {
                applicantCode: 'APP001',
                policyNumber: 'POL123',
                endorsementNumber: 'END456'
            };
            
            mockConnection.execute
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 0 }] });
            
            await service.searchPolicies(criteria, 10, 0);
            
            expect(mockConnection.execute).toHaveBeenCalledWith(
                expect.stringContaining('NUMERO_DE_POLICE = :numeropolice'),
                expect.objectContaining({ numeropolice: 'APP001POL123END456' })
            );
        });

        it('should handle empty search results', async () => {
            mockConnection.execute
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 0 }] });
            
            const result = await service.searchPolicies({}, 10, 0);
            
            expect(result.policies).toHaveLength(0);
            expect(result.totalCount).toBe(0);
            expect(result.hasMore).toBe(false);
        });

        it('should handle pagination correctly', async () => {
            const mockRows = [{ NUMERO_DE_POLICE: '123', RNUM: 1 }];
            mockConnection.execute
                .mockResolvedValueOnce({ rows: mockRows })
                .mockResolvedValueOnce({ rows: [{ TOTAL_COUNT: 15 }] });
            
            const result = await service.searchPolicies({}, 5, 10);
            
            expect(result.hasMore).toBe(true); // 10 + 1 < 15 is true
        });

        it('should throw BaseException on query error', async () => {
            const error = new Error('Query failed');
            mockConnection.execute.mockRejectedValue(error);
            
            await expect(service.searchPolicies({}, 10, 0)).rejects.toThrow(BaseException);
            expect(logger.error).toHaveBeenCalledWith('❌ Error searching ORASS policies:', error);
        });

        it('should close connection even when query fails', async () => {
            mockConnection.execute.mockRejectedValue(new Error('Query failed'));
            
            await expect(service.searchPolicies({}, 10, 0)).rejects.toThrow(BaseException);
            expect(mockConnection.close).toHaveBeenCalled();
        });

        it('should handle missing total count gracefully', async () => {
            mockConnection.execute
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{}] }); // No TOTAL_COUNT property
            
            const result = await service.searchPolicies({}, 10, 0);
            
            expect(result.totalCount).toBe(0);
        });
    });

    describe('buildSearchQuery', () => {
        it('should build query without criteria', () => {
            const result = (service as any).buildSearchQuery({}, 10, 0);
            
            expect(result.query).toContain('FROM act_detail_att_digitale');
            expect(result.query).toContain('WHERE 1=1');
            expect(result.query).toContain('ORDER BY NUMERO_DE_POLICE DESC');
            expect(result.binds.max_row).toBe(10);
            expect(result.binds.min_row).toBe(0);
        });

        it('should build query with search criteria', () => {
            const criteria = {
                applicantCode: 'APP',
                policyNumber: 'POL',
                endorsementNumber: 'END'
            };
            
            const result = (service as any).buildSearchQuery(criteria, 5, 10);
            
            expect(result.query).toContain('NUMERO_DE_POLICE = :numeropolice');
            expect(result.binds.numeropolice).toBe('APPPOLEND');
            expect(result.binds.max_row).toBe(15); // 10 + 5
            expect(result.binds.min_row).toBe(10);
        });

        it('should not add conditions when criteria fields are missing', () => {
            const criteria = {
                applicantCode: 'APP',
                policyNumber: '', // Empty
                endorsementNumber: 'END'
            };
            
            const result = (service as any).buildSearchQuery(criteria, 10, 0);
            
            expect(result.query).not.toContain('NUMERO_DE_POLICE = :numeropolice');
            expect(result.binds.numeropolice).toBeUndefined();
        });
    });

    describe('buildCountQuery', () => {
        it('should build count query without criteria', () => {
            const result = (service as any).buildCountQuery({});
            
            expect(result.query).toContain('SELECT COUNT(*) as TOTAL_COUNT');
            expect(result.query).toContain('FROM act_detail_att_digitale');
            expect(result.query).toContain('WHERE 1=1');
        });

        it('should build count query with criteria', () => {
            const criteria = {
                applicantCode: 'APP',
                policyNumber: 'POL',
                endorsementNumber: 'END'
            };
            
            const result = (service as any).buildCountQuery(criteria);
            
            expect(result.query).toContain('NUMERO_DE_POLICE = :numeropolice');
            expect(result.binds.numeropolice).toBe('APPPOLEND');
        });
    });

    describe('mapRowToPolicy', () => {
        it('should map database row to policy object correctly', () => {
            const mockRow = {
                NUMERO_DE_POLICE: '123456789',
                OFFICE_CODE: 'OFF001',
                ORGANIZATION_CODE: 'ORG001',
                CERTIFICATE_TYPE: CertificateType.CIMA,
                EMAIL_NOTIFICATION: 'test@example.com',
                GENERATED_BY: 'USER001',
                CHANNEL: ChannelType.WEB,
                COULEUR_D_ATTESTATION_A_EDITER: CertificateColor.CIMA_JAUNE,
                PRIME_RC: 50000,
                ENERGIE_DU_VEHICULE: 'ESSENCE',
                NUMERO_DE_CHASSIS_DU_VEHICULE: 'CHASSIS123',
                MODELE_DU_VEHICULE: 'COROLLA',
                GENRE_DU_VEHICULE: 'VP',
                CATEGORIE_DU_VEHICULE: 'M1',
                USAGE_DU_VEHICULE: 'PRIVE',
                MARQUE_DU_VEHICULE: 'TOYOTA',
                TYPE_DU_VEHICULE: 'BERLINE',
                NOMBRE_DE_PLACE_DU_VEHICULE: 5,
                TYPE_DE_SOUSCRIPTEUR: 'PARTICULIER',
                NUMERO_DE_TELEPHONE_DU_SOUS: '123456789',
                BOITE_POSTALE_DU_SOUSCRIPTEUR: 'BP123',
                ADRESSE_EMAIL_DU_SOUSCRIPTEUR: 'subscriber@example.com',
                NOM_DU_SOUSCRIPTEUR: 'John Doe',
                TELEPHONE_MOBILE_DE_L_ASSURE: '987654321',
                BOITE_POSTALE_DE_L_ASSURE: 'BP456',
                NOM_DE_L_ASSURE: 'Jane Doe',
                ADRESSE_EMAIL_DE_L_ASSURE: 'insured@example.com',
                IMMATRICULATION_DU_VEHICULE: 'ABC123CD',
                DATE_D_EFFET_DU_CONTRAT: new Date('2023-01-01'),
                DATE_D_ECHEANCE_DU_CONTRAT: new Date('2024-01-01'),
                PUISSANCE_FISCALE: 7,
                CHARGE_UTILE: 500,
                REDUCTION_FLOTTE: 10,
                RNUM: 1,
                OP_ATD: 'OP123'
            };
            
            const result = (service as any).mapRowToPolicy(mockRow);
            
            expect(result).toEqual({
                policyNumber: '123456789',
                officeCode: 'OFF001',
                organizationCode: 'ORG001',
                certificateType: CertificateType.CIMA,
                emailNotification: 'test@example.com',
                generatedBy: 'USER001',
                channel: ChannelType.WEB,
                certificateColor: CertificateColor.CIMA_JAUNE,
                premiumRC: 50000,
                vehicleEnergy: 'ESSENCE',
                vehicleChassisNumber: 'CHASSIS123',
                vehicleModel: 'COROLLA',
                vehicleGenre: 'VP',
                vehicleCategory: 'M1',
                vehicleUsage: 'PRIVE',
                vehicleBrand: 'TOYOTA',
                vehicleType: 'BERLINE',
                vehicleSeats: 5,
                subscriberType: 'PARTICULIER',
                subscriberPhone: '123456789',
                subscriberPoBox: 'BP123',
                subscriberEmail: 'subscriber@example.com',
                subscriberName: 'John Doe',
                insuredPhone: '987654321',
                insuredPoBox: 'BP456',
                insuredName: 'Jane Doe',
                insuredEmail: 'insured@example.com',
                vehicleRegistrationNumber: 'ABC123CD',
                policyEffectiveDate: new Date('2023-01-01'),
                policyExpiryDate: new Date('2024-01-01'),
                vehicleFiscalPower: 7,
                vehicleUsefulLoad: 500,
                fleetReduction: 10,
                rNum: 1,
                opATD: 'OP123'
            });
        });
    });

    describe('healthCheck', () => {
        it('should return healthy status when connected', async () => {
            jest.spyOn(service, 'getConnectionStatus').mockResolvedValue({
                connected: true,
                lastChecked: new Date(),
                connectionInfo: orassConfig,
                error: undefined
            });
            
            const result = await service.healthCheck();
            
            expect(result.connection).toBe(ConnectionStatus.ACTIVE);
            expect(result.status).toBe(HealthStatus.HEALTHY);
            expect(result.details.connected).toBe(true);
            expect(result.timestamp).toBeDefined();
        });

        it('should return unhealthy status when not connected', async () => {
            jest.spyOn(service, 'getConnectionStatus').mockResolvedValue({
                connected: false,
                lastChecked: new Date(),
                connectionInfo: orassConfig,
                error: 'Connection failed'
            });
            
            const result = await service.healthCheck();
            
            expect(result.connection).toBe(ConnectionStatus.FAILED);
            expect(result.status).toBe(HealthStatus.UNHEALTHY);
            expect(result.details.connected).toBe(false);
            expect(result.details.error).toBe('Connection failed');
        });

        it('should handle errors in health check gracefully', async () => {
            const error = new Error('Health check failed');
            jest.spyOn(service, 'getConnectionStatus').mockRejectedValue(error);

            await expect(service.healthCheck()).rejects.toThrow('Health check failed');
        });
    });

    describe('edge cases and error scenarios', () => {
        it('should handle null/undefined values in mapRowToPolicy', () => {
            const mockRow = {
                NUMERO_DE_POLICE: null,
                OFFICE_CODE: undefined,
                RNUM: 1
            };
            
            const result = (service as any).mapRowToPolicy(mockRow);
            
            expect(result.policyNumber).toBeNull();
            expect(result.officeCode).toBeUndefined();
            expect(result.rNum).toBe(1);
        });

        it('should handle connection pool timeout during search', async () => {
            (service as any).pool = mockPool;
            const timeoutError = new Error('Connection timeout');
            timeoutError.name = 'TimeoutError';
            mockPool.getConnection.mockRejectedValue(timeoutError);
            
            await expect(service.searchPolicies({}, 10, 0)).rejects.toThrow(BaseException);
        });

        it('should handle large offset and limit values', () => {
            const result = (service as any).buildSearchQuery({}, 1000, 50000);
            
            expect(result.binds.max_row).toBe(51000);
            expect(result.binds.min_row).toBe(50000);
        });

        it('should handle zero limit and offset', () => {
            const result = (service as any).buildSearchQuery({}, 0, 0);
            
            expect(result.binds.max_row).toBe(0);
            expect(result.binds.min_row).toBe(0);
        });
    });
});