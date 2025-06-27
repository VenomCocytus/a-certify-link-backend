import { AxiosRequestConfig } from 'axios';
export interface HttpClientConfig {
    baseURL: string;
    timeout: number;
    headers?: Record<string, string>;
}
export declare class HttpClient {
    private client;
    constructor(config: HttpClientConfig);
    private setupInterceptors;
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
    put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    setAuthToken(token: string): void;
    setApiKey(key: string, headerName?: string): void;
}
//# sourceMappingURL=httpClient.d.ts.map