import {RoleAttributes, RoleCreationAttributes, RoleModel} from '@models/role.model';
import {Sequelize} from 'sequelize';

/**
 * Test utilities for RoleModel
 */

// Mock data factories
export const createMockRoleAttributes = (overrides: Partial<RoleAttributes> = {}): RoleAttributes => ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'USER',
    description: 'Standard user role',
    permissions: ['read', 'write'],
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides
});

export const createMockRoleCreationAttributes = (overrides: Partial<RoleCreationAttributes> = {}): RoleCreationAttributes => ({
    name: 'USER',
    description: 'Standard user role',
    permissions: ['read', 'write'],
    ...overrides
});

export const createMockRole = (overrides: Partial<RoleAttributes> = {}): jest.Mocked<RoleModel> => {
    const roleData = createMockRoleAttributes(overrides);
    
    return {
        ...roleData,
        // Instance methods
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),

        // Sequelize model methods
        save: jest.fn().mockResolvedValue(roleData),
        update: jest.fn().mockResolvedValue([1, [roleData]]),
        destroy: jest.fn().mockResolvedValue(undefined),
        reload: jest.fn().mockResolvedValue(roleData),
        toJSON: jest.fn().mockReturnValue(roleData),
        get: jest.fn((key: string) => (roleData as any)[key]),
        set: jest.fn(),
        setDataValue: jest.fn(),
        getDataValue: jest.fn(),
        previous: jest.fn(),
        changed: jest.fn(),
        increment: jest.fn(),
        decrement: jest.fn(),

        // Additional properties
        _attributes: {},
        dataValues: roleData,
        _creationAttributes: {},
        isNewRecord: false
    } as unknown as jest.Mocked<RoleModel>;
};

// Mock Sequelize instance
export const createMockSequelize = (): jest.Mocked<Sequelize> => ({
    define: jest.fn(),
    authenticate: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    sync: jest.fn().mockResolvedValue(undefined),
    transaction: jest.fn().mockImplementation((callback) => callback()),
    query: jest.fn(),
    getDialect: jest.fn().mockReturnValue('mssql'),
    getDatabaseVersion: jest.fn().mockResolvedValue('15.0.0'),
    validate: jest.fn().mockResolvedValue(undefined),
    drop: jest.fn().mockResolvedValue(undefined),
    truncate: jest.fn().mockResolvedValue(undefined),

    // Add other required properties
    models: {},
    options: {},
    config: {},
    dialect: {} as any,
    queryInterface: {} as any,
    connectionManager: {} as any,
    importCache: {},
    modelManager: {} as any,

    // Event emitter methods
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    setMaxListeners: jest.fn(),
    getMaxListeners: jest.fn(),
    listeners: jest.fn(),
    rawListeners: jest.fn(),
    listenerCount: jest.fn(),
    prependListener: jest.fn(),
    prependOnceListener: jest.fn(),
    eventNames: jest.fn()
} as unknown as jest.Mocked<Sequelize>);

// Test data constants
export const ROLE_TEST_DATA = {
    VALID_ROLE_NAMES: ['USER', 'ADMIN', 'MANAGER', 'VIEWER', 'EDITOR'],
    INVALID_ROLE_NAMES: ['user', 'admin', 'a', '', 'A'.repeat(51)],
    VALID_PERMISSIONS: [
        ['read'],
        ['read', 'write'],
        ['read', 'write', 'delete'],
        ['admin', 'user_management', 'system_config'],
        ['certificate_view', 'certificate_create', 'certificate_download']
    ],
    INVALID_PERMISSIONS: [
        'not_an_array',
        null,
        undefined,
        123,
        {},
        [''],
        ['permission with spaces'],
        ['permission-with-special-chars!@#']
    ],
    VALID_DESCRIPTIONS: [
        'Standard user role',
        'Administrator with full access',
        'Manager with limited admin rights',
        null,
        undefined,
        ''
    ],
    INVALID_DESCRIPTIONS: [
        'A'.repeat(256), // Too long
        123,
        {},
        []
    ]
};

