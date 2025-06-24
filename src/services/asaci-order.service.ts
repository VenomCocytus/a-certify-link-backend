import { CreateOrderDto, UpdateOrderDto } from '@dto/asaci.dto';
import {HttpClient} from "@utils/httpClient";
import {ASACI_ENDPOINTS} from "@config/asaci-endpoints";

export class AsaciOrderService {
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

    async createOrder(createOrderDto: CreateOrderDto): Promise<any> {
        return this.httpClient.post(ASACI_ENDPOINTS.ORDERS, createOrderDto);
    }

    async getOrders(params?: { page?: number; limit?: number }): Promise<any> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();
        const url = queryString ? `${ASACI_ENDPOINTS.ORDERS}?${queryString}` : ASACI_ENDPOINTS.ORDERS;

        return this.httpClient.get(url);
    }

    async getOrder(reference: string): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.ORDERS_DETAIL.replace('{reference}', reference);
        return this.httpClient.get(endpoint);
    }

    async updateOrder(reference: string, updateOrderDto: UpdateOrderDto): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.ORDERS_DETAIL.replace('{reference}', reference);
        return this.httpClient.put(endpoint, updateOrderDto);
    }

    async approveOrder(reference: string): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.ORDERS_APPROVE.replace('{reference}', reference);
        return this.httpClient.post(endpoint);
    }

    async rejectOrder(reference: string, reason?: string): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.ORDERS_REJECT.replace('{reference}', reference);
        return this.httpClient.post(endpoint, { reason });
    }

    async cancelOrder(reference: string, reason?: string): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.ORDERS_CANCEL.replace('{reference}', reference);
        return this.httpClient.post(endpoint, { reason });
    }

    async suspendOrder(reference: string, reason?: string): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.ORDERS_SUSPEND.replace('{reference}', reference);
        return this.httpClient.post(endpoint, { reason });
    }

    async submitOrderForConfirmation(reference: string): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.ORDERS_SUBMIT_CONFIRMATION.replace('{reference}', reference);
        return this.httpClient.post(endpoint);
    }

    async confirmOrderDelivery(reference: string): Promise<any> {
        const endpoint = ASACI_ENDPOINTS.ORDERS_CONFIRM_DELIVERY.replace('{reference}', reference);
        return this.httpClient.post(endpoint);
    }

    async getOrderStatuses(): Promise<any> {
        return this.httpClient.get(ASACI_ENDPOINTS.ORDERS_STATUSES);
    }

    async getDeliveredOrdersStatistics(): Promise<any> {
        return this.httpClient.get(ASACI_ENDPOINTS.ORDERS_STATISTIC_DELIVERED);
    }
}