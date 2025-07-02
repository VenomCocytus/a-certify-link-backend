import { CreateProductionRequestDto } from '@dto/asaci.dto';
import {HttpClient} from "@utils/httpClient";
import {ASACI_ENDPOINTS} from "@config/asaci-endpoints";

export class AsaciProductionService {
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

    //TODO: Cast the result form asaci into a correct class

    setAuthToken(token: string): void {
        this.httpClient.setAuthToken(token);
    }

    async createProductionRequest(createProductionRequestDto: CreateProductionRequestDto): Promise<any> {
        return this.httpClient.post(ASACI_ENDPOINTS.PRODUCTIONS, createProductionRequestDto);
    }

    async getProductionRequests(params?: { page?: number; limit?: number }): Promise<any> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();
        const url = queryString ? `${ASACI_ENDPOINTS.PRODUCTIONS}?${queryString}` : ASACI_ENDPOINTS.PRODUCTIONS;

        return this.httpClient.get(url);
    }

    async downloadProductionZip(reference: string): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.PRODUCTIONS_DOWNLOAD.replace('{reference}', reference);
        return this.httpClient.get(endpoint);
    }

    async fetchProduction(policeNumber: string, organizationCode: string): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.PRODUCTIONS_FETCH
            .replace('{policeNumber}', policeNumber)
            .replace('{organizationCode}', organizationCode);
        return this.httpClient.post(endpoint);
    }
}