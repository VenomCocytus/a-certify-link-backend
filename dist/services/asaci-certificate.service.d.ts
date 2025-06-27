import { CancelCertificateDto, SuspendCertificateDto } from '@dto/asaci.dto';
export declare class AsaciCertificateService {
    private httpClient;
    constructor(baseUrl: string, authToken?: string);
    setAuthToken(token: string): void;
    getCertificates(params?: {
        page?: number;
        limit?: number;
    }): Promise<any>;
    getCertificate(reference: string): Promise<any>;
    downloadCertificate(reference: string): Promise<any>;
    cancelCertificate(reference: string, cancelCertificateDto: CancelCertificateDto): Promise<any>;
    suspendCertificate(reference: string, suspendCertificateDto: SuspendCertificateDto): Promise<any>;
    checkCertificate(reference: string): Promise<any>;
    getCertificateRelated(reference: string): Promise<any>;
    downloadCertificateRelated(reference: string): Promise<any>;
    getCertificateTypes(): Promise<any>;
    getCertificateVariants(): Promise<any>;
    getCertificateUsageStatistics(): Promise<any>;
    getAvailableCertificatesStatistics(): Promise<any>;
    getUsedCertificatesStatistics(): Promise<any>;
}
//# sourceMappingURL=asaci-certificate.service.d.ts.map