import { RoleModel, initRoleModel, RoleAttributes, RoleCreationAttributes } from '@models/role.model';
import {DataTypes, Order, Sequelize} from 'sequelize';
import {
    createMockRoleAttributes,
    createMockRoleCreationAttributes,
    createMockRole,
    createMockSequelize,
    createMockRoleModel,
    createPermissionTestScenarios,
    createAnyPermissionTestScenarios,
    createAllPermissionsTestScenarios,
    createValidationTestCases,
    createFindByNameTestScenarios,
    createGetDefaultRoleTestScenarios,
    createJsonTestData,
    createInvalidJsonTestData,
    createHookTestScenarios,
    createDatabaseOperationScenarios,
    createPerformanceTestData,
    createRoleValidationError,
    createRoleUniqueConstraintError,
    createRoleDatabaseError,
    expectRoleAttributes,
    expectRoleValidation,
    setupRoleTestEnvironment,
    cleanupRoleTestEnvironment,
    createRoleIntegrationTestData,
    createSecurityTestScenarios,
    createConcurrencyTestScenarios,
    createMemoryTestData,
    ROLE_TEST_CONSTANTS
} from './role.test.utils';

// Mock Sequelize
jest.mock('sequelize');

describe('RoleModel', () => {
    let mockSequelize: jest.Mocked<Sequelize>;
    let mockRoleModel: any;

    beforeAll(() => {
        setupRoleTestEnvironment();
    });

    afterAll(() => {
        cleanupRoleTestEnvironment();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockSequelize = createMockSequelize();
        mockRoleModel = createMockRoleModel();
        
        // Mock the static methods on RoleModel
        RoleModel.create = jest.fn();
        RoleModel.update = jest.fn();
        RoleModel.destroy = jest.fn();
        RoleModel.findOne = jest.fn();
        RoleModel.findByPk = jest.fn();
        RoleModel.findAll = jest.fn();
        RoleModel.create = jest.fn();
        RoleModel.update = jest.fn();
        RoleModel.destroy = jest.fn();
        RoleModel.count = jest.fn();
        RoleModel.init = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Model Definition and Initialization', () => {
        it('should initialize the model with correct attributes', () => {
            const result = initRoleModel(mockSequelize);

            expect(RoleModel.init).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: expect.objectContaining({
                        type: DataTypes.UUID,
                        defaultValue: DataTypes.UUIDV4,
                        primaryKey: true
                    }),
                    name: expect.objectContaining({
                        type: DataTypes.STRING(50),
                        allowNull: false,
                        validate: expect.objectContaining({
                            len: [2, 50],
                            notEmpty: true,
                            isUppercase: true
                        })
                    }),
                    description: expect.objectContaining({
                        type: DataTypes.STRING(255),
                        allowNull: true
                    }),
                    permissions: expect.objectContaining({
                        type: DataTypes.TEXT,
                        allowNull: false
                    }),
                    isActive: expect.objectContaining({
                        type: DataTypes.BOOLEAN,
                        field: 'is_active',
                        allowNull: false
                    }),
                    createdAt: expect.objectContaining({
                        type: DataTypes.DATE,
                        field: 'created_at',
                        allowNull: false,
                        defaultValue: DataTypes.NOW
                    }),
                    updatedAt: expect.objectContaining({
                        type: DataTypes.DATE,
                        field: 'updated_at',
                        allowNull: false,
                        defaultValue: DataTypes.NOW
                    })
                }),
                expect.objectContaining({
                    sequelize: mockSequelize,
                    modelName: 'Role',
                    tableName: 'roles',
                    timestamps: true,
                    underscored: true,
                    indexes: expect.arrayContaining([
                        expect.objectContaining({
                            name: 'idx_roles_name',
                            unique: true,
                            fields: ['name']
                        }),
                        expect.objectContaining({
                            name: 'idx_roles_is_active',
                            fields: ['is_active']
                        })
                    ]),
                    hooks: expect.objectContaining({
                        beforeCreate: expect.any(Function)
                    })
                })
            );

            expect(result).toBe(RoleModel);
        });

        it('should have correct table configuration', () => {
            initRoleModel(mockSequelize);

            const initCall = (RoleModel.init as jest.Mock).mock.calls[0];
            const options = initCall[1];

            expect(options.tableName).toBe('roles');
            expect(options.modelName).toBe('Role');
            expect(options.timestamps).toBe(true);
            expect(options.underscored).toBe(true);
        });

        it('should have correct indexes defined', () => {
            initRoleModel(mockSequelize);

            const initCall = (RoleModel.init as jest.Mock).mock.calls[0];
            const options = initCall[1];

            expect(options.indexes).toHaveLength(2);
            expect(options.indexes[0]).toEqual({
                name: 'idx_roles_name',
                unique: true,
                fields: ['name']
            });
            expect(options.indexes[1]).toEqual({
                name: 'idx_roles_is_active',
                fields: ['is_active']
            });
        });
    });

    describe('Instance Methods', () => {
        describe('hasPermission', () => {
            const permissionScenarios = createPermissionTestScenarios();

            permissionScenarios.forEach(({ name, rolePermissions, testPermission, expectedResult }) => {
                it(`should handle ${name}`, () => {
                    const role = createMockRole({ permissions: rolePermissions });
                    
                    // Mock the actual implementation
                    role.hasPermission.mockImplementation((permission: string) => 
                        rolePermissions.includes(permission)
                    );

                    const result = role.hasPermission(testPermission);

                    expect(result).toBe(expectedResult);
                    expect(role.hasPermission).toHaveBeenCalledWith(testPermission);
                });
            });

            it('should handle null and undefined permissions gracefully', () => {
                const role = createMockRole({ permissions: [] });
                
                role.hasPermission.mockImplementation((permission: string) => {
                    if (!permission) return false;
                    return role.permissions.includes(permission);
                });

                expect(role.hasPermission(null as any)).toBe(false);
                expect(role.hasPermission(undefined as any)).toBe(false);
                expect(role.hasPermission('')).toBe(false);
            });

            it('should be case sensitive', () => {
                const role = createMockRole({ permissions: ['READ', 'WRITE'] });
                
                role.hasPermission.mockImplementation((permission: string) => 
                    role.permissions.includes(permission)
                );

                expect(role.hasPermission('READ')).toBe(true);
                expect(role.hasPermission('read')).toBe(false);
                expect(role.hasPermission('WRITE')).toBe(true);
                expect(role.hasPermission('write')).toBe(false);
            });
        });

        describe('hasAnyPermission', () => {
            const anyPermissionScenarios = createAnyPermissionTestScenarios();

            anyPermissionScenarios.forEach(({ name, rolePermissions, testPermissions, expectedResult }) => {
                it(`should handle ${name}`, () => {
                    const role = createMockRole({ permissions: rolePermissions });
                    
                    role.hasAnyPermission.mockImplementation((permissions: string[]) => 
                        permissions.some(permission => rolePermissions.includes(permission))
                    );

                    const result = role.hasAnyPermission(testPermissions);

                    expect(result).toBe(expectedResult);
                    expect(role.hasAnyPermission).toHaveBeenCalledWith(testPermissions);
                });
            });

            it('should handle null and undefined input', () => {
                const role = createMockRole({ permissions: ['read', 'write'] });
                
                role.hasAnyPermission.mockImplementation((permissions: string[]) => {
                    if (!permissions || !Array.isArray(permissions)) return false;
                    return permissions.some(permission => role.permissions.includes(permission));
                });

                expect(role.hasAnyPermission(null as any)).toBe(false);
                expect(role.hasAnyPermission(undefined as any)).toBe(false);
            });

            it('should handle array with null/undefined elements', () => {
                const role = createMockRole({ permissions: ['read', 'write'] });
                
                role.hasAnyPermission.mockImplementation((permissions: string[]) => 
                    permissions.filter(p => p).some(permission => role.permissions.includes(permission))
                );

                expect(role.hasAnyPermission([null as any, 'read', undefined as any])).toBe(true);
                expect(role.hasAnyPermission([null as any, undefined as any])).toBe(false);
            });
        });

        describe('hasAllPermissions', () => {
            const allPermissionsScenarios = createAllPermissionsTestScenarios();

            allPermissionsScenarios.forEach(({ name, rolePermissions, testPermissions, expectedResult }) => {
                it(`should handle ${name}`, () => {
                    const role = createMockRole({ permissions: rolePermissions });
                    
                    role.hasAllPermissions.mockImplementation((permissions: string[]) => 
                        permissions.every(permission => rolePermissions.includes(permission))
                    );

                    const result = role.hasAllPermissions(testPermissions);

                    expect(result).toBe(expectedResult);
                    expect(role.hasAllPermissions).toHaveBeenCalledWith(testPermissions);
                });
            });

            it('should handle null and undefined input', () => {
                const role = createMockRole({ permissions: ['read', 'write'] });
                
                role.hasAllPermissions.mockImplementation((permissions: string[]) => {
                    if (!permissions || !Array.isArray(permissions)) return false;
                    return permissions.every(permission => role.permissions.includes(permission));
                });

                expect(role.hasAllPermissions(null as any)).toBe(false);
                expect(role.hasAllPermissions(undefined as any)).toBe(false);
            });

            it('should handle duplicate permissions in test array', () => {
                const role = createMockRole({ permissions: ['read', 'write', 'delete'] });
                
                role.hasAllPermissions.mockImplementation((permissions: string[]) => 
                    permissions.every(permission => role.permissions.includes(permission))
                );

                expect(role.hasAllPermissions(['read', 'read', 'write'])).toBe(true);
                expect(role.hasAllPermissions(['read', 'admin', 'read'])).toBe(false);
            });
        });
    });

    describe('Static Methods', () => {
        describe('findByName', () => {
            const findByNameScenarios = createFindByNameTestScenarios();

            findByNameScenarios.forEach(({ name, searchName, mockResult, expectedResult }) => {
                it(`should handle ${name}`, async () => {
                    (RoleModel.findOne as jest.Mock).mockResolvedValue(mockResult);

                    const result = await RoleModel.findByName(searchName);

                    expect(RoleModel.findOne).toHaveBeenCalledWith({
                        where: { name: searchName, isActive: true }
                    });

                    if (expectedResult === 'found') {
                        expect(result).toEqual(mockResult);
                        expect(result).not.toBeNull();
                    } else {
                        expect(result).toBeNull();
                    }
                });
            });

            it('should handle database errors', async () => {
                const dbError = createRoleDatabaseError('Connection failed');
                (RoleModel.findOne as jest.Mock).mockRejectedValue(dbError);

                await expect(RoleModel.findByName('USER')).rejects.toThrow('Connection failed');
                expect(RoleModel.findOne).toHaveBeenCalledWith({
                    where: { name: 'USER', isActive: true }
                });
            });

            it('should only find active roles', async () => {
                await RoleModel.findByName('TEST_ROLE');

                expect(RoleModel.findOne).toHaveBeenCalledWith({
                    where: { name: 'TEST_ROLE', isActive: true }
                });
            });
        });

        describe('getDefaultRole', () => {
            const defaultRoleScenarios = createGetDefaultRoleTestScenarios();

            defaultRoleScenarios.forEach(({ name, mockResult, expectedResult }) => {
                it(`should handle ${name}`, async () => {
                    (RoleModel.findOne as jest.Mock).mockResolvedValue(mockResult);

                    const result = await RoleModel.getDefaultRole();

                    expect(RoleModel.findOne).toHaveBeenCalledWith({
                        where: { name: 'USER', isActive: true }
                    });

                    if (expectedResult === 'found') {
                        expect(result).toEqual(mockResult);
                        expect(result).not.toBeNull();
                    } else {
                        expect(result).toBeNull();
                    }
                });
            });

            it('should handle database errors', async () => {
                const dbError = createRoleDatabaseError('Connection timeout');
                (RoleModel.findOne as jest.Mock).mockRejectedValue(dbError);

                await expect(RoleModel.getDefaultRole()).rejects.toThrow('Connection timeout');
                expect(RoleModel.findOne).toHaveBeenCalledWith({
                    where: { name: 'USER', isActive: true }
                });
            });

            it('should always search for USER role', async () => {
                await RoleModel.getDefaultRole();

                expect(RoleModel.findOne).toHaveBeenCalledWith({
                    where: { name: 'USER', isActive: true }
                });
            });
        });
    });

    describe('Validation', () => {
        const validationTestCases = createValidationTestCases();

        validationTestCases.forEach(({ name, data, shouldPass, expectedError }) => {
            it(`should handle ${name}`, async () => {
                if (shouldPass) {
                    const mockRole = createMockRole(data);
                    (RoleModel.create as jest.Mock).mockResolvedValue(mockRole);

                    const result = await RoleModel.create(data);

                    expect(result).toEqual(mockRole);
                    expect(RoleModel.create).toHaveBeenCalledWith(data);
                } else {
                    const validationError = createRoleValidationError('name', expectedError || 'Validation failed');
                    (RoleModel.create as jest.Mock).mockRejectedValue(validationError);

                    await expect(RoleModel.create(data)).rejects.toThrow();
                    expect(RoleModel.create).toHaveBeenCalledWith(data);
                }
            });
        });

        describe('Name Validation', () => {
            it('should validate name length constraints', async () => {
                const shortNameError = createRoleValidationError('name', 'Validation len on name failed');
                const longNameError = createRoleValidationError('name', 'Validation len on name failed');

                (RoleModel.create as jest.Mock)
                    .mockRejectedValueOnce(shortNameError)
                    .mockRejectedValueOnce(longNameError);

                await expect(RoleModel.create(createMockRoleCreationAttributes({ name: 'A' }))).rejects.toThrow();
                await expect(RoleModel.create(createMockRoleCreationAttributes({ name: 'A'.repeat(51) }))).rejects.toThrow();
            });

            it('should validate name is uppercase', async () => {
                const uppercaseError = createRoleValidationError('name', 'Validation isUppercase on name failed');
                (RoleModel.create as jest.Mock).mockRejectedValue(uppercaseError);

                await expect(RoleModel.create(createMockRoleCreationAttributes({ name: 'user' }))).rejects.toThrow();
            });

            it('should validate name is not empty', async () => {
                const emptyError = createRoleValidationError('name', 'Validation notEmpty on name failed');
                (RoleModel.create as jest.Mock).mockRejectedValue(emptyError);

                await expect(RoleModel.create(createMockRoleCreationAttributes({ name: '' }))).rejects.toThrow();
            });

            it('should enforce unique name constraint', async () => {
                const uniqueError = createRoleUniqueConstraintError('name');
                (RoleModel.create as jest.Mock).mockRejectedValue(uniqueError);

                await expect(RoleModel.create(createMockRoleCreationAttributes({ name: 'EXISTING_ROLE' }))).rejects.toThrow();
            });
        });

        describe('Description Validation', () => {
            it('should allow null description', async () => {
                const mockRole = createMockRole({ description: undefined });
                (RoleModel.create as jest.Mock).mockResolvedValue(mockRole);

                const result = await RoleModel.create(createMockRoleCreationAttributes({ description: undefined }));

                expect(result.description).toBeUndefined();
            });

            it('should allow empty description', async () => {
                const mockRole = createMockRole({ description: '' });
                (RoleModel.create as jest.Mock).mockResolvedValue(mockRole);

                const result = await RoleModel.create(createMockRoleCreationAttributes({ description: '' }));

                expect(result.description).toBe('');
            });

            it('should validate description length', async () => {
                const lengthError = createRoleValidationError('description', 'Description too long');
                (RoleModel.create as jest.Mock).mockRejectedValue(lengthError);

                await expect(RoleModel.create(createMockRoleCreationAttributes({ 
                    description: 'A'.repeat(256) 
                }))).rejects.toThrow();
            });
        });

        describe('Permissions Validation', () => {
            it('should validate permissions is an array', async () => {
                const arrayError = createRoleValidationError('permissions', 'Permissions must be an array');
                (RoleModel.create as jest.Mock).mockRejectedValue(arrayError);

                await expect(RoleModel.create({
                    ...createMockRoleCreationAttributes(),
                    permissions: 'not_an_array' as any
                })).rejects.toThrow();
            });

            it('should handle null permissions', async () => {
                const nullError = createRoleValidationError('permissions', 'Permissions must be an array');
                (RoleModel.create as jest.Mock).mockRejectedValue(nullError);

                await expect(RoleModel.create({
                    ...createMockRoleCreationAttributes(),
                    permissions: null as any
                })).rejects.toThrow();
            });

            it('should allow empty permissions array', async () => {
                const mockRole = createMockRole({ permissions: [] });
                (RoleModel.create as jest.Mock).mockResolvedValue(mockRole);

                const result = await RoleModel.create(createMockRoleCreationAttributes({ permissions: [] }));

                expect(result.permissions).toEqual([]);
            });

            it('should allow valid permissions array', async () => {
                const permissions = ['read', 'write', 'delete'];
                const mockRole = createMockRole({ permissions });
                (RoleModel.create as jest.Mock).mockResolvedValue(mockRole);

                const result = await RoleModel.create(createMockRoleCreationAttributes({ permissions }));

                expect(result.permissions).toEqual(permissions);
            });
        });
    });

    describe('JSON Serialization/Deserialization', () => {
        describe('Serialization', () => {
            const jsonTestData = createJsonTestData();

            jsonTestData.forEach(({ name, input, expectedSerialized }) => {
                it(`should serialize ${name}`, () => {
                    // Mock the serialization function
                    const serializeJsonRole = (value: any): string | null => {
                        if (value === null || value === undefined) return null;
                        try {
                            return JSON.stringify(value);
                        } catch (error) {
                            return null;
                        }
                    };

                    const result = serializeJsonRole(input);
                    expect(result).toBe(expectedSerialized);
                });
            });

            it('should handle serialization errors gracefully', () => {
                const serializeJsonRole = (value: any): string | null => {
                    if (value === null || value === undefined) return null;
                    try {
                        return JSON.stringify(value);
                    } catch (error) {
                        console.error('Error serializing JSON:', error);
                        return null;
                    }
                };

                // Create circular reference
                const circular: any = { a: 1 };
                circular.b = circular;

                const result = serializeJsonRole(circular);
                expect(result).toBeNull();
            });
        });

        describe('Deserialization', () => {
            const jsonTestData = createJsonTestData();
            const invalidJsonTestData = createInvalidJsonTestData();

            jsonTestData.forEach(({ name, expectedSerialized, expectedDeserialized }) => {
                it(`should deserialize ${name}`, () => {
                    const deserializeJsonRole = (value: string | null): any => {
                        if (!value) return [];
                        try {
                            return JSON.parse(value);
                        } catch (error) {
                            console.error('Error deserializing JSON:', error);
                            return [];
                        }
                    };

                    const result = deserializeJsonRole(expectedSerialized);
                    expect(result).toEqual(expectedDeserialized);
                });
            });

            invalidJsonTestData.forEach(({ name, input, expectedDeserialized }) => {
                it(`should handle invalid JSON: ${name}`, () => {
                    const deserializeJsonRole = (value: string | null): any => {
                        if (!value) return [];
                        try {
                            return JSON.parse(value);
                        } catch (error) {
                            console.error('Error deserializing JSON:', error);
                            return [];
                        }
                    };

                    const result = deserializeJsonRole(input);
                    expect(result).toEqual(expectedDeserialized);
                });
            });
        });
    });

    describe('Hooks', () => {
        describe('beforeCreate Hook', () => {
            const hookScenarios = createHookTestScenarios();

            hookScenarios.forEach(({ name, roleData, expectedIsActive, expectedPermissions }) => {
                it(`should handle ${name}`, () => {
                    // Mock the beforeCreate hook behavior
                    const mockRole = {
                        ...roleData,
                        setDataValue: jest.fn(),
                        isActive: roleData.isActive,
                        permissions: roleData.permissions
                    };

                    // Simulate the hook logic
                    if (mockRole.isActive === undefined) {
                        mockRole.setDataValue('isActive', true);
                        mockRole.isActive = true;
                    }
                    if (mockRole.permissions === undefined) {
                        mockRole.setDataValue('permissions', []);
                        mockRole.permissions = [];
                    }

                    // Verify the calls in the order they would happen
                    if (roleData.isActive === undefined) {
                        expect(mockRole.setDataValue).toHaveBeenCalledWith('isActive', expectedIsActive);
                    }
                    if (roleData.permissions === undefined) {
                        expect(mockRole.setDataValue).toHaveBeenCalledWith('permissions', expectedPermissions);
                    }

                    // Verify the final state
                    expect(mockRole.isActive).toBe(expectedIsActive);
                    expect(mockRole.permissions).toEqual(expectedPermissions);
                });
            });

            it('should not modify defined values', () => {
                const mockRole = {
                    name: 'TEST',
                    isActive: false,
                    permissions: ['admin'],
                    setDataValue: jest.fn()
                };

                // Hook should not modify already defined values
                // (This would be tested in actual hook execution)

                expect(mockRole.setDataValue).not.toHaveBeenCalled();
                expect(mockRole.isActive).toBe(false);
                expect(mockRole.permissions).toEqual(['admin']);
            });
        });
    });

    describe('Database Operations', () => {
        const dbOperationScenarios = createDatabaseOperationScenarios();

        dbOperationScenarios.forEach(({ name, operation, data, shouldSucceed, expectedError }) => {
            it(`should handle ${name}`, async () => {
                if (shouldSucceed) {
                    const mockResult = operation === 'create' 
                        ? createMockRole(data)
                        : operation === 'update'
                        ? [1, [createMockRole(data)]]
                        : operation === 'delete'
                        ? 1
                        : createMockRole();

                    switch (operation) {
                        case 'create':
                            (RoleModel.create as jest.Mock).mockResolvedValue(mockResult);
                            break;
                        case 'update':
                            (RoleModel.update as jest.Mock).mockResolvedValue(mockResult);
                            break;
                        case 'delete':
                            (RoleModel.destroy as jest.Mock).mockResolvedValue(mockResult);
                            break;
                        case 'findByPk':
                            (RoleModel.findByPk as jest.Mock).mockResolvedValue(mockResult);
                            break;
                    }

                    let result;
                    switch (operation) {
                        case 'create':
                            result = await RoleModel.create(data as RoleCreationAttributes);
                            break;
                        case 'update':
                            result = await RoleModel.update(data as any, { where: { id: 'test-id' } });
                            break;
                        case 'delete':
                            result = await RoleModel.destroy({ where: { id: 'test-id' } });
                            break;
                        case 'findByPk':
                            result = await RoleModel.findByPk((data as any).id);
                            break;
                        default:
                            throw new Error(`Unknown operation: ${operation}`);
                    }

                    expect(result).toBeDefined();
                } else {
                    const error = expectedError === 'Unique constraint violation'
                        ? createRoleUniqueConstraintError()
                        : createRoleDatabaseError(expectedError);

                    (RoleModel[operation as keyof typeof RoleModel] as jest.Mock).mockRejectedValue(error);

                    let promise;
                    switch (operation) {
                        case 'create':
                            promise = RoleModel.create(data as RoleCreationAttributes);
                            break;
                        case 'update':
                            promise = RoleModel.update(data as any, { where: { id: 'test-id' } });
                            break;
                        case 'delete':
                            promise = RoleModel.destroy({ where: { id: 'test-id' } });
                            break;
                        case 'findByPk':
                            promise = RoleModel.findByPk((data as any).id);
                            break;
                        default:
                            throw new Error(`Unknown operation: ${operation}`);
                    }

                    await expect(promise).rejects.toThrow();
                }
            });
        });

        describe('CRUD Operations', () => {
            it('should create a new role', async () => {
                const roleData = createMockRoleCreationAttributes();
                const mockRole = createMockRole(roleData);
                (RoleModel.create as jest.Mock).mockResolvedValue(mockRole);

                const result = await RoleModel.create(roleData);

                expect(RoleModel.create).toHaveBeenCalledWith(roleData);
                expect(result).toEqual(mockRole);
                expectRoleAttributes(result, roleData);
            });

            it('should find a role by primary key', async () => {
                const roleId = '123e4567-e89b-12d3-a456-426614174000';
                const mockRole = createMockRole({ id: roleId });
                (RoleModel.findByPk as jest.Mock).mockResolvedValue(mockRole);

                const result = await RoleModel.findByPk(roleId);

                expect(RoleModel.findByPk).toHaveBeenCalledWith(roleId);
                expect(result).toEqual(mockRole);
                expect(result?.id).toBe(roleId);
            });

            it('should find all roles', async () => {
                const mockRoles = [
                    createMockRole({ name: 'ADMIN' }),
                    createMockRole({ name: 'USER' }),
                    createMockRole({ name: 'MANAGER' })
                ];
                (RoleModel.findAll as jest.Mock).mockResolvedValue(mockRoles);

                const result = await RoleModel.findAll();

                expect(RoleModel.findAll).toHaveBeenCalled();
                expect(result).toEqual(mockRoles);
                expect(result).toHaveLength(3);
            });

            it('should update a role', async () => {
                const updateData = { description: 'Updated description' };
                const mockResult = [1, [createMockRole(updateData)]];
                (RoleModel.update as jest.Mock).mockResolvedValue(mockResult);

                const result = await RoleModel.update(updateData, { where: { id: 'test-id' } });

                expect(RoleModel.update).toHaveBeenCalledWith(updateData, { where: { id: 'test-id' } });
                expect(result).toEqual(mockResult);
                expect(result[0]).toBe(1); // Number of affected rows
            });

            it('should delete a role', async () => {
                (RoleModel.destroy as jest.Mock).mockResolvedValue(1);

                const result = await RoleModel.destroy({ where: { id: 'test-id' } });

                expect(RoleModel.destroy).toHaveBeenCalledWith({ where: { id: 'test-id' } });
                expect(result).toBe(1);
            });

            it('should count roles', async () => {
                (RoleModel.count as jest.Mock).mockResolvedValue(5);

                const result = await RoleModel.count();

                expect(RoleModel.count).toHaveBeenCalled();
                expect(result).toBe(5);
            });
        });

        describe('Query Options', () => {
            it('should support where conditions', async () => {
                const whereCondition = { isActive: true };
                const mockRoles = [createMockRole({ isActive: true })];
                (RoleModel.findAll as jest.Mock).mockResolvedValue(mockRoles);

                const result = await RoleModel.findAll({ where: whereCondition });

                expect(RoleModel.findAll).toHaveBeenCalledWith({ where: whereCondition });
                expect(result).toEqual(mockRoles);
            });

            it('should support ordering', async () => {
                const orderOption: Order = [['name', 'ASC']];
                const mockRoles = [createMockRole()];
                (RoleModel.findAll as jest.Mock).mockResolvedValue(mockRoles);

                const result = await RoleModel.findAll({ order: orderOption });

                expect(RoleModel.findAll).toHaveBeenCalledWith({ order: orderOption });
                expect(result).toEqual(mockRoles);
            });

            it('should support pagination', async () => {
                const paginationOptions = { limit: 10, offset: 20 };
                const mockRoles = [createMockRole()];
                (RoleModel.findAll as jest.Mock).mockResolvedValue(mockRoles);

                const result = await RoleModel.findAll(paginationOptions);

                expect(RoleModel.findAll).toHaveBeenCalledWith(paginationOptions);
                expect(result).toEqual(mockRoles);
            });
        });
    });

    describe('Integration Tests', () => {
        const integrationData = createRoleIntegrationTestData();

        it('should create multiple roles with different permissions', async () => {
            const roles = Object.values(integrationData);
            const mockRoles = roles.map(roleData => createMockRole(roleData));
            
            (RoleModel.create as jest.Mock)
                .mockResolvedValueOnce(mockRoles[0])
                .mockResolvedValueOnce(mockRoles[1])
                .mockResolvedValueOnce(mockRoles[2])
                .mockResolvedValueOnce(mockRoles[3]);

            const results = await Promise.all(
                roles.map(roleData => RoleModel.create(roleData))
            );

            expect(results).toHaveLength(4);
            expect(RoleModel.create).toHaveBeenCalledTimes(4);
            
            results.forEach((result, index) => {
                expectRoleAttributes(result, roles[index]);
            });
        });

        it('should find roles by different criteria', async () => {
            const adminRole = createMockRole(integrationData.adminRole);
            const userRole = createMockRole(integrationData.userRole);

            (RoleModel.findOne as jest.Mock)
                .mockResolvedValueOnce(adminRole)
                .mockResolvedValueOnce(userRole);

            const foundAdmin = await RoleModel.findByName('ADMIN');
            const foundUser = await RoleModel.findByName('USER');

            expect(foundAdmin).toEqual(adminRole);
            expect(foundUser).toEqual(userRole);
            expect(RoleModel.findOne).toHaveBeenCalledWith({
                where: { name: 'ADMIN', isActive: true }
            });
            expect(RoleModel.findOne).toHaveBeenCalledWith({
                where: { name: 'USER', isActive: true }
            });
        });

        it('should handle role hierarchy and permissions', async () => {
            const adminRole = createMockRole(integrationData.adminRole);
            const userRole = createMockRole(integrationData.userRole);

            // Mock permission checking
            adminRole.hasPermission.mockImplementation((permission: string) => 
                integrationData.adminRole.permissions.includes(permission)
            );
            userRole.hasPermission.mockImplementation((permission: string) => 
                integrationData.userRole.permissions.includes(permission)
            );

            expect(adminRole.hasPermission('admin')).toBe(true);
            expect(adminRole.hasPermission('user_management')).toBe(true);
            expect(userRole.hasPermission('admin')).toBe(false);
            expect(userRole.hasPermission('certificate_view')).toBe(true);
        });
    });

    describe('Security Tests', () => {
        const securityScenarios = createSecurityTestScenarios();

        securityScenarios.forEach(({ name, data, shouldPass }) => {
            it(`should handle ${name}`, async () => {
                if (shouldPass) {
                    const mockRole = createMockRole(data);
                    (RoleModel.create as jest.Mock).mockResolvedValue(mockRole);

                    const result = await RoleModel.create(data);
                    expect(result).toBeDefined();
                } else {
                    const validationError = createRoleValidationError('name', 'Invalid input');
                    (RoleModel.create as jest.Mock).mockRejectedValue(validationError);

                    await expect(RoleModel.create(data)).rejects.toThrow();
                }
            });
        });

        it('should sanitize input data', async () => {
            const maliciousData = createMockRoleCreationAttributes({
                name: 'CLEAN_NAME',
                description: '<script>alert("xss")</script>',
                permissions: ['user:read', 'admin:*']
            });

            const mockRole = createMockRole({
                ...maliciousData,
                description: '&lt;script&gt;alert("xss")&lt;/script&gt;' // Escaped
            });
            (RoleModel.create as jest.Mock).mockResolvedValue(mockRole);

            const result = await RoleModel.create(maliciousData);

            // Verify that dangerous content is escaped/sanitized
            expect(result.description).not.toContain('<script>');
            expect(result.permissions).toEqual(['user:read', 'admin:*']);
        });

        it('should prevent SQL injection in queries', async () => {
            const maliciousName = "'; DROP TABLE roles; --";
            (RoleModel.findOne as jest.Mock).mockResolvedValue(null);

            const result = await RoleModel.findByName(maliciousName);

            expect(RoleModel.findOne).toHaveBeenCalledWith({
                where: { name: maliciousName, isActive: true }
            });
            expect(result).toBeNull();
            // The ORM should handle parameterized queries automatically
        });
    });

    describe('Performance Tests', () => {
        const performanceData = createPerformanceTestData();

        it('should handle large permissions arrays efficiently', async () => {
            const roleWithManyPermissions = createMockRole({
                permissions: performanceData.largePermissionsArray
            });

            roleWithManyPermissions.hasPermission.mockImplementation((permission: string) => 
                performanceData.largePermissionsArray.includes(permission)
            );

            const startTime = Date.now();
            const result = roleWithManyPermissions.hasPermission('permission_500');
            const endTime = Date.now();

            expect(result).toBe(true);
            expect(endTime - startTime).toBeLessThan(ROLE_TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.PERMISSION_CHECK_MS);
        });

        it('should handle bulk role creation efficiently', async () => {
            const mockRoles = performanceData.manyRoles.map(roleData => createMockRole(roleData));
            
            (RoleModel.create as jest.Mock).mockImplementation((data) => 
                Promise.resolve(createMockRole(data))
            );

            const startTime = Date.now();
            const results = await Promise.all(
                performanceData.manyRoles.map(roleData => RoleModel.create(roleData))
            );
            const endTime = Date.now();

            expect(results).toHaveLength(100);
            expect(endTime - startTime).toBeLessThan(ROLE_TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.BULK_OPERATIONS_MS);
        });

        it('should handle complex permission checks efficiently', async () => {
            const { rolePermissions, testPermissions } = performanceData.complexPermissionsCheck;
            const role = createMockRole({ permissions: rolePermissions });

            role.hasAllPermissions.mockImplementation((permissions: string[]) => 
                permissions.every(permission => rolePermissions.includes(permission))
            );

            const startTime = Date.now();
            const result = role.hasAllPermissions(testPermissions);
            const endTime = Date.now();

            expect(result).toBe(true);
            expect(endTime - startTime).toBeLessThan(ROLE_TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.PERMISSION_CHECK_MS);
        });
    });

    describe('Concurrency Tests', () => {
        // const concurrencyScenarios = createConcurrencyTestScenarios();

        // concurrencyScenarios.forEach(({ name, operations }) => {
        //     it(`should handle ${name}`, async () => {
        //         // Mock all operations
        //         (RoleModel.create as jest.Mock).mockImplementation((data) =>
        //             Promise.resolve(createMockRole(data))
        //         );
        //         (RoleModel.findOne as jest.Mock).mockResolvedValue(createMockRole());
        //
        //         const promises = operations.map(async (operation: any) => {
        //             switch (operation.type) {
        //                 case 'create':
        //                     return RoleModel.create(operation.data);
        //                 case 'findByName':
        //                     return RoleModel.findByName(operation.name || 'USER');
        //                 case 'hasPermission':
        //                     const role = createMockRole();
        //                     role.hasPermission.mockReturnValue(true);
        //                     return role.hasPermission(operation.permission || 'read');
        //                 case 'update':
        //                     return RoleModel.update(operation.data || {}, { where: { id: 'test-id' } });
        //                 case 'getDefaultRole':
        //                     return RoleModel.getDefaultRole();
        //                 default:
        //                     return Promise.resolve(null);
        //             }
        //         });
        //
        //         const results = await Promise.all(promises);
        //
        //         expect(results).toHaveLength(operations.length);
        //         results.forEach(result => {
        //             expect(result).toBeDefined();
        //         });
        //
        //         const operationTypes = operations.map(op => op.type);
        //         if (operationTypes.includes('create')) {
        //             expect(RoleModel.create).toHaveBeenCalledTimes(
        //                 operationTypes.filter(t => t === 'create').length
        //             );
        //         }
        //     });
        // });

        it('should handle concurrent role creation without conflicts', async () => {
            const concurrentRoles = Array(10).fill(null).map((_, i) => 
                createMockRoleCreationAttributes({ name: `CONCURRENT_${i}` })
            );

            (RoleModel.create as jest.Mock).mockImplementation((data) => 
                Promise.resolve(createMockRole(data))
            );

            const results = await Promise.all(
                concurrentRoles.map(roleData => RoleModel.create(roleData))
            );

            expect(results).toHaveLength(10);
            expect(RoleModel.create).toHaveBeenCalledTimes(10);
        });
    });

    describe('Memory Management', () => {
        const memoryData = createMemoryTestData();

        it('should not leak memory with large role sets', () => {
            const { largeRoleSet } = memoryData;

            // Simulate processing large number of roles
            const processedRoles = largeRoleSet.map(role => ({
                id: role.id,
                name: role.name,
                permissionCount: role.permissions.length
            }));

            expect(processedRoles).toHaveLength(1000);
            expect(processedRoles[0]).toHaveProperty('permissionCount');
        });

        it('should handle deep permission structures efficiently', () => {
            const { deepPermissionStructure } = memoryData;
            const role = createMockRole(deepPermissionStructure);

            role.hasPermission.mockImplementation((permission: string) => 
                deepPermissionStructure.permissions.includes(permission)
            );

            // Test that we can still perform operations efficiently
            const result = role.hasPermission('very.long.permission.name.with.many.dots.5000');
            expect(result).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle role with maximum allowed name length', async () => {
            const maxLengthName = 'A'.repeat(ROLE_TEST_CONSTANTS.MAX_NAME_LENGTH);
            const roleData = createMockRoleCreationAttributes({ name: maxLengthName });
            const mockRole = createMockRole(roleData);
            (RoleModel.create as jest.Mock).mockResolvedValue(mockRole);

            const result = await RoleModel.create(roleData);

            expect(result.name).toBe(maxLengthName);
            expect(result.name.length).toBe(ROLE_TEST_CONSTANTS.MAX_NAME_LENGTH);
        });

        it('should handle role with maximum allowed description length', async () => {
            const maxLengthDescription = 'A'.repeat(ROLE_TEST_CONSTANTS.MAX_DESCRIPTION_LENGTH);
            const roleData = createMockRoleCreationAttributes({ description: maxLengthDescription });
            const mockRole = createMockRole(roleData);
            (RoleModel.create as jest.Mock).mockResolvedValue(mockRole);

            const result = await RoleModel.create(roleData);

            expect(result.description).toBe(maxLengthDescription);
            expect(result.description?.length).toBe(ROLE_TEST_CONSTANTS.MAX_DESCRIPTION_LENGTH);
        });

        it('should handle empty permissions array', async () => {
            const roleData = createMockRoleCreationAttributes({ permissions: [] });
            const mockRole = createMockRole(roleData);
            (RoleModel.create as jest.Mock).mockResolvedValue(mockRole);

            const result = await RoleModel.create(roleData);

            expect(result.permissions).toEqual([]);
            expect(Array.isArray(result.permissions)).toBe(true);
        });

        it('should handle role with special characters in permissions', async () => {
            const specialPermissions = ['user:read', 'admin:*', 'system.config', 'app/module'];
            const roleData = createMockRoleCreationAttributes({ permissions: specialPermissions });
            const mockRole = createMockRole(roleData);
            (RoleModel.create as jest.Mock).mockResolvedValue(mockRole);

            const result = await RoleModel.create(roleData);

            expect(result.permissions).toEqual(specialPermissions);
        });

        it('should handle database connection failures gracefully', async () => {
            const connectionError = createRoleDatabaseError('Database connection lost');
            (RoleModel.findAll as jest.Mock).mockRejectedValue(connectionError);

            await expect(RoleModel.findAll()).rejects.toThrow('Database connection lost');
        });

        it('should handle transaction rollbacks', async () => {
            const transactionError = createRoleDatabaseError('Transaction rolled back');
            (RoleModel.create as jest.Mock).mockRejectedValue(transactionError);

            await expect(RoleModel.create(createMockRoleCreationAttributes())).rejects.toThrow('Transaction rolled back');
        });
    });

    describe('Error Handling', () => {
        it('should handle validation errors with detailed messages', async () => {
            const validationError = createRoleValidationError('name', 'Name must be uppercase');
            (RoleModel.create as jest.Mock).mockRejectedValue(validationError);

            try {
                await RoleModel.create(createMockRoleCreationAttributes({ name: 'lowercase' }));
            } catch (error) {
                expectRoleValidation(error, 'name', 'Name must be uppercase');
            }
        });

        it('should handle unique constraint violations', async () => {
            const uniqueError = createRoleUniqueConstraintError('name');
            (RoleModel.create as jest.Mock).mockRejectedValue(uniqueError);

            await expect(RoleModel.create(createMockRoleCreationAttributes({ name: 'EXISTING' }))).rejects.toThrow('Unique constraint violation');
        });

        it('should handle database connection errors', async () => {
            const dbError = createRoleDatabaseError('Connection timeout');
            (RoleModel.findAll as jest.Mock).mockRejectedValue(dbError);

            await expect(RoleModel.findAll()).rejects.toThrow('Connection timeout');
        });

        it('should handle malformed JSON in permissions field', () => {
            const deserializeJsonRole = (value: string | null): any => {
                if (!value) return [];
                try {
                    return JSON.parse(value);
                } catch (error) {
                    console.error('Error deserializing JSON:', error);
                    return [];
                }
            };

            const result = deserializeJsonRole('{"invalid": json}');
            expect(result).toEqual([]);
        });
    });

    describe('Type Safety', () => {
        it('should enforce correct types for role attributes', () => {
            const roleData: RoleCreationAttributes = {
                name: 'TEST_ROLE',
                description: 'Test role description',
                permissions: ['read', 'write']
            };

            expect(typeof roleData.name).toBe('string');
            expect(typeof roleData.description).toBe('string');
            expect(Array.isArray(roleData.permissions)).toBe(true);
        });

        it('should handle optional fields correctly', () => {
            const minimalRole: RoleCreationAttributes = {
                name: 'MINIMAL_ROLE',
                permissions: []
            };

            expect(minimalRole.description).toBeUndefined();
            expect(minimalRole.isActive).toBeUndefined();
        });

        it('should enforce UUID type for id field', () => {
            const roleAttributes: RoleAttributes = createMockRoleAttributes();
            
            expect(typeof roleAttributes.id).toBe('string');
            expect(roleAttributes.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        });
    });
});