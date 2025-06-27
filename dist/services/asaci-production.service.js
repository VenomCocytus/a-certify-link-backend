"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsaciProductionService = void 0;
const httpClient_1 = require("@utils/httpClient");
const asaci_endpoints_1 = require("@config/asaci-endpoints");
class AsaciProductionService {
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
    async createProductionRequest(createProductionRequestDto) {
        return this.httpClient.post(asaci_endpoints_1.ASACI_ENDPOINTS.PRODUCTIONS, createProductionRequestDto);
    }
    async getProductionRequests(params) {
        const queryParams = new URLSearchParams();
        if (params?.page)
            queryParams.append('page', params.page.toString());
        if (params?.limit)
            queryParams.append('limit', params.limit.toString());
        const queryString = queryParams.toString();
        const url = queryString ? `${asaci_endpoints_1.ASACI_ENDPOINTS.PRODUCTIONS}?${queryString}` : asaci_endpoints_1.ASACI_ENDPOINTS.PRODUCTIONS;
        return this.httpClient.get(url);
    }
    async downloadProductionZip(reference) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.PRODUCTIONS_DOWNLOAD.replace('{reference}', reference);
        return this.httpClient.get(endpoint);
    }
    async fetchProduction(policeNumber, organizationCode) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.PRODUCTIONS_FETCH
            .replace('{policeNumber}', policeNumber)
            .replace('{organizationCode}', organizationCode);
        return this.httpClient.post(endpoint);
    }
}
exports.AsaciProductionService = AsaciProductionService;
//# sourceMappingURL=asaci-production.service.js.map