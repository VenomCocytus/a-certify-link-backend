import {AuthenticationService} from "@services/authentication.service";
import {AsaciServices} from "@services/asaci-services";
import {CertifyLinkService} from "@services/certify-link.service";
import {OrassService} from "@services/orass.service";

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

export interface RouteConfig {
    auth?: {
        enabled?: boolean;
        basePath?: string;
        authService?: AuthenticationService;
    };
    asaci?: {
        enabled?: boolean;
        basePath?: string;
        manager?: AsaciServices;
    };
    orass?: {
        enabled?: boolean;
        orassService?: OrassService;
    };
    certifyLink?: {
        enabled?: boolean;
        basePath?: string;
        certifyLinkService?: CertifyLinkService;
    };
    swagger?: {
        enabled?: boolean;
        basePath?: string;
    };
    health?: {
        enabled?: boolean;
        basePath?: string;
    };
}