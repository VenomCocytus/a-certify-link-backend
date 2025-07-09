import {AuthTokens, UserProfile} from "@interfaces/common.interfaces";
import {AuthenticatedRequest} from "@interfaces/middleware.interfaces";

/**
 * Factory function to create mock user data
 */
export const createMockUser = (overrides: Partial<any> = {}) =>
    createMockSequelizeModel({
        id: '123e4567-e89b-12d3-a456-426614174001',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        phoneNumber: '+1234567890',
        roleId: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
        isEmailVerified: true,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        isAccountLocked: false,
        // Authentication-specific methods
        validatePassword: jest.fn().mockResolvedValue(true),
        incrementLoginAttempts: jest.fn().mockResolvedValue(undefined),
        resetLoginAttempts: jest.fn().mockResolvedValue(undefined),
        generatePasswordResetToken: jest.fn().mockResolvedValue('reset-token'),
        updatePassword: jest.fn().mockResolvedValue(undefined),
        canChangePassword: jest.fn().mockResolvedValue(true),
        ...overrides
    });



/**
 * Factory function to create mock role data
 */
export const createMockRole = (overrides: Partial<any> = {}) =>
    createMockSequelizeModel({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'USER',
        permissions: ['read', 'write'],
        ...overrides
    });

/**
 * Factory function to create mock auth tokens
 */
export const createMockTokens = (overrides: Partial<AuthTokens> = {}): AuthTokens => ({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 900,
    tokenType: 'Bearer',
    ...overrides
});

/**
 * Factory function to create a mock user profile
 */
export const createMockUserProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    phoneNumber: '+1234567890',
    role: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'USER',
        permissions: ['read', 'write']
    },
    isActive: true,
    isEmailVerified: true,
    twoFactorEnabled: false,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    ...overrides
});

/**
 * Mock Express Request factory
 */
export const createMockRequest = (overrides: Partial<any> = {}) => ({
    body: {},
    params: {},
    query: {},
    cookies: {},
    headers: {},
    originalUrl: '/auth/test',
    method: 'GET',
    url: '/auth/test',
    ...overrides
});

/**
 * Mock Express Response factory
 */
export const createMockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.getHeader = jest.fn().mockReturnValue(undefined);
    return res;
};

/**
 * Mock Authenticated Request factory
 */
export const createMockAuthenticatedRequest = (overrides: Partial<any> = {}) => ({
    ...createMockRequest(),
    user: {
        id: '123e4567-e89b-12d3-a456-426614174001',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roleId: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
        isEmailVerified: true,
        twoFactorEnabled: false
    },
    ...overrides
} as AuthenticatedRequest);

/**
 * Test data constants
 */
export const TEST_DATA = {
    VALID_EMAIL: 'test@example.com',
    VALID_PASSWORD: 'Password123!',
    INVALID_EMAIL: 'invalid-email',
    INVALID_PASSWORD: '123',
    VALID_UUID: '123e4567-e89b-12d3-a456-426614174001',
    INVALID_UUID: 'invalid-uuid',
    VALID_PHONE: '+1234567890',
    INVALID_PHONE: '123',
    TWO_FACTOR_CODE: '123456',
    INVALID_TWO_FACTOR_CODE: '000000',
    VALID_FIRST_NAME: 'John',
    VALID_LAST_NAME: 'Doe',
    VALID_ROLE_ID: '123e4567-e89b-12d3-a456-426614174000'
};

/**
 * Environment setup helper
 */
export const setupTestEnvironment = () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.APP_NAME = 'Test App';
    process.env.NODE_ENV = 'test';
};

/**
 * Clean up environment helper
 */
export const cleanupTestEnvironment = () => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    delete process.env.APP_NAME;
    delete process.env.NODE_ENV;
};

/**
 * Mock crypto hash function
 */
export const createMockCryptoHash = (returnValue: string = 'mock-hash') => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue(returnValue),
    copy: jest.fn().mockReturnThis(),
    _transform: jest.fn(),
    _flush: jest.fn(),
    allowHalfOpen: false,
    readable: true,
    writable: true,
    destroyed: false,
    // Add other required Hash properties as needed
    pipe: jest.fn(),
    unpipe: jest.fn(),
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
} as any); // Use 'as any' to bypass remaining type requirements

