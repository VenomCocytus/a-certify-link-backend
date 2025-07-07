
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
    url: string;
}

export interface OrassConfig {
    host: string;
    port: number;
    sid: string;
    username: string;
    password: string;
    connectionTimeout?: number;
    requestTimeout?: number;
    autoConnect?: boolean;
}

export interface AsaciConfig {
    baseUrl: string;
    email: string;
    password: string;
    clientName: string;
    timeout?: number;
}