// Permission test scenarios
export const createPermissionTestScenarios = () => [
    {
        name: 'Single permission check - exists',
        rolePermissions: ['read', 'write', 'delete'],
        testPermission: 'read',
        expectedResult: true
    },
    {
        name: 'Single permission check - does not exist',
        rolePermissions: ['read', 'write'],
        testPermission: 'delete',
        expectedResult: false
    },
    {
        name: 'Empty permissions array',
        rolePermissions: [],
        testPermission: 'read',
        expectedResult: false
    },
    {
        name: 'Case sensitive permission check',
        rolePermissions: ['READ', 'WRITE'],
        testPermission: 'read',
        expectedResult: false
    },
    {
        name: 'Special characters in permission',
        rolePermissions: ['user:read', 'user:write', 'admin:*'],
        testPermission: 'user:read',
        expectedResult: true
    }
];

export const createAnyPermissionTestScenarios = () => [
    {
        name: 'Has one of multiple permissions',
        rolePermissions: ['read', 'write'],
        testPermissions: ['read', 'delete', 'admin'],
        expectedResult: true
    },
    {
        name: 'Has none of the permissions',
        rolePermissions: ['read', 'write'],
        testPermissions: ['delete', 'admin'],
        expectedResult: false
    },
    {
        name: 'Empty test permissions array',
        rolePermissions: ['read', 'write'],
        testPermissions: [],
        expectedResult: false
    },
    {
        name: 'Empty role permissions',
        rolePermissions: [],
        testPermissions: ['read', 'write'],
        expectedResult: false
    },
    {
        name: 'Has all tested permissions',
        rolePermissions: ['read', 'write', 'delete', 'admin'],
        testPermissions: ['read', 'write'],
        expectedResult: true
    }
];

export const createAllPermissionsTestScenarios = () => [
    {
        name: 'Has all required permissions',
        rolePermissions: ['read', 'write', 'delete', 'admin'],
        testPermissions: ['read', 'write'],
        expectedResult: true
    },
    {
        name: 'Missing one permission',
        rolePermissions: ['read', 'write'],
        testPermissions: ['read', 'write', 'delete'],
        expectedResult: false
    },
    {
        name: 'Empty test permissions array',
        rolePermissions: ['read', 'write'],
        testPermissions: [],
        expectedResult: true
    },
    {
        name: 'Empty role permissions',
        rolePermissions: [],
        testPermissions: ['read'],
        expectedResult: false
    },
    {
        name: 'Exact match',
        rolePermissions: ['read', 'write'],
        testPermissions: ['read', 'write'],
        expectedResult: true
    }
];

// Validation test cases
export const createValidationTestCases = () => [
    {
        name: 'Valid role creation',
        data: createMockRoleCreationAttributes(),
        shouldPass: true
    },
    {
        name: 'Name too short',
        data: createMockRoleCreationAttributes({ name: 'A' }),
        shouldPass: false,
        expectedError: 'Validation len on name failed'
    },
    {
        name: 'Name too long',
        data: createMockRoleCreationAttributes({ name: 'A'.repeat(51) }),
        shouldPass: false,
        expectedError: 'Validation len on name failed'
    },
    {
        name: 'Name not uppercase',
        data: createMockRoleCreationAttributes({ name: 'user' }),
        shouldPass: false,
        expectedError: 'Validation isUppercase on name failed'
    },
    {
        name: 'Empty name',
        data: createMockRoleCreationAttributes({ name: '' }),
        shouldPass: false,
        expectedError: 'Validation notEmpty on name failed'
    },
    {
        name: 'Description too long',
        data: createMockRoleCreationAttributes({ description: 'A'.repeat(256) }),
        shouldPass: false,
        expectedError: 'Validation error'
    },
    {
        name: 'Invalid permissions type',
        data: { ...createMockRoleCreationAttributes(), permissions: 'not_an_array' as any },
        shouldPass: false,
        expectedError: 'Permissions must be an array'
    },
    {
        name: 'Null permissions',
        data: { ...createMockRoleCreationAttributes(), permissions: null as any },
        shouldPass: false,
        expectedError: 'Permissions must be an array'
    }
];

