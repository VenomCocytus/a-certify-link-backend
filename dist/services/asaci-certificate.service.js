"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsaciCertificateService = void 0;
const httpClient_1 = require("@utils/httpClient");
const asaci_endpoints_1 = require("@config/asaci-endpoints");
class AsaciCertificateService {
    constructor(baseUrl, authToken) {
        this.httpClient = new httpClient_1.HttpClient({
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
    setAuthToken(token) {
        this.httpClient.setAuthToken(token);
    }
    async getCertificates(params) {
        const queryParams = new URLSearchParams();
        if (params?.page)
            queryParams.append('page', params.page.toString());
        if (params?.limit)
            queryParams.append('limit', params.limit.toString());
        const queryString = queryParams.toString();
        const url = queryString ? `${asaci_endpoints_1.ASACI_ENDPOINTS.CERTIFICATES}?${queryString}` : asaci_endpoints_1.ASACI_ENDPOINTS.CERTIFICATES;
        return this.httpClient.get(url);
    }
    async getCertificate(reference) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.CERTIFICATES_DETAIL.replace('{reference}', reference);
        return this.httpClient.get(endpoint);
    }
    async downloadCertificate(reference) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.CERTIFICATES_DOWNLOAD.replace('{reference}', reference);
        return this.httpClient.get(endpoint);
    }
    async cancelCertificate(reference, cancelCertificateDto) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.CERTIFICATES_CANCEL.replace('{reference}', reference);
        return this.httpClient.post(endpoint, cancelCertificateDto);
    }
    async suspendCertificate(reference, suspendCertificateDto) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.CERTIFICATES_SUSPEND.replace('{reference}', reference);
        return this.httpClient.post(endpoint, suspendCertificateDto);
    }
    async checkCertificate(reference) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.CERTIFICATES_CHECK.replace('{reference}', reference);
        return this.httpClient.post(endpoint);
    }
    async getCertificateRelated(reference) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.CERTIFICATES_RELATED.replace('{reference}', reference);
        return this.httpClient.get(endpoint);
    }
    async downloadCertificateRelated(reference) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.CERTIFICATES_RELATED_DOWNLOAD.replace('{reference}', reference);
        return this.httpClient.get(endpoint);
    }
    async getCertificateTypes() {
        return this.httpClient.get(asaci_endpoints_1.ASACI_ENDPOINTS.CERTIFICATE_TYPES);
    }
    async getCertificateVariants() {
        return this.httpClient.get(asaci_endpoints_1.ASACI_ENDPOINTS.CERTIFICATE_VARIANTS);
    }
    async getCertificateUsageStatistics() {
        return this.httpClient.get(asaci_endpoints_1.ASACI_ENDPOINTS.CERTIFICATES_STATISTICS_USAGE);
    }
    async getAvailableCertificatesStatistics() {
        return this.httpClient.get(asaci_endpoints_1.ASACI_ENDPOINTS.CERTIFICATES_STATISTIC_AVAILABLE);
    }
    async getUsedCertificatesStatistics() {
        return this.httpClient.get(asaci_endpoints_1.ASACI_ENDPOINTS.CERTIFICATES_STATISTIC_USED);
    }
}
exports.AsaciCertificateService = AsaciCertificateService;
//# sourceMappingURL=asaci-certificate.service.js.map