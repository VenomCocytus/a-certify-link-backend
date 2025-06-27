import { CreateProductionRequestDto } from '@dto/asaci.dto';
export declare class AsaciProductionService {
    private httpClient;
    constructor(baseUrl: string, authToken?: string);
    setAuthToken(token: string): void;
    createProductionRequest(createProductionRequestDto: CreateProductionRequestDto): Promise<any>;
    getProductionRequests(params?: {
        page?: number;
        limit?: number;
    }): Promise<any>;
    downloadProductionZip(reference: string): Promise<any>;
    fetchProduction(policeNumber: string, organizationCode: string): Promise<any>;
}
//# sourceMappingURL=asaci-production.service.d.ts.map