import { Transaction } from 'sequelize';
import {
    CertificateCreationResult,
    CertificateOperationRequest,
    CertificateOperationResult,
    CertificateData,
    CertificateSearchCriteria,
    BulkCertificateRequest,
    BulkCertificateResult
} from './certificate.interfaces';
import { PaginatedResponse, PaginationParams } from './common.interfaces';
import {
    AsaciAttestationEditionRequest, AsaciAttestationEditionResponse,
    AsaciAttestationUpdateStatusRequest,
    AsaciAttestationUpdateStatusResponse, AsaciAttestationVerificationRequest, AsaciAttestationVerificationResponse
} from "@dto/asaci.dto";
import {CertificateCreationRequest} from "@dto/certificate.dto";

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