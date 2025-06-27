import { Request, Response } from 'express';
import { CertifyLinkService } from '@services/certify-link.service';
import {
    SearchOrassPoliciesDto,
    CreateCertificateFromOrassDto,
    BulkCreateCertificatesFromOrassDto,
    ValidateOrassPolicyDto
} from '@dto/certify-link.dto';
import {AuthenticatedRequest} from "@interfaces/common.interfaces";

export class CertifyLinkController {
    constructor(private readonly certifyLinkService: CertifyLinkService) {}

    /**
     * Search ORASS policies
     * @route GET /certify-link/policies/search
     */
    async searchOrassPolicies(req: AuthenticatedRequest, res: Response): Promise<void> {
        const searchDto: SearchOrassPoliciesDto = {
            policyNumber: req.query.policyNumber as string,
            vehicleRegistration: req.query.vehicleRegistration as string,
            vehicleChassisNumber: req.query.vehicleChassisNumber as string,
            subscriberName: req.query.subscriberName as string,
            insuredName: req.query.insuredName as string,
            organizationCode: req.query.organizationCode as string,
            officeCode: req.query.officeCode as string,
            contractStartDate: req.query.contractStartDate as string,
            contractEndDate: req.query.contractEndDate as string,
            certificateColor: req.query.certificateColor as string,
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
     * Get ORASS policy by policy number
     * @route GET /certify-link/policies/:policyNumber
     */
    async getOrassPolicyByNumber(req: AuthenticatedRequest, res: Response): Promise<void> {
        const { policyNumber } = req.params;

        const policy = await this.certifyLinkService.getOrassPolicyByNumber(policyNumber);

        if (!policy) {
            res.status(404).json({
                type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
                title: 'Policy Not Found',
                status: 404,
                detail: `ORASS policy with number ${policyNumber} was not found`,
                instance: req.originalUrl,
            });
            return;
        }

        res.status(200).json({
            message: 'ORASS policy retrieved successfully',
            data: policy,
            user: req.user?.email
        });
    }

    /**
     * Validate ORASS policy for certificate creation
     * @route POST /certify-link/policies/validate
     */
    async validateOrassPolicy(req: AuthenticatedRequest, res: Response): Promise<void> {
        const validateDto: ValidateOrassPolicyDto = req.body;

        const result = await this.certifyLinkService.validateOrassPolicy(validateDto);

        res.status(200).json({
            message: 'Policy validation completed',
            data: {
                isValid: result.isValid,
                policy: result.policy,
                errors: result.errors
            },
            user: req.user?.email
        });
    }

    /**
     * Create certificate production from ORASS policy
     * @route POST /certify-link/certificates/create
     */
    async createCertificateFromOrassPolicy(req: AuthenticatedRequest, res: Response): Promise<void> {
        const createDto: CreateCertificateFromOrassDto = req.body;

        const result = await this.certifyLinkService.createCertificateFromOrassPolicy(createDto);

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
    async bulkCreateCertificatesFromOrass(req: AuthenticatedRequest, res: Response): Promise<void> {
        const bulkDto: BulkCreateCertificatesFromOrassDto = req.body;

        const result = await this.certifyLinkService.bulkCreateCertificatesFromOrass(bulkDto);

        const statusCode = result.summary.failed === 0 ? 201 : 207; // 207 Multi-Status for partial success

        res.status(statusCode).json({
            message: `Bulk certificate creation completed. ${result.summary.successful} successful, ${result.summary.failed} failed.`,
            data: result,
            user: req.user?.email
        });
    }

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

    /**
     * Get policies by vehicle registration (convenience endpoint)
     * @route GET /certify-link/policies/by-vehicle/:vehicleRegistration
     */
    async getPoliciesByVehicleRegistration(req: AuthenticatedRequest, res: Response): Promise<void> {
        const { vehicleRegistration } = req.params;

        const result = await this.certifyLinkService.searchOrassPolicies({
            vehicleRegistration,
            limit: 100,
            offset: 0
        });

        res.status(200).json({
            message: 'ORASS policies by vehicle registration retrieved successfully',
            data: result.policies,
            pagination: {
                total: result.totalCount,
                hasMore: result.hasMore
            },
            user: req.user?.email
        });
    }

    /**
     * Get policies by chassis number (convenience endpoint)
     * @route GET /certify-link/policies/by-chassis/:chassisNumber
     */
    async getPoliciesByChassisNumber(req: AuthenticatedRequest, res: Response): Promise<void> {
        const { chassisNumber } = req.params;

        const result = await this.certifyLinkService.searchOrassPolicies({
            vehicleChassisNumber: chassisNumber,
            limit: 100,
            offset: 0
        });

        res.status(200).json({
            message: 'ORASS policies by chassis number retrieved successfully',
            data: result.policies,
            pagination: {
                total: result.totalCount,
                hasMore: result.hasMore
            },
            user: req.user?.email
        });
    }

    /**
     * Preview certificate data before creation
     * @route POST /certify-link/certificates/preview
     */
    async previewCertificateData(req: AuthenticatedRequest, res: Response): Promise<void> {
        const { policyNumber, certificateType } = req.body;

        if (!policyNumber || !certificateType) {
            res.status(400).json({
                type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
                title: 'Bad Request',
                status: 400,
                detail: 'Policy number and certificate type are required',
                instance: req.originalUrl,
            });
            return;
        }

        // Validate policy first
        const validation = await this.certifyLinkService.validateOrassPolicy({ policyNumber });

        if (!validation.isValid || !validation.policy) {
            res.status(400).json({
                type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
                title: 'Policy Validation Failed',
                status: 400,
                detail: 'Policy validation failed',
                instance: req.originalUrl,
                errors: validation.errors
            });
            return;
        }

        // Create preview data (without actually creating the certificate)
        const previewData = {
            policy: validation.policy,
            certificateType,
            mappedFields: {
                office_code: validation.policy.officeCode,
                organization_code: validation.policy.organizationCode,
                certificate_type: certificateType,
                vehicle_info: {
                    registration: validation.policy.vehicleRegistration,
                    chassis: validation.policy.vehicleChassisNumber,
                    brand: validation.policy.vehicleBrand,
                    model: validation.policy.vehicleModel,
                    type: validation.policy.vehicleType
                },
                contract_info: {
                    start_date: validation.policy.contractStartDate,
                    end_date: validation.policy.contractEndDate,
                    premium: validation.policy.premiumRC
                }
            }
        };

        res.status(200).json({
            message: 'Certificate preview data generated successfully',
            data: previewData,
            user: req.user?.email
        });
    }
}