// Static method test scenarios
export const createFindByNameTestScenarios = () => [
    {
        name: 'Find existing active role',
        searchName: 'USER',
        mockResult: createMockRole({ name: 'USER', isActive: true }),
        expectedResult: 'found'
    },
    {
        name: 'Find non-existent role',
        searchName: 'NONEXISTENT',
        mockResult: null,
        expectedResult: 'not_found'
    },
    {
        name: 'Find inactive role',
        searchName: 'INACTIVE',
        mockResult: null, // Should not find inactive roles
        expectedResult: 'not_found'
    },
    {
        name: 'Case sensitive search',
        searchName: 'user',
        mockResult: null, // Should not find due to case sensitivity
        expectedResult: 'not_found'
    },
    {
        name: 'Empty name search',
        searchName: '',
        mockResult: null,
        expectedResult: 'not_found'
    }
];

export const createGetDefaultRoleTestScenarios = () => [
    {
        name: 'Default role exists and is active',
        mockResult: createMockRole({ name: 'USER', isActive: true }),
        expectedResult: 'found'
    },
    {
        name: 'Default role does not exist',
        mockResult: null,
        expectedResult: 'not_found'
    },
    {
        name: 'Default role exists but is inactive',
        mockResult: null, // Should not find inactive default role
        expectedResult: 'not_found'
    }
];

// JSON serialization/deserialization test data
export const createJsonTestData = () => [
    {
        name: 'Valid JSON array',
        input: ['read', 'write', 'delete'],
        expectedSerialized: '["read","write","delete"]',
        expectedDeserialized: ['read', 'write', 'delete']
    },
    {
        name: 'Empty array',
        input: [],
        expectedSerialized: '[]',
        expectedDeserialized: []
    },
    {
        name: 'Single permission',
        input: ['admin'],
        expectedSerialized: '["admin"]',
        expectedDeserialized: ['admin']
    },
    {
        name: 'Complex permissions',
        input: ['user:read', 'user:write', 'admin:*', 'system:config'],
        expectedSerialized: '["user:read","user:write","admin:*","system:config"]',
        expectedDeserialized: ['user:read', 'user:write', 'admin:*', 'system:config']
    },
    {
        name: 'Null input',
        input: null,
        expectedSerialized: null,
        expectedDeserialized: []
    },
    {
        name: 'Undefined input',
        input: undefined,
        expectedSerialized: null,
        expectedDeserialized: []
    }
];

export const createInvalidJsonTestData = () => [
    {
        name: 'Invalid JSON string',
        input: '{"invalid": json}',
        expectedDeserialized: []
    },
    {
        name: 'Empty string',
        input: '',
        expectedDeserialized: []
    },
    {
        name: 'Non-JSON string',
        input: 'not json at all',
        expectedDeserialized: []
    },
    {
        name: 'Null string',
        input: null,
        expectedDeserialized: []
    }
];

// Hook test scenarios
export const createHookTestScenarios = () => [
    {
        name: 'beforeCreate with undefined isActive',
        roleData: { name: 'TEST', permissions: ['read'] },
        expectedIsActive: true,
        expectedPermissions: ['read']
    },
    {
        name: 'beforeCreate with undefined permissions',
        roleData: { name: 'TEST', isActive: true },
        expectedIsActive: true,
        expectedPermissions: []
    },
    {
        name: 'beforeCreate with both undefined',
        roleData: { name: 'TEST' },
        expectedIsActive: true,
        expectedPermissions: []
    },
    {
        name: 'beforeCreate with defined values',
        roleData: { name: 'TEST', isActive: false, permissions: ['admin'] },
        expectedIsActive: false,
        expectedPermissions: ['admin']
    }
];

