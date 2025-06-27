"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsaciOrderService = void 0;
const httpClient_1 = require("@utils/httpClient");
const asaci_endpoints_1 = require("@config/asaci-endpoints");
class AsaciOrderService {
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
    async createOrder(createOrderDto) {
        return this.httpClient.post(asaci_endpoints_1.ASACI_ENDPOINTS.ORDERS, createOrderDto);
    }
    async getOrders(params) {
        const queryParams = new URLSearchParams();
        if (params?.page)
            queryParams.append('page', params.page.toString());
        if (params?.limit)
            queryParams.append('limit', params.limit.toString());
        const queryString = queryParams.toString();
        const url = queryString ? `${asaci_endpoints_1.ASACI_ENDPOINTS.ORDERS}?${queryString}` : asaci_endpoints_1.ASACI_ENDPOINTS.ORDERS;
        return this.httpClient.get(url);
    }
    async getOrder(reference) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.ORDERS_DETAIL.replace('{reference}', reference);
        return this.httpClient.get(endpoint);
    }
    async updateOrder(reference, updateOrderDto) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.ORDERS_DETAIL.replace('{reference}', reference);
        return this.httpClient.put(endpoint, updateOrderDto);
    }
    async approveOrder(reference) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.ORDERS_APPROVE.replace('{reference}', reference);
        return this.httpClient.post(endpoint);
    }
    async rejectOrder(reference, reason) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.ORDERS_REJECT.replace('{reference}', reference);
        return this.httpClient.post(endpoint, { reason });
    }
    async cancelOrder(reference, reason) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.ORDERS_CANCEL.replace('{reference}', reference);
        return this.httpClient.post(endpoint, { reason });
    }
    async suspendOrder(reference, reason) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.ORDERS_SUSPEND.replace('{reference}', reference);
        return this.httpClient.post(endpoint, { reason });
    }
    async submitOrderForConfirmation(reference) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.ORDERS_SUBMIT_CONFIRMATION.replace('{reference}', reference);
        return this.httpClient.post(endpoint);
    }
    async confirmOrderDelivery(reference) {
        const endpoint = asaci_endpoints_1.ASACI_ENDPOINTS.ORDERS_CONFIRM_DELIVERY.replace('{reference}', reference);
        return this.httpClient.post(endpoint);
    }
    async getOrderStatuses() {
        return this.httpClient.get(asaci_endpoints_1.ASACI_ENDPOINTS.ORDERS_STATUSES);
    }
    async getDeliveredOrdersStatistics() {
        return this.httpClient.get(asaci_endpoints_1.ASACI_ENDPOINTS.ORDERS_STATISTIC_DELIVERED);
    }
}
exports.AsaciOrderService = AsaciOrderService;
//# sourceMappingURL=asaci-order.service.js.map