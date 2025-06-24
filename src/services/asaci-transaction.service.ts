import {
    CreateTransactionDto,
    UpdateTransactionDto,
    RejectTransactionDto,
    CancelTransactionDto
} from '@dto/asaci.dto';
import {HttpClient} from "@utils/httpClient";

export class AsaciTransactionService {
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

    async createTransaction(createTransactionDto: CreateTransactionDto): Promise<any> {
        return this.httpClient.post('transactions', createTransactionDto);
    }

    async getTransactions(params?: { page?: number; limit?: number }): Promise<any> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();
        const url = queryString ? `transactions?${queryString}` : 'transactions';

        return this.httpClient.get(url);
    }

    async getTransaction(reference: string): Promise<any> {
        return this.httpClient.get(`transactions/${reference}`);
    }

    async updateTransaction(reference: string, updateTransactionDto: UpdateTransactionDto): Promise<any> {
        return this.httpClient.put(`transactions/${reference}`, updateTransactionDto);
    }

    async approveTransaction(reference: string): Promise<any> {
        return this.httpClient.post(`transactions/${reference}/approve`);
    }

    async rejectTransaction(reference: string, rejectTransactionDto: RejectTransactionDto): Promise<any> {
        return this.httpClient.post(`transactions/${reference}/reject`, rejectTransactionDto);
    }

    async cancelTransaction(reference: string, cancelTransactionDto: CancelTransactionDto): Promise<any> {
        return this.httpClient.post(`transactions/${reference}/cancel`, cancelTransactionDto);
    }

    async getTransactionUsageStatistics(): Promise<any> {
        return this.httpClient.get('transactions/statistics/usage');
    }

    async getTransactionDepositsStatistics(): Promise<any> {
        return this.httpClient.get('transactions/statistic/deposits');
    }
}