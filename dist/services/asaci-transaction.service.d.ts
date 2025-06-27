import { CreateTransactionDto, UpdateTransactionDto, RejectTransactionDto, CancelTransactionDto } from '@dto/asaci.dto';
export declare class AsaciTransactionService {
    private httpClient;
    constructor(baseUrl: string, authToken?: string);
    setAuthToken(token: string): void;
    createTransaction(createTransactionDto: CreateTransactionDto): Promise<any>;
    getTransactions(params?: {
        page?: number;
        limit?: number;
    }): Promise<any>;
    getTransaction(reference: string): Promise<any>;
    updateTransaction(reference: string, updateTransactionDto: UpdateTransactionDto): Promise<any>;
    approveTransaction(reference: string): Promise<any>;
    rejectTransaction(reference: string, rejectTransactionDto: RejectTransactionDto): Promise<any>;
    cancelTransaction(reference: string, cancelTransactionDto: CancelTransactionDto): Promise<any>;
    getTransactionUsageStatistics(): Promise<any>;
    getTransactionDepositsStatistics(): Promise<any>;
}
//# sourceMappingURL=asaci-transaction.service.d.ts.map