import { CancelCertificateDto, SuspendCertificateDto } from '../dto/asaci.dto';
import {HttpClient} from "@utils/httpClient";
import {ASACI_ENDPOINTS} from "@config/asaci-endpoints";

export class AsaciCertificateService {
    private httpClient: HttpClient;

    constructor(baseUrl: string, authToken?: string) {
        this.httpClient = new HttpClient({
            baseURL: `${baseUrl}/api/v1`,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (authToken) {
            this.httpClient.setAuthToken(authToken);
        }
    }

    setAuthToken(token: string): void {
        this.httpClient.setAuthToken(token);
    }

    async getCertificates(params?: { page?: number; limit?: number }): Promise<any> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();
        const url = queryString ? `${ASACI_ENDPOINTS.CERTIFICATES}?${queryString}` : ASACI_ENDPOINTS.CERTIFICATES;

        return this.httpClient.get(url);
    }

    async getCertificate(reference: string): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.CERTIFICATES_DETAIL.replace('{reference}', reference);
        return this.httpClient.get(endpoint);
    }

    async downloadCertificate(reference: string): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.CERTIFICATES_DOWNLOAD.replace('{reference}', reference);
        return this.httpClient.get(endpoint);
    }

    async cancelCertificate(reference: string, cancelCertificateDto: CancelCertificateDto): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.CERTIFICATES_CANCEL.replace('{reference}', reference);
        return this.httpClient.post(endpoint, cancelCertificateDto);
    }

    async suspendCertificate(reference: string, suspendCertificateDto: SuspendCertificateDto): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.CERTIFICATES_SUSPEND.replace('{reference}', reference);
        return this.httpClient.post(endpoint, suspendCertificateDto);
    }

    async checkCertificate(reference: string): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.CERTIFICATES_CHECK.replace('{reference}', reference);
        return this.httpClient.post(endpoint);
    }

    async getCertificateRelated(reference: string): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.CERTIFICATES_RELATED.replace('{reference}', reference);
        return this.httpClient.get(endpoint);
    }

    async downloadCertificateRelated(reference: string): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.CERTIFICATES_RELATED_DOWNLOAD.replace('{reference}', reference);
        return this.httpClient.get(endpoint);
    }

    async getCertificateTypes(): Promise<any> {
        return this.httpClient.get(ASACI_ENDPOINTS.CERTIFICATE_TYPES);
    }

    async getCertificateVariants(): Promise<any> {
        return this.httpClient.get(ASACI_ENDPOINTS.CERTIFICATE_VARIANTS);
    }

    async getCertificateUsageStatistics(): Promise<any> {
        return this.httpClient.get(ASACI_ENDPOINTS.CERTIFICATES_STATISTICS_USAGE);
    }

    async getAvailableCertificatesStatistics(): Promise<any> {
        return this.httpClient.get(ASACI_ENDPOINTS.CERTIFICATES_STATISTIC_AVAILABLE);
    }

    async getUsedCertificatesStatistics(): Promise<any> {
        return this.httpClient.get(ASACI_ENDPOINTS.CERTIFICATES_STATISTIC_USED);
    }
}