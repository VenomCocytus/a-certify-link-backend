// tests/unit/utils/httpClient.test.ts
import { describe, beforeEach, afterEach, it, expect, jest } from '@jest/globals';
import axios, {AxiosHeaders} from 'axios';
import { HttpClient, HttpClientConfig } from '@utils/httpClient';
import {
    createMockAxiosResponse,
    createMockAxiosError,
    createMockNetworkError,
    createMockAxiosInstance,
    testFixtures,
    flushPromises,
    HTTP_STATUS,
    assertions,
    createTestEnvironment,
} from '../../helpers/neo-test-utils';
import {logger} from "@utils/logger";

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('@utils/logger');

describe('HttpClient', () => {
    let httpClient: HttpClient;
    let mockAxiosInstance: any;
    let config: HttpClientConfig;
    const { setup, teardown } = createTestEnvironment();

    beforeEach(() => {
        setup();

        // Reset all mocks
        jest.clearAllMocks();

        // Create mock axios instance
        mockAxiosInstance = createMockAxiosInstance();
        mockedAxios.create.mockReturnValue(mockAxiosInstance);

        // Setup default config
        config = { ...testFixtures.httpClientConfig };

        // Create HttpClient instance
        httpClient = new HttpClient(config);
    });

    afterEach(() => {
        teardown();
    });

    describe('Constructor', () => {
        it('should create axios instance with provided config', () => {
            expect(mockedAxios.create).toHaveBeenCalledWith(config);
        });

        it('should setup request and response interceptors', () => {
            expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
            expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
        });

        it('should create instance with minimal config', () => {
            const minimalConfig: HttpClientConfig = {
                baseURL: 'https://api.test.com',
                timeout: 3000,
            };

            new HttpClient(minimalConfig);

            expect(mockedAxios.create).toHaveBeenLastCalledWith(minimalConfig);
        });
    });

    describe('Request Interceptor', () => {
        it('should log debug message for outgoing requests', () => {
            // Get the request interceptor function
            const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];

            const mockConfig = {
                method: 'get',
                url: '/test-endpoint',
            };

            const result = requestInterceptor(mockConfig);

            expect(result).toBe(mockConfig);
            assertions.expectLoggerCalled(logger, 'debug', 'HTTP Request: GET /test-endpoint');
        });

        it('should handle request interceptor errors', () => {
            const requestErrorInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][1];
            const testError = new Error('Request setup failed');

            expect(requestErrorInterceptor(testError)).rejects.toThrow(testError);
            assertions.expectLoggerCalledWithError(logger, 'error', 'HTTP Request Error:');
        });
    });

    describe('Response Interceptor', () => {
        it('should log debug message for successful responses', () => {
            const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];

            const mockResponse = createMockAxiosResponse(
                { success: true },
                HTTP_STATUS.OK,
                'OK',
                { url: '/test-endpoint' }
            );

            const result = responseInterceptor(mockResponse);

            expect(result).toBe(mockResponse);
            assertions.expectLoggerCalled(logger, 'debug', 'HTTP Response: 200 /test-endpoint');
        });

        it('should handle response errors with response object', async () => {
            const responseErrorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

            const axiosError = createMockAxiosError(
                'Request failed',
                'BAD_REQUEST',
                HTTP_STATUS.BAD_REQUEST,
                {
                    data: { message: 'Validation failed' },
                    statusText: 'Bad Request',
                    config: {
                        url: '/test',
                        headers: new AxiosHeaders()
                    },
                }
            );

            expect(responseErrorInterceptor(axiosError)).rejects.toBe(axiosError);
            assertions.expectLoggerCalledWithError(logger, 'error', 'HTTP Response Error: 400 /test');
        });

        it('should handle network errors (no response)', async () => {
            const responseErrorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

            const networkError = createMockNetworkError('Network timeout');

            await expect(responseErrorInterceptor(networkError)).rejects.toBe(networkError);
            assertions.expectLoggerCalledWithError(logger, 'error', 'HTTP Network Error:');
        });

        it('should handle generic errors', async () => {
            const responseErrorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

            const genericError = new Error('Something went wrong');

            await expect(responseErrorInterceptor(genericError)).rejects.toThrow(genericError);
            assertions.expectLoggerCalledWithError(logger, 'error', 'HTTP Error:');
        });
    });

    describe('HTTP Methods', () => {
        describe('GET', () => {
            it('should make GET request and return data', async () => {
                const responseData = testFixtures.sampleApiResponse;
                const mockResponse = createMockAxiosResponse(responseData);

                mockAxiosInstance.get.mockResolvedValue(mockResponse);

                const result = await httpClient.get('/users');

                expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', undefined);
                expect(result).toEqual(responseData);
            });

            it('should make GET request with config', async () => {
                const responseData = testFixtures.sampleApiResponse;
                const mockResponse = createMockAxiosResponse(responseData);
                const requestConfig = { params: { page: 1, limit: 10 } };

                mockAxiosInstance.get.mockResolvedValue(mockResponse);

                const result = await httpClient.get('/users', requestConfig);

                expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', requestConfig);
                expect(result).toEqual(responseData);
            });

            it('should handle GET request errors', async () => {
                const axiosError = createMockAxiosError(
                    'Not found',
                    'NOT_FOUND',
                    HTTP_STATUS.NOT_FOUND
                );

                mockAxiosInstance.get.mockRejectedValue(axiosError);

                await expect(httpClient.get('/users/999')).rejects.toBe(axiosError);
                expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/999', undefined);
            });
        });

        describe('POST', () => {
            it('should make POST request and return data', async () => {
                const requestData = { name: 'New User', email: 'user@example.com' };
                const responseData = { ...testFixtures.sampleApiResponse, data: { id: 1, ...requestData } };
                const mockResponse = createMockAxiosResponse(responseData, HTTP_STATUS.CREATED);

                mockAxiosInstance.post.mockResolvedValue(mockResponse);

                const result = await httpClient.post('/users', requestData);

                expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', requestData, undefined);
                expect(result).toEqual(responseData);
            });

            it('should make POST request with config', async () => {
                const requestData = { name: 'New User' };
                const responseData = testFixtures.sampleApiResponse;
                const mockResponse = createMockAxiosResponse(responseData, HTTP_STATUS.CREATED);
                const requestConfig = { headers: { 'X-Custom-Header': 'custom-value' } };

                mockAxiosInstance.post.mockResolvedValue(mockResponse);

                const result = await httpClient.post('/users', requestData, requestConfig);

                expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', requestData, requestConfig);
                expect(result).toEqual(responseData);
            });

            it('should make POST request without data', async () => {
                const responseData = testFixtures.sampleApiResponse;
                const mockResponse = createMockAxiosResponse(responseData);

                mockAxiosInstance.post.mockResolvedValue(mockResponse);

                const result = await httpClient.post('/actions/trigger');

                expect(mockAxiosInstance.post).toHaveBeenCalledWith('/actions/trigger', undefined, undefined);
                expect(result).toEqual(responseData);
            });

            it('should handle POST request errors', async () => {
                const axiosError = createMockAxiosError(
                    'Validation failed',
                    'VALIDATION_ERROR',
                    HTTP_STATUS.UNPROCESSABLE_ENTITY
                );

                mockAxiosInstance.post.mockRejectedValue(axiosError);

                await expect(httpClient.post('/users', {})).rejects.toBe(axiosError);
            });
        });

        describe('PUT', () => {
            it('should make PUT request and return data', async () => {
                const requestData = { name: 'Updated User' };
                const responseData = testFixtures.sampleApiResponse;
                const mockResponse = createMockAxiosResponse(responseData);

                mockAxiosInstance.put.mockResolvedValue(mockResponse);

                const result = await httpClient.put('/users/1', requestData);

                expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/1', requestData, undefined);
                expect(result).toEqual(responseData);
            });

            it('should make PUT request with config', async () => {
                const requestData = { name: 'Updated User' };
                const responseData = testFixtures.sampleApiResponse;
                const mockResponse = createMockAxiosResponse(responseData);
                const requestConfig = { timeout: 10000 };

                mockAxiosInstance.put.mockResolvedValue(mockResponse);

                const result = await httpClient.put('/users/1', requestData, requestConfig);

                expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/1', requestData, requestConfig);
                expect(result).toEqual(responseData);
            });

            it('should handle PUT request errors', async () => {
                const axiosError = createMockAxiosError(
                    'Conflict',
                    'CONFLICT',
                    HTTP_STATUS.CONFLICT
                );

                mockAxiosInstance.put.mockRejectedValue(axiosError);

                await expect(httpClient.put('/users/1', {})).rejects.toBe(axiosError);
            });
        });

        describe('DELETE', () => {
            it('should make DELETE request and return data', async () => {
                const responseData = { success: true, message: 'User deleted' };
                const mockResponse = createMockAxiosResponse(responseData, HTTP_STATUS.NO_CONTENT);

                mockAxiosInstance.delete.mockResolvedValue(mockResponse);

                const result = await httpClient.delete('/users/1');

                expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/users/1', undefined);
                expect(result).toEqual(responseData);
            });

            it('should make DELETE request with config', async () => {
                const responseData = { success: true };
                const mockResponse = createMockAxiosResponse(responseData);
                const requestConfig = { headers: { 'X-Force-Delete': 'true' } };

                mockAxiosInstance.delete.mockResolvedValue(mockResponse);

                const result = await httpClient.delete('/users/1', requestConfig);

                expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/users/1', requestConfig);
                expect(result).toEqual(responseData);
            });

            it('should handle DELETE request errors', async () => {
                const axiosError = createMockAxiosError(
                    'Forbidden',
                    'FORBIDDEN',
                    HTTP_STATUS.FORBIDDEN
                );

                mockAxiosInstance.delete.mockRejectedValue(axiosError);

                await expect(httpClient.delete('/users/1')).rejects.toBe(axiosError);
            });
        });
    });

    describe('Authentication Methods', () => {
        describe('setAuthToken', () => {
            it('should set Authorization header with Bearer token', () => {
                const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

                httpClient.setAuthToken(token);

                assertions.expectHeaderSet(mockAxiosInstance, 'Authorization', `Bearer ${token}`);
            });

            it('should override existing Authorization header', () => {
                const firstToken = 'first-token';
                const secondToken = 'second-token';

                httpClient.setAuthToken(firstToken);
                httpClient.setAuthToken(secondToken);

                assertions.expectHeaderSet(mockAxiosInstance, 'Authorization', `Bearer ${secondToken}`);
            });
        });

        describe('setApiKey', () => {
            it('should set API key with default header name', () => {
                const apiKey = 'test-api-key-12345';

                httpClient.setApiKey(apiKey);

                assertions.expectHeaderSet(mockAxiosInstance, 'X-API-Key', apiKey);
            });

            it('should set API key with custom header name', () => {
                const apiKey = 'test-api-key-12345';
                const headerName = 'X-Custom-API-Key';

                httpClient.setApiKey(apiKey, headerName);

                assertions.expectHeaderSet(mockAxiosInstance, headerName, apiKey);
            });

            it('should override existing API key', () => {
                const firstKey = 'first-key';
                const secondKey = 'second-key';

                httpClient.setApiKey(firstKey);
                httpClient.setApiKey(secondKey);

                assertions.expectHeaderSet(mockAxiosInstance, 'X-API-Key', secondKey);
            });
        });
    });

    describe('Error Handling', () => {
        it('should propagate timeout errors', async () => {
            const timeoutError = createMockAxiosError(
                'Request timeout',
                'ECONNABORTED'
            );

            mockAxiosInstance.get.mockRejectedValue(timeoutError);

            await expect(httpClient.get('/slow-endpoint')).rejects.toBe(timeoutError);
        });

        it('should propagate server errors', async () => {
            const serverError = createMockAxiosError(
                'Internal server error',
                'INTERNAL_SERVER_ERROR',
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                {
                    data: { message: 'Database connection failed' },
                }
            );

            mockAxiosInstance.post.mockRejectedValue(serverError);

            await expect(httpClient.post('/data', {})).rejects.toBe(serverError);
        });

        it('should propagate network connectivity errors', async () => {
            const networkError = createMockNetworkError('Network is unreachable');

            mockAxiosInstance.get.mockRejectedValue(networkError);

            await expect(httpClient.get('/ping')).rejects.toBe(networkError);
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle typical API workflow', async () => {
            // Setup responses for a typical workflow
            const userData = { name: 'John Doe', email: 'john@example.com' };
            const createResponse = createMockAxiosResponse(
                { id: 1, ...userData },
                HTTP_STATUS.CREATED
            );
            const getResponse = createMockAxiosResponse({ id: 1, ...userData });
            const updateResponse = createMockAxiosResponse(
                { id: 1, ...userData, name: 'John Smith' }
            );
            const deleteResponse = createMockAxiosResponse(
                { success: true },
                HTTP_STATUS.NO_CONTENT
            );

            mockAxiosInstance.post.mockResolvedValueOnce(createResponse);
            mockAxiosInstance.get.mockResolvedValueOnce(getResponse);
            mockAxiosInstance.put.mockResolvedValueOnce(updateResponse);
            mockAxiosInstance.delete.mockResolvedValueOnce(deleteResponse);

            // Set authentication
            httpClient.setAuthToken('valid-token');

            // Execute workflow
            const created = await httpClient.post('/users', userData);
            const retrieved = await httpClient.get('/users/1');
            const updated = await httpClient.put('/users/1', { ...userData, name: 'John Smith' });
            const deleted = await httpClient.delete('/users/1');

            // Verify results
            expect(created).toEqual({ id: 1, ...userData });
            expect(retrieved).toEqual({ id: 1, ...userData });
            expect(updated).toEqual({ id: 1, ...userData, name: 'John Smith' });
            expect(deleted).toEqual({ success: true });

            // Verify authentication header was set
            assertions.expectHeaderSet(mockAxiosInstance, 'Authorization', 'Bearer valid-token');
        });

        it('should handle API errors gracefully', async () => {
            const unauthorizedError = createMockAxiosError(
                'Unauthorized',
                'UNAUTHORIZED',
                HTTP_STATUS.UNAUTHORIZED
            );
            const forbiddenError = createMockAxiosError(
                'Forbidden',
                'FORBIDDEN',
                HTTP_STATUS.FORBIDDEN
            );

            mockAxiosInstance.get.mockRejectedValueOnce(unauthorizedError);
            mockAxiosInstance.post.mockRejectedValueOnce(forbiddenError);

            await expect(httpClient.get('/protected')).rejects.toBe(unauthorizedError);
            await expect(httpClient.post('/admin/users', {})).rejects.toBe(forbiddenError);
        });
    });
});