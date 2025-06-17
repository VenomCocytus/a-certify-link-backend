export interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
}

export interface PaginationMeta {
    totalItems: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface HealthCheckResult {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    services: Record<string, ServiceHealth>;
    version?: string;
    environment?: string;
}

export interface ServiceHealth {
    status: 'healthy' | 'unhealthy' | 'degraded';
    responseTime?: number;
    message?: string;
    lastCheck?: string;
}

export interface AuditLogData {
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    timestamp: Date;
    ipAddress: string;
}

export interface IdempotencyKey {
    key: string;
    status: 'pending' | 'completed' | 'failed';
    requestHash: string;
    response?: unknown;
    createdAt: Date;
    expiresAt: Date;
}