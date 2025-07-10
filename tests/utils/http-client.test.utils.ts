import { jest } from '@jest/globals';
import {AxiosResponse, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosHeaders} from 'axios';

/**
 * Creates a mock Axios response
 */
export function createMockAxiosResponse<T>(
    data: T,
    status: number = 200,
    statusText: string = 'OK',
    config?: Partial<AxiosRequestConfig>
): AxiosResponse<T> {
    return {
        data,
        status,
        statusText,
        headers: {},
        config: {
            method: 'get',
            url: '/test',
            ...config,
        } as InternalAxiosRequestConfig,
    };
}

/**
 * Creates a mock Axios error
 */
export function createMockAxiosError(
    message: string,
    code?: string,
    status?: number,
    response?: Partial<AxiosResponse>
): AxiosError {
    // Provide a config with headers as required by InternalAxiosRequestConfig
    const config: InternalAxiosRequestConfig = {
        method: 'get',
        url: '/test',
        headers: AxiosHeaders.from({ 'Content-Type': 'application/json' }),
    } as InternalAxiosRequestConfig;

    const error = new AxiosError(
        message,
        code,
        config,
        {},
        response as AxiosResponse
    );

    if (response) {
        error.response = {
            data: response.data || { message: 'Error occurred' },
            status: status || 500,
            statusText: response.statusText || 'Internal Server Error',
            headers: response.headers || {},
            config, // use the same config object
        };
    }

    return error;
}

/**
 * Creates a mock network error (no response)
 */
export function createMockNetworkError(message: string = 'Network Error'): AxiosError {
    const config: InternalAxiosRequestConfig = {
        method: 'get',
        url: '/test',
        headers: {},
    } as InternalAxiosRequestConfig;

    const error = new AxiosError(
        message,
        'NETWORK_ERROR',
        config,
        {
            code: 'ECONNREFUSED',
        }
    );

    // No response for network errors
    error.response = undefined;
    error.request = {
        responseURL: '/test',
    };

    return error;
}

/**
 * Mock Axios instance factory
 */
export function createMockAxiosInstance() {
    const mockAxios = {
        create: jest.fn(),
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn(),
        head: jest.fn(),
        options: jest.fn(),
        request: jest.fn(),
        defaults: {
            headers: {
                common: {},
                get: {},
                post: {},
                put: {},
                delete: {},
                patch: {},
                head: {},
            },
            baseURL: '',
            timeout: 0,
        },
        interceptors: {
            request: {
                use: jest.fn(),
                eject: jest.fn(),
                clear: jest.fn(),
            },
            response: {
                use: jest.fn(),
                eject: jest.fn(),
                clear: jest.fn(),
            },
        },
    };

    // Make create return the mock instance itself
    mockAxios.create.mockReturnValue(mockAxios);

    return mockAxios;
}

/**
 * Common test data fixtures
 */
export const testFixtures = {
    httpClientConfig: {
        baseURL: 'https://api.example.com',
        timeout: 5000,
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key',
        },
    },

    sampleUser: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
    },

    sampleApiResponse: {
        success: true,
        data: {
            id: 1,
            name: 'Test Item',
            description: 'Test Description',
        },
        message: 'Operation successful',
    },

    sampleErrorResponse: {
        success: false,
        error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: {
                field: 'email',
                message: 'Email is required',
            },
        },
    },
};

/**
 * Helper to create test environment setup and teardown
 */
export function createTestEnvironment() {
    const originalConsole = { ...console };

    const setup = () => {
        {
            console.log = jest.fn();
            console.warn = jest.fn();
            console.error = jest.fn();
        }
    };

    const teardown = () => {
        // Restore original console
        Object.assign(console, originalConsole);

        // Clear all mocks
        jest.clearAllMocks();

        // Reset modules
        jest.resetModules();
    };

    return { setup, teardown };
}

/**
 * Mock HTTP status codes for testing
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Common assertion utils
 */
export const assertions = {
    expectLoggerCalled: (logger: any, level: string, message?: string) => {
        expect(logger[level]).toHaveBeenCalled();
        if (message) {
            expect(logger[level]).toHaveBeenCalledWith(expect.stringContaining(message));
        }
    },

    expectLoggerCalledWithError: (logger: any, level: string, message?: string, errorMessage?: string) => {
        expect(logger[level]).toHaveBeenCalled();
        const lastCall = logger[level].mock.calls[logger[level].mock.calls.length - 1];

        if (message) {
            expect(lastCall[0]).toContain(message);
        }

        if (errorMessage) {
            expect(lastCall[1]).toBeInstanceOf(Error);
            expect(lastCall[1].message).toContain(errorMessage);
        }
    },

    expectHeaderSet: (mockAxios: any, headerName: string, headerValue: string) => {
        expect(mockAxios.defaults.headers.common[headerName]).toBe(headerValue);
    },
};