// Database operation test scenarios
export const createDatabaseOperationScenarios = () => [
    {
        name: 'Successful role creation',
        operation: 'create',
        data: createMockRoleCreationAttributes(),
        shouldSucceed: true
    },
    {
        name: 'Duplicate role name creation',
        operation: 'create',
        data: createMockRoleCreationAttributes({ name: 'EXISTING_ROLE' }),
        shouldSucceed: false,
        expectedError: 'Unique constraint violation'
    },
    {
        name: 'Role update',
        operation: 'update',
        data: { description: 'Updated description' },
        shouldSucceed: true
    },
    {
        name: 'Role deletion',
        operation: 'delete',
        data: {},
        shouldSucceed: true
    },
    {
        name: 'Find role by primary key',
        operation: 'findByPk',
        data: { id: '123e4567-e89b-12d3-a456-426614174000' },
        shouldSucceed: true
    }
];

// Performance test data
export const createPerformanceTestData = () => ({
    largePermissionsArray: Array(1000).fill(null).map((_, i) => `permission_${i}`),
    manyRoles: Array(100).fill(null).map((_, i) => createMockRoleCreationAttributes({
        name: `ROLE_${i}`,
        permissions: [`permission_${i}`, `permission_${i + 1}`]
    })),
    complexPermissionsCheck: {
        rolePermissions: Array(500).fill(null).map((_, i) => `permission_${i}`),
        testPermissions: Array(250).fill(null).map((_, i) => `permission_${i * 2}`)
    }
});

// Error factories
export const createRoleValidationError = (field: string, message: string) => {
    const error = new Error(message);
    error.name = 'SequelizeValidationError';
    (error as any).errors = [{
        path: field,
        message,
        type: 'Validation error',
        value: null
    }];
    return error;
};

export const createRoleUniqueConstraintError = (field: string = 'name') => {
    const error = new Error('Unique constraint violation');
    error.name = 'SequelizeUniqueConstraintError';
    (error as any).fields = [field];
    (error as any).parent = {
        code: '23000',
        sqlState: '23000'
    };
    return error;
};

export const createRoleDatabaseError = (message: string = 'Database connection error') => {
    const error = new Error(message);
    error.name = 'SequelizeDatabaseError';
    (error as any).parent = {
        code: 'ECONNREFUSED',
        errno: -4078
    };
    return error;
};

// Assertion helpers
export const expectRoleAttributes = (role: any, expectedAttributes: Partial<RoleAttributes>) => {
    Object.keys(expectedAttributes).forEach(key => {
        expect(role[key]).toEqual(expectedAttributes[key as keyof RoleAttributes]);
    });
};

export const expectRolePermissions = (role: any, expectedPermissions: string[]) => {
    expect(Array.isArray(role.permissions)).toBe(true);
    expect(role.permissions).toEqual(expectedPermissions);
};

export const expectRoleValidation = (error: any, field: string, message?: string) => {
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('SequelizeValidationError');
    if (message) {
        expect(error.message).toContain(message);
    }
    if (error.errors) {
        expect(error.errors.some((e: any) => e.path === field)).toBe(true);
    }
};

export const expectSequelizeCall = (mockModel: any, method: string, ...args: any[]) => {
    expect(mockModel[method]).toHaveBeenCalledWith(...args);
};

// Test environment setup
export const setupRoleTestEnvironment = () => {
    // Mock console methods to reduce noise
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Set test environment variables
    process.env.NODE_ENV = 'test';
};

export const cleanupRoleTestEnvironment = () => {
    jest.restoreAllMocks();
    delete process.env.NODE_ENV;
};

// Mock model factory
export const createMockRoleModel = () => {
    return {
        // Static methods
        findOne: jest.fn(),
        findByPk: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
        count: jest.fn(),
        findByName: jest.fn(),
        getDefaultRole: jest.fn(),

        // Model initialization
        init: jest.fn(),

        // Sequelize properties
        sequelize: createMockSequelize(),
        tableName: 'roles',
        modelName: 'Role',

        // Constructor
        build: jest.fn(),

        // Associations
        associate: jest.fn(),
        hasMany: jest.fn(),
        belongsTo: jest.fn(),
        belongsToMany: jest.fn(),

        // Hooks
        addHook: jest.fn(),
        beforeCreate: jest.fn(),
        afterCreate: jest.fn(),
        beforeUpdate: jest.fn(),
        afterUpdate: jest.fn(),
        beforeDestroy: jest.fn(),
        afterDestroy: jest.fn()
    };
};

