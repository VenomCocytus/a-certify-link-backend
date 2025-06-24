import { Request, Response } from 'express';
import { AsaciProductionService } from '@services/asaci-production.service';
import { AsaciOrderService } from '@services/asaci-order.service';
import { AsaciCertificateService } from '@services/asaci-certificate.service';
import { AsaciTransactionService } from '@services/asaci-transaction.service';
import {
    CreateProductionRequestDto,
    CreateOrderDto,
    UpdateOrderDto,
    CancelCertificateDto,
    SuspendCertificateDto,
    CreateTransactionDto,
    UpdateTransactionDto,
    RejectTransactionDto,
    CancelTransactionDto
} from '../dto/asaci.dto';

export class AsaciAttestationController {
    constructor(
        private readonly asaciProductionService: AsaciProductionService,
        private readonly asaciOrderService: AsaciOrderService,
        private readonly asaciCertificateService: AsaciCertificateService,
        private readonly asaciTransactionService: AsaciTransactionService
    ) {}

    // Production Requests
    async createProductionRequest(req: Request, res: Response): Promise<void> {
        const createProductionRequestDto: CreateProductionRequestDto = req.body;
        const result = await this.asaciProductionService.createProductionRequest(createProductionRequestDto);
        res.status(201).json(result);
    }

    async getProductionRequests(req: Request, res: Response): Promise<void> {
        const { page, limit } = req.query;
        const result = await this.asaciProductionService.getProductionRequests({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined
        });
        res.status(200).json(result);
    }

    async downloadProductionZip(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const result = await this.asaciProductionService.downloadProductionZip(reference);
        res.status(200).json(result);
    }

    // Orders
    async createOrder(req: Request, res: Response): Promise<void> {
        const createOrderDto: CreateOrderDto = req.body;
        const result = await this.asaciOrderService.createOrder(createOrderDto);
        res.status(201).json(result);
    }

    async getOrders(req: Request, res: Response): Promise<void> {
        const { page, limit } = req.query;
        const result = await this.asaciOrderService.getOrders({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined
        });
        res.status(200).json(result);
    }

    async getOrder(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const result = await this.asaciOrderService.getOrder(reference);
        res.status(200).json(result);
    }

    async updateOrder(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const updateOrderDto: UpdateOrderDto = req.body;
        const result = await this.asaciOrderService.updateOrder(reference, updateOrderDto);
        res.status(200).json(result);
    }

    async approveOrder(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const result = await this.asaciOrderService.approveOrder(reference);
        res.status(200).json(result);
    }

    async rejectOrder(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const { reason } = req.body;
        const result = await this.asaciOrderService.rejectOrder(reference, reason);
        res.status(200).json(result);
    }

    async cancelOrder(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const { reason } = req.body;
        const result = await this.asaciOrderService.cancelOrder(reference, reason);
        res.status(200).json(result);
    }

    async suspendOrder(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const { reason } = req.body;
        const result = await this.asaciOrderService.suspendOrder(reference, reason);
        res.status(200).json(result);
    }

    async submitOrderForConfirmation(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const result = await this.asaciOrderService.submitOrderForConfirmation(reference);
        res.status(200).json(result);
    }

    async confirmOrderDelivery(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const result = await this.asaciOrderService.confirmOrderDelivery(reference);
        res.status(200).json(result);
    }

    // Certificates
    async getCertificates(req: Request, res: Response): Promise<void> {
        const { page, limit } = req.query;
        const result = await this.asaciCertificateService.getCertificates({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined
        });
        res.status(200).json(result);
    }

    async getCertificate(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const result = await this.asaciCertificateService.getCertificate(reference);
        res.status(200).json(result);
    }

    async downloadCertificate(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const result = await this.asaciCertificateService.downloadCertificate(reference);
        res.status(200).json(result);
    }

    async cancelCertificate(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const cancelCertificateDto: CancelCertificateDto = req.body;
        const result = await this.asaciCertificateService.cancelCertificate(reference, cancelCertificateDto);
        res.status(200).json(result);
    }

    async suspendCertificate(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const suspendCertificateDto: SuspendCertificateDto = req.body;
        const result = await this.asaciCertificateService.suspendCertificate(reference, suspendCertificateDto);
        res.status(200).json(result);
    }

    async checkCertificate(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const result = await this.asaciCertificateService.checkCertificate(reference);
        res.status(200).json(result);
    }

    async getCertificateTypes(req: Request, res: Response): Promise<void> {
        const result = await this.asaciCertificateService.getCertificateTypes();
        res.status(200).json(result);
    }

    async getCertificateVariants(req: Request, res: Response): Promise<void> {
        const result = await this.asaciCertificateService.getCertificateVariants();
        res.status(200).json(result);
    }

    // Transactions
    async createTransaction(req: Request, res: Response): Promise<void> {
        const createTransactionDto: CreateTransactionDto = req.body;
        const result = await this.asaciTransactionService.createTransaction(createTransactionDto);
        res.status(201).json(result);
    }

    async getTransactions(req: Request, res: Response): Promise<void> {
        const { page, limit } = req.query;
        const result = await this.asaciTransactionService.getTransactions({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined
        });
        res.status(200).json(result);
    }

    async getTransaction(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const result = await this.asaciTransactionService.getTransaction(reference);
        res.status(200).json(result);
    }

    async updateTransaction(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const updateTransactionDto: UpdateTransactionDto = req.body;
        const result = await this.asaciTransactionService.updateTransaction(reference, updateTransactionDto);
        res.status(200).json(result);
    }

    async approveTransaction(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const result = await this.asaciTransactionService.approveTransaction(reference);
        res.status(200).json(result);
    }

    async rejectTransaction(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const rejectTransactionDto: RejectTransactionDto = req.body;
        const result = await this.asaciTransactionService.rejectTransaction(reference, rejectTransactionDto);
        res.status(200).json(result);
    }

    async cancelTransaction(req: Request, res: Response): Promise<void> {
        const { reference } = req.params;
        const cancelTransactionDto: CancelTransactionDto = req.body;
        const result = await this.asaciTransactionService.cancelTransaction(reference, cancelTransactionDto);
        res.status(200).json(result);
    }

    // Statistics
    async getCertificateUsageStatistics(req: Request, res: Response): Promise<void> {
        const result = await this.asaciCertificateService.getCertificateUsageStatistics();
        res.status(200).json(result);
    }

    async getAvailableCertificatesStatistics(req: Request, res: Response): Promise<void> {
        const result = await this.asaciCertificateService.getAvailableCertificatesStatistics();
        res.status(200).json(result);
    }

    async getUsedCertificatesStatistics(req: Request, res: Response): Promise<void> {
        const result = await this.asaciCertificateService.getUsedCertificatesStatistics();
        res.status(200).json(result);
    }
}