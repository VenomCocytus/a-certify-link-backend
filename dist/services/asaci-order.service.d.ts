import { CreateOrderDto, UpdateOrderDto } from '@dto/asaci.dto';
export declare class AsaciOrderService {
    private httpClient;
    constructor(baseUrl: string, authToken?: string);
    setAuthToken(token: string): void;
    createOrder(createOrderDto: CreateOrderDto): Promise<any>;
    getOrders(params?: {
        page?: number;
        limit?: number;
    }): Promise<any>;
    getOrder(reference: string): Promise<any>;
    updateOrder(reference: string, updateOrderDto: UpdateOrderDto): Promise<any>;
    approveOrder(reference: string): Promise<any>;
    rejectOrder(reference: string, reason?: string): Promise<any>;
    cancelOrder(reference: string, reason?: string): Promise<any>;
    suspendOrder(reference: string, reason?: string): Promise<any>;
    submitOrderForConfirmation(reference: string): Promise<any>;
    confirmOrderDelivery(reference: string): Promise<any>;
    getOrderStatuses(): Promise<any>;
    getDeliveredOrdersStatistics(): Promise<any>;
}
//# sourceMappingURL=asaci-order.service.d.ts.map