// Integration test helpers
export const createRoleIntegrationTestData = () => ({
    adminRole: createMockRoleCreationAttributes({
        name: 'ADMIN',
        description: 'Administrator with full system access',
        permissions: ['admin', 'user_management', 'system_config', 'certificate_management']
    }),
    managerRole: createMockRoleCreationAttributes({
        name: 'MANAGER',
        description: 'Manager with limited administrative rights',
        permissions: ['user_view', 'certificate_view', 'certificate_create', 'reports_view']
    }),
    userRole: createMockRoleCreationAttributes({
        name: 'USER',
        description: 'Standard user with basic access',
        permissions: ['certificate_view', 'profile_edit']
    }),
    viewerRole: createMockRoleCreationAttributes({
        name: 'VIEWER',
        description: 'Read-only access',
        permissions: ['certificate_view']
    })
});

// Security test scenarios
export const createSecurityTestScenarios = () => [
    {
        name: 'SQL injection in role name',
        data: createMockRoleCreationAttributes({
            name: "'; DROP TABLE roles; --" as any
        }),
        shouldPass: false
    },
    {
        name: 'XSS in description',
        data: createMockRoleCreationAttributes({
            description: '<script>alert("xss")</script>'
        }),
        shouldPass: true // Should be escaped/sanitized
    },
    {
        name: 'Very long permission names',
        data: createMockRoleCreationAttributes({
            permissions: ['A'.repeat(1000)]
        }),
        shouldPass: true // Should handle long strings
    },
    {
        name: 'Special characters in permissions',
        data: createMockRoleCreationAttributes({
            permissions: ['user:read', 'admin:*', 'system.config', 'app/module']
        }),
        shouldPass: true
    }
];

// Concurrency test helpers
export const createConcurrencyTestScenarios = () => [
    {
        name: 'Concurrent role creation',
        operations: Array(10).fill(null).map((_, i) => ({
            type: 'create',
            data: createMockRoleCreationAttributes({ name: `CONCURRENT_ROLE_${i}` })
        }))
    },
    {
        name: 'Concurrent permission checks',
        operations: Array(50).fill(null).map(() => ({
            type: 'hasPermission',
            permission: 'read'
        }))
    },
    {
        name: 'Mixed concurrent operations',
        operations: [
            { type: 'create', data: createMockRoleCreationAttributes({ name: 'TEST_1' }) },
            { type: 'findByName', name: 'USER' },
            { type: 'hasPermission', permission: 'admin' },
            { type: 'update', data: { description: 'Updated' } },
            { type: 'getDefaultRole' }
        ]
    }
];

// Memory test helpers
export const createMemoryTestData = () => ({
    largeRoleSet: Array(1000).fill(null).map((_, i) => createMockRole({
        id: `role-${i}`,
        name: `ROLE_${i}`,
        permissions: Array(100).fill(null).map((_, j) => `permission_${i}_${j}`)
    })),
    deepPermissionStructure: {
        permissions: Array(10000).fill(null).map((_, i) => `very.long.permission.name.with.many.dots.${i}`)
    }
});

// Test constants
export const ROLE_TEST_CONSTANTS = {
    DEFAULT_ROLE_NAME: 'USER',
    MAX_NAME_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 255,
    MIN_NAME_LENGTH: 2,
    VALID_NAME_PATTERN: /^[A-Z_]+$/,
    PERFORMANCE_THRESHOLDS: {
        PERMISSION_CHECK_MS: 10,
        ROLE_CREATION_MS: 100,
        BULK_OPERATIONS_MS: 1000
    }
};

export default {
    createMockRoleAttributes,
    createMockRoleCreationAttributes,
    createMockRole,
    createMockSequelize,
    createMockRoleModel,
    ROLE_TEST_DATA,
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
    expectRolePermissions,
    expectRoleValidation,
    expectSequelizeCall,
    setupRoleTestEnvironment,
    cleanupRoleTestEnvironment,
    createRoleIntegrationTestData,
    createSecurityTestScenarios,
    createConcurrencyTestScenarios,
    createMemoryTestData,
    ROLE_TEST_CONSTANTS
};