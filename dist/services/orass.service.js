"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrassService = void 0;
const httpClient_1 = require("@utils/httpClient");
const circuitBreaker_1 = require("@utils/circuitBreaker");
const environment_1 = require("@config/environment");
const externalApi_exception_1 = require("@exceptions/externalApi.exception");
const logger_1 = require("@utils/logger");
class OrassService {
    constructor() {
        this.authToken = null;
        this.tokenExpiresAt = null;
        this.httpClient = new httpClient_1.HttpClient({
            baseURL: environment_1.Environment.ORASS_BASE_URL,
            timeout: environment_1.Environment.ORASS_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
    }
    /**
     * Authenticate with an Orass system
     */
    async authenticate() {
        const circuitBreaker = (0, circuitBreaker_1.orassCircuitBreaker)(async () => {
            try {
                const response = await this.httpClient.post('/auth/login', {
                    apiKey: environment_1.Environment.ORASS_API_KEY,
                    timestamp: new Date().toISOString(),
                });
                this.authToken = response.token;
                this.tokenExpiresAt = new Date(Date.now() + (response.expiresIn * 1000));
                this.httpClient.setAuthToken(this.authToken);
                logger_1.logger.info('Successfully authenticated with Orass');
                return this.authToken;
            }
            catch (error) {
                logger_1.logger.error('Orass authentication failed:', error);
                throw externalApi_exception_1.ExternalApiException.orassAuthenticationError();
            }
        });
        return circuitBreaker.fire();
    }
    /**
     * Get policy by policy number
     */
    async getPolicyByNumber(policyNumber) {
        await this.ensureAuthenticated();
        const circuitBreaker = (0, circuitBreaker_1.orassCircuitBreaker)(async () => {
            try {
                const response = await this.httpClient.get(`/policies/${encodeURIComponent(policyNumber)}`);
                if (!response.success) {
                    logger_1.logger.warn(`Policy not found in Orass: ${policyNumber}`);
                    return null;
                }
                return response.data;
            }
            catch (error) {
                if (error.response?.status === 404) {
                    return null;
                }
                logger_1.logger.error(`Failed to fetch policy from Orass: ${policyNumber}`, error);
                throw externalApi_exception_1.ExternalApiException.orassConnectionError(error);
            }
        });
        return circuitBreaker.fire();
    }
    /**
     * Get insured by ID
     */
    async getInsuredById(insuredId) {
        await this.ensureAuthenticated();
        const circuitBreaker = (0, circuitBreaker_1.orassCircuitBreaker)(async () => {
            try {
                const response = await this.httpClient.get(`/insured/${encodeURIComponent(insuredId)}`);
                if (!response.success) {
                    logger_1.logger.warn(`Insured not found in Orass: ${insuredId}`);
                    return null;
                }
                return response.data;
            }
            catch (error) {
                if (error.response?.status === 404) {
                    return null;
                }
                logger_1.logger.error(`Failed to fetch insured from Orass: ${insuredId}`, error);
                throw externalApi_exception_1.ExternalApiException.orassConnectionError(error);
            }
        });
        return circuitBreaker.fire();
    }
    /**
     * Search policies with pagination
     */
    async searchPolicies(params) {
        await this.ensureAuthenticated();
        const circuitBreaker = (0, circuitBreaker_1.orassCircuitBreaker)(async () => {
            try {
                const queryParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParams.append(key, value.toString());
                    }
                });
                const response = await this.httpClient.get(`/policies?${queryParams.toString()}`);
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
            }
            catch (error) {
                logger_1.logger.error('Failed to search policies in Orass:', error);
                throw externalApi_exception_1.ExternalApiException.orassConnectionError(error);
            }
        });
        return circuitBreaker.fire();
    }
    /**
     * Validate policy for certificate creation
     */
    async validatePolicyForCertificate(policyNumber) {
        const policy = await this.getPolicyByNumber(policyNumber);
        if (!policy) {
            return {
                isValid: false,
                errors: ['Policy not found'],
            };
        }
        const errors = [];
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
    async checkConnection() {
        try {
            const response = await this.httpClient.get('/health');
            return true;
        }
        catch (error) {
            logger_1.logger.error('Orass connection check failed:', error);
            return false;
        }
    }
    /**
     * Refresh authentication token
     */
    async refreshToken() {
        this.authToken = null;
        this.tokenExpiresAt = null;
        return this.authenticate();
    }
    // Private helper methods
    async ensureAuthenticated() {
        if (!this.authToken || !this.tokenExpiresAt || this.tokenExpiresAt <= new Date()) {
            await this.authenticate();
        }
    }
}
exports.OrassService = OrassService;
//# sourceMappingURL=orass.service.js.map