export const createValidForgotPasswordDto = (overrides: Partial<any> = {}) => ({
    email: TEST_DATA.VALID_EMAIL,
    ...overrides
});

export const createValidResetPasswordDto = (overrides: Partial<any> = {}) => ({
    token: 'valid-reset-token',
    newPassword: TEST_DATA.VALID_PASSWORD,
    confirmPassword: TEST_DATA.VALID_PASSWORD,
    ...overrides
});

export const createValidVerifyEmailDto = (overrides: Partial<any> = {}) => ({
    token: 'valid-verify-token',
    userId: TEST_DATA.VALID_UUID,
    ...overrides
});

export const createValidTwoFactorDto = (overrides: Partial<any> = {}) => ({
    code: TEST_DATA.TWO_FACTOR_CODE,
    ...overrides
});

export const createValidTwoFactorDisableDto = (overrides: Partial<any> = {}) => ({
    password: TEST_DATA.VALID_PASSWORD,
    code: TEST_DATA.TWO_FACTOR_CODE,
    ...overrides
});

export const createValidUpdateProfileDto = (overrides: Partial<any> = {}) => ({
    firstName: 'UpdatedFirst',
    lastName: 'UpdatedLast',
    phoneNumber: '+1987654321',
    ...overrides
});

export const createValidCreateUserDto = (overrides: Partial<any> = {}) => ({
    email: 'newuser@example.com',
    firstName: 'New',
    lastName: 'User',
    phoneNumber: TEST_DATA.VALID_PHONE,
    roleId: TEST_DATA.VALID_ROLE_ID,
    isActive: true,
    ...overrides
});

/**
 * Mock database connection helper
 */
export const createMockDatabaseConnection = () => ({
    authenticate: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    sync: jest.fn().mockResolvedValue(undefined),
    transaction: jest.fn().mockImplementation((callback) => callback())
});

/**
 * Mock external service response
 */
export const createMockExternalServiceResponse = (data: any, status: number = 200) => ({
    status,
    data,
    headers: {},
    statusText: status === 200 ? 'OK' : 'Error'
});

/**
 * Validation error factory
 */
export const createValidationError = (field: string, message: string) => {
    const error = new Error(message);
    error.name = 'ValidationException';
    (error as any).field = field;
    return error;
};

/**
 * Base exception factory
 */
export const createBaseException = (message: string, statusCode: number = 500) => {
    const error = new Error(message);
    error.name = 'BaseException';
    (error as any).statusCode = statusCode;
    return error;
};

/**
 * Mock HTTP client
 */
export const createMockHttpClient = () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    request: jest.fn()
});

/**
 * Test data generation helpers
 */
export const generateRandomString = (length: number = 10): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const generateRandomEmail = (domain: string = 'example.com'): string => {
    return `${generateRandomString(8)}@${domain}`;
};

export const generateRandomUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Test assertion helpers
 */
export const expectHttpStatus = (response: any, expectedStatus: number) => {
    expect(response.status).toHaveBeenCalledWith(expectedStatus);
};

export const expectJsonResponse = (response: any, expectedData: any) => {
    expect(response.json).toHaveBeenCalledWith(expectedData);
};

export const expectCookieSet = (response: any, name: string, value: string, options?: any) => {
    if (options) {
        expect(response.cookie).toHaveBeenCalledWith(name, value, options);
    } else {
        expect(response.cookie).toHaveBeenCalledWith(name, value, expect.any(Object));
    }
};

export const expectCookieCleared = (response: any, name: string) => {
    expect(response.clearCookie).toHaveBeenCalledWith(name);
};

/**
 * Mock middleware helpers
 */
export const createMockMiddleware = () => jest.fn((req, res, next) => next());

export const createMockAuthMiddleware = (user?: any) =>
    jest.fn((req, res, next) => {
        if (user) {
            req.user = user;
        }
        next();
    });

export const createMockValidationMiddleware = (shouldFail: boolean = false) =>
    jest.fn((req, res, next) => {
        if (shouldFail) {
            const error = createValidationError('email', 'Invalid email format');
            next(error);
        } else {
            next();
        }
    });

/**
 * Test file helpers
 */
export const createMockFile = (name: string = 'test.txt', content: string = 'test content') => ({
    originalname: name,
    mimetype: 'text/plain',
    size: content.length,
    buffer: Buffer.from(content),
    fieldname: 'file',
    encoding: '7bit'
});

