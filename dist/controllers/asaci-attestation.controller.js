"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsaciAttestationController = void 0;
class AsaciAttestationController {
    constructor(asaciProductionService, asaciOrderService, asaciCertificateService, asaciTransactionService) {
        this.asaciProductionService = asaciProductionService;
        this.asaciOrderService = asaciOrderService;
        this.asaciCertificateService = asaciCertificateService;
        this.asaciTransactionService = asaciTransactionService;
    }
    // Production Requests
    async createProductionRequest(req, res) {
        const createProductionRequestDto = req.body;
        const result = await this.asaciProductionService.createProductionRequest(createProductionRequestDto);
        res.status(201).json(result);
    }
    async getProductionRequests(req, res) {
        const { page, limit } = req.query;
        const result = await this.asaciProductionService.getProductionRequests({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined
        });
        res.status(200).json(result);
    }
    async downloadProductionZip(req, res) {
        const { reference } = req.params;
        const result = await this.asaciProductionService.downloadProductionZip(reference);
        res.status(200).json(result);
    }
    // Orders
    async createOrder(req, res) {
        const createOrderDto = req.body;
        const result = await this.asaciOrderService.createOrder(createOrderDto);
        res.status(201).json(result);
    }
    async getOrders(req, res) {
        const { page, limit } = req.query;
        const result = await this.asaciOrderService.getOrders({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined
        });
        res.status(200).json(result);
    }
    async getOrder(req, res) {
        const { reference } = req.params;
        const result = await this.asaciOrderService.getOrder(reference);
        res.status(200).json(result);
    }
    async updateOrder(req, res) {
        const { reference } = req.params;
        const updateOrderDto = req.body;
        const result = await this.asaciOrderService.updateOrder(reference, updateOrderDto);
        res.status(200).json(result);
    }
    async approveOrder(req, res) {
        const { reference } = req.params;
        const result = await this.asaciOrderService.approveOrder(reference);
        res.status(200).json(result);
    }
    async rejectOrder(req, res) {
        const { reference } = req.params;
        const { reason } = req.body;
        const result = await this.asaciOrderService.rejectOrder(reference, reason);
        res.status(200).json(result);
    }
    async cancelOrder(req, res) {
        const { reference } = req.params;
        const { reason } = req.body;
        const result = await this.asaciOrderService.cancelOrder(reference, reason);
        res.status(200).json(result);
    }
    async suspendOrder(req, res) {
        const { reference } = req.params;
        const { reason } = req.body;
        const result = await this.asaciOrderService.suspendOrder(reference, reason);
        res.status(200).json(result);
    }
    async submitOrderForConfirmation(req, res) {
        const { reference } = req.params;
        const result = await this.asaciOrderService.submitOrderForConfirmation(reference);
        res.status(200).json(result);
    }
    async confirmOrderDelivery(req, res) {
        const { reference } = req.params;
        const result = await this.asaciOrderService.confirmOrderDelivery(reference);
        res.status(200).json(result);
    }
    // Certificates
    async getCertificates(req, res) {
        const { page, limit } = req.query;
        const result = await this.asaciCertificateService.getCertificates({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined
        });
        res.status(200).json(result);
    }
    async getCertificate(req, res) {
        const { reference } = req.params;
        const result = await this.asaciCertificateService.getCertificate(reference);
        res.status(200).json(result);
    }
    async downloadCertificate(req, res) {
        const { reference } = req.params;
        const result = await this.asaciCertificateService.downloadCertificate(reference);
        res.status(200).json(result);
    }
    async cancelCertificate(req, res) {
        const { reference } = req.params;
        const cancelCertificateDto = req.body;
        const result = await this.asaciCertificateService.cancelCertificate(reference, cancelCertificateDto);
        res.status(200).json(result);
    }
    async suspendCertificate(req, res) {
        const { reference } = req.params;
        const suspendCertificateDto = req.body;
        const result = await this.asaciCertificateService.suspendCertificate(reference, suspendCertificateDto);
        res.status(200).json(result);
    }
    async checkCertificate(req, res) {
        const { reference } = req.params;
        const result = await this.asaciCertificateService.checkCertificate(reference);
        res.status(200).json(result);
    }
    async getCertificateTypes(req, res) {
        const result = await this.asaciCertificateService.getCertificateTypes();
        res.status(200).json(result);
    }
    async getCertificateVariants(req, res) {
        const result = await this.asaciCertificateService.getCertificateVariants();
        res.status(200).json(result);
    }
    // Transactions
    async createTransaction(req, res) {
        const createTransactionDto = req.body;
        const result = await this.asaciTransactionService.createTransaction(createTransactionDto);
        res.status(201).json(result);
    }
    async getTransactions(req, res) {
        const { page, limit } = req.query;
        const result = await this.asaciTransactionService.getTransactions({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined
        });
        res.status(200).json(result);
    }
    async getTransaction(req, res) {
        const { reference } = req.params;
        const result = await this.asaciTransactionService.getTransaction(reference);
        res.status(200).json(result);
    }
    async updateTransaction(req, res) {
        const { reference } = req.params;
        const updateTransactionDto = req.body;
        const result = await this.asaciTransactionService.updateTransaction(reference, updateTransactionDto);
        res.status(200).json(result);
    }
    async approveTransaction(req, res) {
        const { reference } = req.params;
        const result = await this.asaciTransactionService.approveTransaction(reference);
        res.status(200).json(result);
    }
    async rejectTransaction(req, res) {
        const { reference } = req.params;
        const rejectTransactionDto = req.body;
        const result = await this.asaciTransactionService.rejectTransaction(reference, rejectTransactionDto);
        res.status(200).json(result);
    }
    async cancelTransaction(req, res) {
        const { reference } = req.params;
        const cancelTransactionDto = req.body;
        const result = await this.asaciTransactionService.cancelTransaction(reference, cancelTransactionDto);
        res.status(200).json(result);
    }
    // Statistics
    async getCertificateUsageStatistics(req, res) {
        const result = await this.asaciCertificateService.getCertificateUsageStatistics();
        res.status(200).json(result);
    }
    async getAvailableCertificatesStatistics(req, res) {
        const result = await this.asaciCertificateService.getAvailableCertificatesStatistics();
        res.status(200).json(result);
    }
    async getUsedCertificatesStatistics(req, res) {
        const result = await this.asaciCertificateService.getUsedCertificatesStatistics();
        res.status(200).json(result);
    }
}
exports.AsaciAttestationController = AsaciAttestationController;
//# sourceMappingURL=asaci-attestation.controller.js.map