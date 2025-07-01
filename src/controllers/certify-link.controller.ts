import { Request, Response } from 'express';
import { CertifyLinkService } from '@services/certify-link.service';
import {
    SearchOrassPoliciesDto,
    BulkCreateCertificatesFromOrassDto
} from '@dto/certify-link.dto';
import {AuthenticatedRequest} from "@interfaces/common.interfaces";
import {CreateEditionFromOrassDataRequest} from "@dto/orass.dto";

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

        const result = await this.certifyLinkService.createEditionRequest(createEditionRequest);

        res.status(201).json({
            message: 'Certificate production created successfully from ORASS policy',
            data: result,
            user: req.user?.email
        });
    }

    /**
     * Create multiple certificates from ORASS policies (bulk operation)
     * @route POST /certify-link/certificates/bulk-create
     */
    // async bulkCreateCertificatesFromOrass(req: AuthenticatedRequest, res: Response): Promise<void> {
    //     const bulkDto: BulkCreateCertificatesFromOrassDto = req.body;
    //
    //     const result = await this.certifyLinkService.bulkCreateCertificatesFromOrass(bulkDto);
    //
    //     const statusCode = result.summary.failed === 0 ? 201 : 207; // 207 Multi-Status for partial success
    //
    //     res.status(statusCode).json({
    //         message: `Bulk certificate creation completed. ${result.summary.successful} successful, ${result.summary.failed} failed.`,
    //         data: result,
    //         user: req.user?.email
    //     });
    // }

    /**
     * Get available certificate colors
     * @route GET /certify-link/certificate-colors
     */
    async getAvailableCertificateColors(req: AuthenticatedRequest, res: Response): Promise<void> {
        const colors = await this.certifyLinkService.getAvailableCertificateColors();

        res.status(200).json({
            message: 'Available certificate colors retrieved successfully',
            data: colors,
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

    /**
     * Health check for certify-link service
     * @route GET /certify-link/health
     */
    async healthCheck(req: Request, res: Response): Promise<void> {
        const health = await this.certifyLinkService.healthCheck();

        const statusCode = health.status === 'healthy' ? 200 : 503;

        res.status(statusCode).json(health);
    }
}