"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsaciTransactionService = void 0;
const httpClient_1 = require("@utils/httpClient");
class AsaciTransactionService {
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
    async createTransaction(createTransactionDto) {
        return this.httpClient.post('transactions', createTransactionDto);
    }
    async getTransactions(params) {
        const queryParams = new URLSearchParams();
        if (params?.page)
            queryParams.append('page', params.page.toString());
        if (params?.limit)
            queryParams.append('limit', params.limit.toString());
        const queryString = queryParams.toString();
        const url = queryString ? `transactions?${queryString}` : 'transactions';
        return this.httpClient.get(url);
    }
    async getTransaction(reference) {
        return this.httpClient.get(`transactions/${reference}`);
    }
    async updateTransaction(reference, updateTransactionDto) {
        return this.httpClient.put(`transactions/${reference}`, updateTransactionDto);
    }
    async approveTransaction(reference) {
        return this.httpClient.post(`transactions/${reference}/approve`);
    }
    async rejectTransaction(reference, rejectTransactionDto) {
        return this.httpClient.post(`transactions/${reference}/reject`, rejectTransactionDto);
    }
    async cancelTransaction(reference, cancelTransactionDto) {
        return this.httpClient.post(`transactions/${reference}/cancel`, cancelTransactionDto);
    }
    async getTransactionUsageStatistics() {
        return this.httpClient.get('transactions/statistics/usage');
    }
    async getTransactionDepositsStatistics() {
        return this.httpClient.get('transactions/statistic/deposits');
    }
}
exports.AsaciTransactionService = AsaciTransactionService;
//# sourceMappingURL=asaci-transaction.service.js.map