import { Request } from 'express';
import { TFunction } from "i18next";
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        companyCode?: string;
        agentCode?: string;
        permissions: string[];
    };
    idempotencyKey?: string;
    isIdempotentReplay?: boolean;
}
export interface I18nRequest extends Request {
    t: TFunction;
    language: string;
}
export interface RequestWithLogging extends Request {
    requestId: string;
    startTime: number;
}
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    resetTime: Date;
    retryAfter?: number;
}
export interface IdempotencyInfo {
    key: string;
    isReplay: boolean;
    originalResponse?: unknown;
    createdAt: Date;
}
export interface ValidationErrorDetail {
    field: string;
    value: unknown;
    message: string;
    code: string;
}
export interface GlobalErrorContext {
    requestId: string;
    userId?: string;
    userAgent?: string;
    ip: string;
    method: string;
    url: string;
    timestamp: Date;
    stack?: string;
}
export interface HealthCheckOptions {
    timeout: number;
    retries: number;
    includeDetails: boolean;
}
export interface MetricsData {
    requestsTotal: number;
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    activeConnections: number;
    memoryUsage: {
        used: number;
        total: number;
        percentage: number;
    };
    cpuUsage: number;
}
//# sourceMappingURL=middleware.interfaces.d.ts.map