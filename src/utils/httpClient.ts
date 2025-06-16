import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { logger } from './logger';

export interface HttpClientConfig {
    baseURL: string;
    timeout: number;
    headers?: Record<string, string>;
}

export class HttpClient {
    private client: AxiosInstance;

    constructor(config: HttpClientConfig) {
        this.client = axios.create(config);
        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                logger.debug(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                logger.error('HTTP Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                logger.debug(`HTTP Response: ${response.status} ${response.config.url}`);
                return response;
            },
            (error) => {
                if (error.response) {
                    logger.error(`HTTP Response Error: ${error.response.status} ${error.response.config?.url}`, {
                        status: error.response.status,
                        data: error.response.data,
                    });
                } else if (error.request) {
                    logger.error('HTTP Network Error:', error.message);
                } else {
                    logger.error('HTTP Error:', error.message);
                }
                return Promise.reject(error);
            }
        );
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }

    setAuthToken(token: string): void {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    setApiKey(key: string, headerName = 'X-API-Key'): void {
        this.client.defaults.headers.common[headerName] = key;
    }
}