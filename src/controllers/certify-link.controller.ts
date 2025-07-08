import { Response } from 'express';
import { CertifyLinkService } from '@services/certify-link.service';
import {
    SearchOrassPoliciesDto
} from '@dto/certify-link.dto';
import {AuthenticatedRequest} from "@interfaces/middleware.interfaces";
import {CreateEditionFromOrassDataRequest} from "@dto/orass.dto";
import {AsaciRequestStatus} from "@models/asaci-request.model";

export class CertifyLinkController {
    constructor(private readonly certifyLinkService: CertifyLinkService) {}

    /**
     * Search ORASS policies
     * @route GET /certify-link/policies/search
     */
    async searchOrassPolicies(req: AuthenticatedRequest, res: Response): Promise<void> {
        const searchDto: SearchOrassPoliciesDto = {
            policyNumber: req.query.policyNumber as string,
            applicantCode: req.query.applicantCode as string,
            endorsementNumber: req.query.endorsementNumber as string,
            organizationCode: req.query.organizationCode as string,
            officeCode: req.query.officeCode as string,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
            offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        };

        const result = await this.certifyLinkService.searchOrassPolicies(searchDto);

        res.status(200).json({
            message: 'ORASS policies retrieved successfully',
            data: result.policies,
            pagination: {
                total: result.totalCount,
                limit: searchDto.limit,
                offset: searchDto.offset,
                hasMore: result.hasMore
            },
            user: req.user?.email
        });
    }

    /**
     * Create certificate production from ORASS policy
     * @route POST /certify-link/certificates/create
     */
    async createEditionRequestFromOrassPolicy(req: AuthenticatedRequest, res: Response): Promise<void> {
        const createEditionRequest: CreateEditionFromOrassDataRequest = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                message: 'User authentication required',
                error: 'Missing user ID'
            });
            return;
        }

        const result = await this.certifyLinkService.createEditionRequest(createEditionRequest, userId);

        res.status(201).json({
            message: 'Certificate production created successfully from ORASS policy',
            data: result,
            user: req.user?.email
        });
    }

    /**
     * Get attestations from ASACI API filtered by generated_id
     * @route GET /certify-link/attestations
     */
    async getEditionRequestFromAsaci(req: AuthenticatedRequest, res: Response): Promise<void> {
        const result = await this.certifyLinkService.getEditionRequestFromAsaci();

        res.status(200).json({
            message: 'Edition requests retrieved successfully from ASACI',
            data: result.data,
            pagination: result.pagination,
            metadata: result.metadata,
            user: req.user?.email
        });
    }

    /**
     * Get stored ASACI requests for the authenticated user
     * @route GET /certify-link/requests
     */
    async getStoredAsaciRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                message: 'User authentication required',
                error: 'Missing user ID'
            });
            return;
        }

        const filters = {
            status: req.query.status as AsaciRequestStatus,
            certificateType: req.query.certificate_type as string,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
            offset: req.query.offset ? parseInt(req.query.offset as string) : 0
        };

        const result = await this.certifyLinkService.getStoredAsaciRequests(userId, filters);

        res.status(200).json({
            message: 'Stored ASACI requests retrieved successfully',
            data: result.data,
            pagination: result.pagination,
            user: req.user?.email
        });
    }

    /**
     * Get specific ASACI request by ID
     * @route GET /certify-link/requests/:requestId
     */
    async getAsaciRequestById(req: AuthenticatedRequest, res: Response): Promise<void> {
        const requestId = req.params.requestId;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                message: 'User authentication required',
                error: 'Missing user ID'
            });
            return;
        }

        const request = await this.certifyLinkService.getAsaciRequestById(requestId, userId);

        if (!request) {
            res.status(404).json({
                message: 'ASACI request not found',
                error: `No request found with ID: ${requestId}`
            });
            return;
        }

        res.status(200).json({
            message: 'ASACI request retrieved successfully',
            data: request,
            user: req.user?.email
        });
    }

    /**
     * Download certificate and track download count
     * @route POST /certify-link/requests/:requestId/download
     */
    async downloadEditionRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
        const requestId = req.params.requestId;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                message: 'User authentication required',
                error: 'Missing user ID'
            });
            return;
        }

        const result = await this.certifyLinkService.downloadCertificate(requestId, userId);

        res.status(200).json({
            message: 'Certificate download initiated',
            data: result,
            user: req.user?.email
        });
    }

    /**
     * Get user statistics for ASACI requests
     * @route GET /certify-link/statistics/user
     */
    async getUserStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                message: 'User authentication required',
                error: 'Missing user ID'
            });
            return;
        }

        const result = await this.certifyLinkService.getUserStatistics(userId);

        res.status(200).json({
            message: 'User statistics retrieved successfully',
            data: result.data,
            timestamp: result.timestamp,
            user: req.user?.email
        });
    }

    /**
     * Get a certificate download link by ASACI certificate reference/ID (POST version for body data)
     * @route POST /certify-link/certificates/download-link
     */
    async getEditionRequestDownloadLink(req: AuthenticatedRequest, res: Response): Promise<void> {
        const certificateReference = req.params.reference;
        const userId = req.user?.id;

        if (!certificateReference) {
            res.status(400).json({
                message: 'Certificate reference is required',
                error: 'Missing certificateReference in request body'
            });
            return;
        }

        const result = await this.certifyLinkService.getEditionRequestDownloadLink(certificateReference, userId);

        res.status(200).json({
            message: 'Certificate download link retrieved successfully',
            data: result,
            user: req.user?.email
        });
    }

    /**
     * Batch get certificate download links by multiple ASACI certificate references
     * @route POST /certify-link/certificates/batch-download-links
     */
    async getBatchEditionRequestDownloadLinks(req: AuthenticatedRequest, res: Response): Promise<void> {
        const { certificateReferences } = req.body;
        const userId = req.user?.id;

        if (!certificateReferences || !Array.isArray(certificateReferences) || certificateReferences.length === 0) {
            res.status(400).json({
                message: 'Certificate references array is required',
                error: 'Missing or invalid certificateReferences in request body'
            });
            return;
        }

        if (certificateReferences.length > 50) {
            res.status(400).json({
                message: 'Too many certificate references',
                error: 'Maximum 50 certificate references allowed per batch request'
            });
            return;
        }

        const result = await this.certifyLinkService.getBatchCertificateDownloadLinks(certificateReferences, userId);

        const statusCode = result.summary.failed === 0 ? 200 : 207; // 207 Multi-Status for partial success

        res.status(statusCode).json({
            message: result.message,
            data: result,
            user: req.user?.email
        });
    }

    /**
     * Get ORASS statistics
     * @route GET /certify-link/statistics
     */
    async getOrassStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
        const statistics = await this.certifyLinkService.getOrassStatistics();

        res.status(200).json({
            message: 'ORASS statistics retrieved successfully',
            data: statistics,
            user: req.user?.email
        });
    }
}