/**
 * Performance testing helpers
 */
export const measureExecutionTime = async (fn: () => Promise<any>): Promise<{ result: any; duration: number }> => {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
};

export const expectExecutionTime = async (fn: () => Promise<any>, maxTime: number) => {
    const { duration } = await measureExecutionTime(fn);
    expect(duration).toBeLessThan(maxTime);
};

/**
 * Mock JWT implementation
 */
export const createMockJWT = () => ({
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn().mockReturnValue({ userId: TEST_DATA.VALID_UUID, type: 'access' }),
    decode: jest.fn().mockReturnValue({ userId: TEST_DATA.VALID_UUID })
});

/**
 * Mock Speakeasy implementation
 */
export const createMockSpeakeasy = () => ({
    generateSecret: jest.fn().mockReturnValue({
        base32: 'JBSWY3DPEHPK3PXP',
        otpauth_url: 'otpauth://totp/TestApp%20%28test%40example.com%29?secret=JBSWY3DPEHPK3PXP&issuer=TestApp'
    }),
    totp: {
        verify: jest.fn().mockReturnValue(true)
    }
});

/**
 * Mock QRCode implementation
 */
export const createMockQRCode = () => ({
    toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mock-qr')
});

/**
 * Database operation mocks
 */
export const createMockSequelizeModel = <T>(data: T): T & any => ({
    ...data,
    _attributes: {},
    dataValues: { ...data },
    _creationAttributes: {},
    isNewRecord: false,
    get: jest.fn((key: string) => (data as any)[key]),
    set: jest.fn(),
    save: jest.fn().mockResolvedValue(data),
    destroy: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(data),
    reload: jest.fn().mockResolvedValue(data),
    toJSON: jest.fn().mockReturnValue(data),
    previous: jest.fn(),
    changed: jest.fn(),
    setDataValue: jest.fn(),
    getDataValue: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn()
});

/**
 * Error assertion helpers
 */
export const expectValidationError = (error: any, message?: string) => {
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ValidationException');
    if (message) {
        expect(error.message).toContain(message);
    }
};

export const expectBaseError = (error: any, statusCode?: number, message?: string) => {
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('BaseException');
    if (statusCode) {
        expect(error.statusCode).toBe(statusCode);
    }
    if (message) {
        expect(error.message).toContain(message);
    }
};

/**
 * Async test helper
 */
export const runAsyncTest = async (testFn: () => Promise<void>) => {
    try {
        await testFn();
    } catch (error) {
        throw error;
    }
};

/**
 * Mock service response helper
 */
export const createServiceResponse = <T>(data: T, success: boolean = true) => ({
    success,
    data,
    message: success ? 'Operation successful' : 'Operation failed',
    timestamp: new Date().toISOString()
});

/**
 * Date helpers for testing
 */
export const createTestDate = (daysFromNow: number = 0): Date => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
};

export const createExpiredDate = (): Date => createTestDate(-1);
export const createFutureDate = (): Date => createTestDate(1);

/**
 * Validation helpers
 */
export const createValidLoginDto = (overrides: Partial<any> = {}) => ({
    email: TEST_DATA.VALID_EMAIL,
    password: TEST_DATA.VALID_PASSWORD,
    rememberMe: false,
    ...overrides
});

export const createValidRegisterDto = (overrides: Partial<any> = {}) => ({
    email: TEST_DATA.VALID_EMAIL,
    firstName: 'John',
    lastName: 'Doe',
    password: TEST_DATA.VALID_PASSWORD,
    confirmPassword: TEST_DATA.VALID_PASSWORD,
    phoneNumber: TEST_DATA.VALID_PHONE,
    ...overrides
});

export const createValidChangePasswordDto = (overrides: Partial<any> = {}) => ({
    currentPassword: 'oldPassword',
    newPassword: TEST_DATA.VALID_PASSWORD,
    confirmPassword: TEST_DATA.VALID_PASSWORD,
    ...overrides
});

/**
 * Test timeout helper
 */
export const setTestTimeout = (ms: number = 10000) => {
    jest.setTimeout(ms);
};

/**
 * Spy helper for console methods
 */
export const spyOnConsole = () => ({
    log: jest.spyOn(console, 'log').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    info: jest.spyOn(console, 'info').mockImplementation()
});

/**
 * Restore all mocks helper
 */
export const restoreAllMocks = () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
};