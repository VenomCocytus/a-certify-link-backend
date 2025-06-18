import { Transaction } from 'sequelize';
import {
    CertificateCreationRequest,
    CertificateCreationResult,
    CertificateOperationRequest,
    CertificateOperationResult,
    CertificateData,
    CertificateSearchCriteria,
    BulkCertificateRequest,
    BulkCertificateResult
} from './certificate.interfaces';
import { OrassPolicyData, OrassInsuredData, OrassQueryParams } from './orass.interfaces';
import {
    AsaciAttestationEditionRequest,
    AsaciAttestationEditionResponse,
    AsaciAttestationVerificationRequest,
    AsaciAttestationVerificationResponse,
    AsaciAttestationUpdateStatusRequest,
    AsaciAttestationUpdateStatusResponse
} from './ivoryAttestation.interfaces';
import { PaginatedResponse, PaginationParams, HealthCheckResult } from './common.interfaces';

export interface CertificateServiceInterface {
    createCertificate(request: CertificateCreationRequest, transaction?: Transaction): Promise<CertificateCreationResult>;
    getCertificateById(id: string): Promise<CertificateData | null>;
    getCertificateByReferenceNumber(referenceNumber: string): Promise<CertificateData | null>;
    searchCertificates(criteria: CertificateSearchCriteria, pagination: PaginationParams): Promise<PaginatedResponse<CertificateData>>;
    updateCertificateStatus(id: string, status: string, metadata?: Record<string, unknown>, userId?: string): Promise<CertificateData>;
    cancelCertificates(request: CertificateOperationRequest): Promise<CertificateOperationResult>;
    suspendCertificates(request: CertificateOperationRequest): Promise<CertificateOperationResult>;
    checkCertificateStatus(referenceNumber: string): Promise<{ status: string; details?: unknown }>;
    downloadCertificate(certificateId: string): Promise<{ url: string; type: string }>;
    processBulkCertificates(request: BulkCertificateRequest): Promise<BulkCertificateResult>;
    processIdempotentRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T>;
}

export interface OrassServiceInterface {
    authenticate(): Promise<string>;
    getPolicyByNumber(policyNumber: string): Promise<OrassPolicyData | null>;
    getInsuredById(insuredId: string): Promise<OrassInsuredData | null>;
    searchPolicies(params: OrassQueryParams): Promise<PaginatedResponse<OrassPolicyData>>;
    validatePolicyForCertificate(policyNumber: string): Promise<{ isValid: boolean; errors: string[] }>;
    checkConnection(): Promise<boolean>;
    refreshToken(): Promise<string>;
}

export interface IvoryAttestationServiceInterface {
    createAttestation(request: AsaciAttestationEditionRequest): Promise<AsaciAttestationEditionResponse>;
    checkAttestationStatus(request: AsaciAttestationVerificationRequest): Promise<AsaciAttestationVerificationResponse>;
    updateAttestationStatus(request: AsaciAttestationUpdateStatusRequest): Promise<AsaciAttestationUpdateStatusResponse>;
    downloadAttestation(companyCode: string, requestNumber: string): Promise<{ url: string; type: string }[]>;
    validateRequest(request: AsaciAttestationEditionRequest): Promise<{ isValid: boolean; errors: string[] }>;
    checkConnection(): Promise<boolean>;
    getStatusCodeDescription(statusCode: number): string;
}

export interface AuditServiceInterface {
    logAction(data: {
        userId: string;
        action: string;
        resourceType: string;
        resourceId: string;
        oldValues?: Record<string, unknown>;
        newValues?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
    }, transaction?: Transaction): Promise<void>;
    getAuditLogs(criteria: {
        userId?: string;
        action?: string;
        resourceType?: string;
        resourceId?: string;
        dateFrom?: Date;
        dateTo?: Date;
    }, pagination: PaginationParams): Promise<PaginatedResponse<any>>;
    getResourceHistory(resourceType: string, resourceId: string, pagination: PaginationParams): Promise<PaginatedResponse<any>>;
    getUserActivity(userId: string, pagination: PaginationParams): Promise<PaginatedResponse<any>>;
}

export interface HealthServiceInterface {
    checkApplicationHealth(): Promise<HealthCheckResult>;
    checkDatabaseHealth(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime?: number; error?: string }>;
    checkOrassHealth(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime?: number; error?: string }>;
    checkIvoryAttestationHealth(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime?: number; error?: string }>;
    getDetailedHealthCheck(): Promise<HealthCheckResult>;
}

export interface IdempotencyServiceInterface {
    processIdempotentRequest<T>(key: string, requestHash: string, requestFn: () => Promise<T>): Promise<T>;
    getIdempotencyStatus(key: string): Promise<{ status: string; response?: unknown } | null>;
    cleanupExpiredKeys(): Promise<number>;
    generateIdempotencyKey(): string;
}

export interface NotificationServiceInterface {
    sendCertificateCreatedNotification(certificateData: CertificateData): Promise<void>;
    sendCertificateCompletedNotification(certificateData: CertificateData): Promise<void>;
    sendCertificateFailedNotification(certificateData: CertificateData, error: string): Promise<void>;
    sendSystemAlertNotification(message: string, level: 'info' | 'warning' | 'error'): Promise<void>;
}