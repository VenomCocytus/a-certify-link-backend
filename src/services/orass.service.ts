import { OrassServiceInterface } from '@interfaces/serviceInterfaces';
import {
    OrassPolicyData,
    OrassInsuredData,
    OrassQueryParams,
    OrassApiResponse,
    OrassAuthResponse
} from '@interfaces/orass.interfaces';
import { PaginatedResponse } from '@interfaces/common.interfaces';
import { HttpClient } from '@utils/httpClient';
import { orassCircuitBreaker } from '@utils/circuitBreaker';
import { Environment } from '@config/environment';
import { ExternalApiException } from '@exceptions/externalApi.exception';
import { logger } from '@utils/logger';

export class OrassService implements OrassServiceInterface {
    private httpClient: HttpClient;
    private authToken: string | null = null;
    private tokenExpiresAt: Date | null = null;

    constructor() {
        this.httpClient = new HttpClient({
            baseURL: Environment.ORASS_BASE_URL,
            timeout: Environment.ORASS_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
    }

    /**
     * Authenticate with an Orass system
     */
    async authenticate(): Promise<string> {
        const circuitBreaker = orassCircuitBreaker(async () => {
            try {
                const response = await this.httpClient.post<OrassAuthResponse>('/auth/login', {
                    apiKey: Environment.ORASS_API_KEY,
                    timestamp: new Date().toISOString(),
                });

                this.authToken = response.token;
                this.tokenExpiresAt = new Date(Date.now() + (response.expiresIn * 1000));
                this.httpClient.setAuthToken(this.authToken);

                logger.info('Successfully authenticated with Orass');
                return this.authToken;
            } catch (error) {
                logger.error('Orass authentication failed:', error);
                throw ExternalApiException.orassAuthenticationError();
            }
        });

        return circuitBreaker.fire();
    }

    /**
     * Get policy by policy number
     */
    async getPolicyByNumber(policyNumber: string): Promise<OrassPolicyData | null> {
        await this.ensureAuthenticated();

        const circuitBreaker = orassCircuitBreaker(async () => {
            try {
                const response = await this.httpClient.get<OrassApiResponse<OrassPolicyData>>(
                    `/policies/${encodeURIComponent(policyNumber)}`
                );

                if (!response.success) {
                    logger.warn(`Policy not found in Orass: ${policyNumber}`);
                    return null;
                }

                return response.data;
            } catch (error) {
                if ((error as any).response?.status === 404) {
                    return null;
                }
                logger.error(`Failed to fetch policy from Orass: ${policyNumber}`, error);
                throw ExternalApiException.orassConnectionError(error as Error);
            }
        });

        return circuitBreaker.fire();
    }

    /**
     * Get insured by ID
     */
    async getInsuredById(insuredId: string): Promise<OrassInsuredData | null> {
        await this.ensureAuthenticated();

        const circuitBreaker = orassCircuitBreaker(async () => {
            try {
                const response = await this.httpClient.get<OrassApiResponse<OrassInsuredData>>(
                    `/insured/${encodeURIComponent(insuredId)}`
                );

                if (!response.success) {
                    logger.warn(`Insured not found in Orass: ${insuredId}`);
                    return null;
                }

                return response.data;
            } catch (error) {
                if ((error as any).response?.status === 404) {
                    return null;
                }
                logger.error(`Failed to fetch insured from Orass: ${insuredId}`, error);
                throw ExternalApiException.orassConnectionError(error as Error);
            }
        });

        return circuitBreaker.fire();
    }

    /**
     * Search policies with pagination
     */
    async searchPolicies(params: OrassQueryParams): Promise<PaginatedResponse<OrassPolicyData>> {
        await this.ensureAuthenticated();

        const circuitBreaker = orassCircuitBreaker(async () => {
            try {
                const queryParams = new URLSearchParams();

                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParams.append(key, value.toString());
                    }
                });

                const response = await this.httpClient.get<OrassApiResponse<{
                    data: OrassPolicyData[];
                    pagination: {
                        totalItems: number;
                        currentPage: number;
                        totalPages: number;
                        pageSize: number;
                    };
                }>>(`/policies?${queryParams.toString()}`);

                if (!response.success) {
                    throw new Error('Failed to search policies');
                }

                return {
                    data: response.data.data,
                    meta: {
                        totalItems: response.data.pagination.totalItems,
                        currentPage: response.data.pagination.currentPage,
                        totalPages: response.data.pagination.totalPages,
                        pageSize: response.data.pagination.pageSize,
                        itemsPerPage: response.data.pagination.pageSize,
                    },
                };
            } catch (error) {
                logger.error('Failed to search policies in Orass:', error);
                throw ExternalApiException.orassConnectionError(error as Error);
            }
        });

        return circuitBreaker.fire();
    }

    /**
     * Validate policy for certificate creation
     */
    async validatePolicyForCertificate(policyNumber: string): Promise<{ isValid: boolean; errors: string[] }> {
        const policy = await this.getPolicyByNumber(policyNumber);

        if (!policy) {
            return {
                isValid: false,
                errors: ['Policy not found'],
            };
        }

        const errors: string[] = [];

        // Check policy status
        if (policy.status !== 'active') {
            errors.push(`Policy status is ${policy.status}, must be active`);
        }

        // Check if policy is not expired
        const now = new Date();
        const expirationDate = new Date(policy.expirationDate);
        if (expirationDate <= now) {
            errors.push('Policy has expired');
        }

        // Check if the policy is effective
        const effectiveDate = new Date(policy.effectiveDate);
        if (effectiveDate > now) {
            errors.push('Policy is not yet effective');
        }

        // Check required fields
        if (!policy.vehicleRegistration) {
            errors.push('Vehicle registration number is missing');
        }

        if (!policy.insuredId) {
            errors.push('Insured ID is missing');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * Check connection to Orass
     */
    async checkConnection(): Promise<boolean> {
        try {
            const response = await this.httpClient.get('/health');
            return true;
        } catch (error) {
            logger.error('Orass connection check failed:', error);
            return false;
        }
    }

    /**
     * Refresh authentication token
     */
    async refreshToken(): Promise<string> {
        this.authToken = null;
        this.tokenExpiresAt = null;
        return this.authenticate();
    }

    // Private helper methods

    private async ensureAuthenticated(): Promise<void> {
        if (!this.authToken || !this.tokenExpiresAt || this.tokenExpiresAt <= new Date()) {
            await this.authenticate();
        }
    }
}