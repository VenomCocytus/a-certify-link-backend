import { OrassPolicyData, OrassInsuredData } from './orass.interfaces';
import {CertificateCreationRequest} from "@dto/certificate.dto";

export interface CertificateCreationResult {
    certificateId: string;
    referenceNumber: string;
    ivoryRequestNumber?: string;
    status: CertificateStatus;
    message?: string;
    errors?: string[];
}

export interface CertificateStatusUpdate {
    certificateId: string;
    status: CertificateStatus;
    ivoryStatus?: number;
    certificateNumber?: string;
    downloadUrl?: string;
    errorMessage?: string;
    updatedBy: string;
    metadata?: Record<string, unknown>;
}

export interface CertificateOperationRequest {
    certificateIds: string[];
    operation: 'cancel' | 'suspend';
    reason?: string;
    requestedBy: string;
}

export interface CertificateOperationResult {
    successful: string[];
    failed: Array<{
        certificateId: string;
        error: string;
    }>;
}

export interface CertificateData {
    id: string;
    referenceNumber: string;
    ivoryRequestNumber?: string;
    status: CertificateStatus;
    certificateNumber?: string;
    downloadUrl?: string;
    policyNumber: string;
    registrationNumber: string;
    companyCode: string;
    agentCode?: string;
    requestedBy: string;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;

    // Related data
    policy?: OrassPolicyData;
    insured?: OrassInsuredData;
    auditLogs?: CertificateAuditLogData[];
}

export interface CertificateAuditLogData {
    id: string;
    certificateId: string;
    action: CertificateAction;
    userId: string;
    oldStatus?: CertificateStatus;
    newStatus?: CertificateStatus;
    details?: Record<string, unknown>;
    timestamp: Date;
}

export type CertificateStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'suspended';

export type CertificateAction =
    | 'created'
    | 'updated'
    | 'cancelled'
    | 'suspended'
    | 'downloaded'
    | 'status_checked';

export interface CertificateSearchCriteria {
    policyNumber?: string;
    registrationNumber?: string;
    companyCode?: string;
    agentCode?: string;
    status?: CertificateStatus;
    certificateNumber?: string;
    dateFrom?: Date;
    dateTo?: Date;
    requestedBy?: string;
}

export interface CertificateDownloadInfo {
    certificateId: string;
    certificateNumber: string;
    downloadUrl: string;
    fileType: 'PDF' | 'IMAGE' | 'QRCODE';
    expiresAt?: Date;
    generatedAt: Date;
}

export interface CertificateValidationResult {
    isValid: boolean;
    errors: Array<{
        field: string;
        message: string;
        code: string;
    }>;
    warnings: Array<{
        field: string;
        message: string;
        code: string;
    }>;
}

export interface CertificateStatistics {
    total: number;
    byStatus: Record<CertificateStatus, number>;
    byCompany: Record<string, number>;
    byPeriod: Array<{
        period: string;
        count: number;
    }>;
    averageProcessingTime: number;
    successRate: number;
}

export interface BulkCertificateRequest {
    requests: CertificateCreationRequest[];
    batchId: string;
    requestedBy: string;
    idempotencyKey: string;
}

export interface BulkCertificateResult {
    batchId: string;
    totalRequests: number;
    successful: number;
    failed: number;
    results: Array<{
        request: CertificateCreationRequest;
        result: CertificateCreationResult | { error: string };
    }>;
    processingTime: number;
}