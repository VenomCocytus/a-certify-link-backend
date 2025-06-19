"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IvoryAttestationService = void 0;
const httpClient_1 = require("@utils/httpClient");
const circuitBreaker_1 = require("@utils/circuitBreaker");
const environment_1 = require("@config/environment");
const ivoryAttestation_1 = require("@/constants/ivoryAttestation");
const externalApi_exception_1 = require("@exceptions/externalApi.exception");
const validation_exception_1 = require("@exceptions/validation.exception");
const logger_1 = require("@utils/logger");
const errorCodes_1 = require("@/constants/errorCodes");
class IvoryAttestationService {
    constructor() {
        this.httpClient = new httpClient_1.HttpClient({
            baseURL: environment_1.Environment.IVORY_ATTESTATION_BASE_URL,
            timeout: environment_1.Environment.IVORY_ATTESTATION_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': environment_1.Environment.IVORY_ATTESTATION_TOKEN,
                'Charset': 'UTF-8',
            },
        });
    }
    /**
     * Create digital attestation
     */
    async createAttestation(request) {
        // Validate request before submission
        const validation = await this.validateRequest(request);
        if (!validation.isValid) {
            throw new validation_exception_1.ValidationException('Invalid IvoryAttestation request', {
                errors: validation.errors,
            });
        }
        const circuitBreaker = (0, circuitBreaker_1.ivoryAttestationCircuitBreaker)(async () => {
            try {
                const response = await this.httpClient.post(ivoryAttestation_1.IvoryAttestationConstants.ENDPOINTS.EDITION, request);
                logger_1.logger.info('IvoryAttestation edition response received', {
                    status: response.statut,
                    requestNumber: response.numero_demande,
                });
                return response;
            }
            catch (error) {
                logger_1.logger.error('IvoryAttestation edition request failed:', error);
                throw externalApi_exception_1.ExternalApiException.ivoryAttestationConnectionError(error);
            }
        });
        return circuitBreaker.fire();
    }
    /**
     * Check attestation status
     */
    async checkAttestationStatus(request) {
        const circuitBreaker = (0, circuitBreaker_1.ivoryAttestationCircuitBreaker)(async () => {
            try {
                return await this.httpClient.post(ivoryAttestation_1.IvoryAttestationConstants.ENDPOINTS.VERIFICATION, request);
            }
            catch (error) {
                logger_1.logger.error('IvoryAttestation status check failed:', error);
                throw externalApi_exception_1.ExternalApiException.ivoryAttestationConnectionError(error);
            }
        });
        return circuitBreaker.fire();
    }
    /**
     * Update attestation status (cancel/suspend)
     */
    async updateAttestationStatus(request) {
        const circuitBreaker = (0, circuitBreaker_1.ivoryAttestationCircuitBreaker)(async () => {
            try {
                const response = await this.httpClient.post(ivoryAttestation_1.IvoryAttestationConstants.ENDPOINTS.UPDATE_STATUS, request);
                if (response.statut !== ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.SUCCESS) {
                    throw new externalApi_exception_1.ExternalApiException('IvoryAttestation', `Status update failed: ${this.getStatusCodeDescription(response.statut)}`, errorCodes_1.ErrorCodes.IVORY_ATTESTATION_UPDATE_FAILED);
                }
                return response;
            }
            catch (error) {
                logger_1.logger.error('IvoryAttestation status update failed:', error);
                throw externalApi_exception_1.ExternalApiException.ivoryAttestationConnectionError(error);
            }
        });
        return circuitBreaker.fire();
    }
    /**
     * Download attestation files
     */
    async downloadAttestation(companyCode, requestNumber) {
        const circuitBreaker = (0, circuitBreaker_1.ivoryAttestationCircuitBreaker)(async () => {
            try {
                const response = await this.httpClient.post(ivoryAttestation_1.IvoryAttestationConstants.ENDPOINTS.DOWNLOAD, {
                    code_demandeur: 'SYSTEM', // Should be configurable
                    code_compagnie: companyCode,
                    numero_demande: requestNumber,
                });
                if (response.statut !== ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.SUCCESS) {
                    throw new externalApi_exception_1.ExternalApiException('IvoryAttestation', `Download failed: ${this.getStatusCodeDescription(response.statut)}`, errorCodes_1.ErrorCodes.IVORY_ATTESTATION_DOWNLOAD_FAILED);
                }
                // Map response to download links
                const downloadLinks = [];
                if (response.infos && Array.isArray(response.infos)) {
                    response.infos.forEach((info) => {
                        if (info.lien_telechargement) {
                            // Generate different types of download links
                            downloadLinks.push({
                                url: `${info.lien_telechargement}&type=1`, // PDF
                                type: 'PDF',
                            });
                            downloadLinks.push({
                                url: `${info.lien_telechargement}&type=2`, // IMAGE
                                type: 'IMAGE',
                            });
                            downloadLinks.push({
                                url: `${info.lien_telechargement}&type=3`, // QRCODE
                                type: 'QRCODE',
                            });
                        }
                    });
                }
                return downloadLinks;
            }
            catch (error) {
                logger_1.logger.error('IvoryAttestation download failed:', error);
                throw externalApi_exception_1.ExternalApiException.ivoryAttestationConnectionError(error);
            }
        });
        return circuitBreaker.fire();
    }
    /**
     * Validate IvoryAttestation request
     */
    async validateRequest(request) {
        const errors = [];
        // Required fields validation
        const requiredFields = [
            'code_compagnie',
            'date_demande_edition',
            'date_souscription',
            'date_effet',
            'date_echeance',
            'genre_vehicule',
            'numero_immatriculation',
            'type_vehicule',
            'model_vehicule',
            'categorie_vehicule',
            'usage_vehicule',
            'source_energie',
            'marque_vehicule',
            'numero_carte_brune_physique',
            'nom_souscripteur',
            'type_souscripteur',
            'adresse_mail_souscripteur',
            'numero_telephone_souscripteur',
            'nom_assure',
            'adresse_mail_assure',
            'numero_police',
            'numero_telephone_assure',
            'profession_assure',
            'code_point_vente_compagnie',
            'denomination_point_vente_compagnie',
            'rc',
            'code_nature_attestation',
        ];
        requiredFields.forEach(field => {
            if (!request[field]) {
                errors.push(`${field} is required`);
            }
        });
        // Date format validation
        const dateFields = ['date_demande_edition', 'date_souscription', 'date_effet', 'date_echeance'];
        dateFields.forEach(field => {
            const value = request[field];
            if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                errors.push(`${field} must be in YYYY-MM-DD format`);
            }
        });
        // Email validation
        const emailFields = ['adresse_mail_souscripteur', 'adresse_mail_assure'];
        emailFields.forEach(field => {
            const value = request[field];
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errors.push(`${field} must be a valid email address`);
            }
        });
        // Code validation against constants
        const codeValidations = [
            { field: 'genre_vehicule', validValues: Object.values(ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_GENRES) },
            { field: 'type_vehicule', validValues: Object.values(ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_TYPES) },
            { field: 'categorie_vehicule', validValues: Object.values(ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_CATEGORIES) },
            { field: 'usage_vehicule', validValues: Object.values(ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_USAGE) },
            { field: 'source_energie', validValues: Object.values(ivoryAttestation_1.IvoryAttestationConstants.ENERGY_SOURCES) },
            { field: 'type_souscripteur', validValues: Object.values(ivoryAttestation_1.IvoryAttestationConstants.SUBSCRIBER_TYPES) },
            { field: 'profession_assure', validValues: Object.values(ivoryAttestation_1.IvoryAttestationConstants.PROFESSIONS) },
            { field: 'code_nature_attestation', validValues: Object.values(ivoryAttestation_1.IvoryAttestationConstants.CERTIFICATE_COLORS) },
        ];
        codeValidations.forEach(({ field, validValues }) => {
            const value = request[field];
            if (value && !validValues.includes(value)) {
                errors.push(`${field} value '${value}' is not valid`);
            }
        });
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    /**
     * Check connection to IvoryAttestation
     */
    async checkConnection() {
        try {
            // Simple health check - try to make a minimal request
            const testRequest = {
                code_demandeur: 'HEALTH_CHECK',
                reference_demande: 'HC001',
            };
            await this.httpClient.post(ivoryAttestation_1.IvoryAttestationConstants.ENDPOINTS.VERIFICATION, testRequest);
            return true;
        }
        catch (error) {
            logger_1.logger.error('IvoryAttestation connection check failed:', error);
            return false;
        }
    }
    /**
     * Get a human-readable description for status code
     */
    getStatusCodeDescription(statusCode) {
        const descriptions = {
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.SUCCESS]: 'Operation completed successfully',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.PENDING]: 'Attestation generation pending',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.GENERATING]: 'Attestation being generated',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.READY_FOR_TRANSFER]: 'Attestation ready for transfer',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.TRANSFERRED]: 'Attestation transferred successfully',
            // Error codes
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.UNAUTHORIZED]: 'Unauthorized to use the edition API',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.DUPLICATE_EXISTS]: 'Duplicate attestation exists in database',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.INVALID_CIRCULATION_ZONE]: 'Invalid circulation zone code',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.INVALID_SUBSCRIBER_TYPE]: 'Invalid subscriber type code',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.INVALID_INSURED_TYPE]: 'Invalid insured type code',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.INVALID_PROFESSION]: 'Invalid profession code',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.INVALID_VEHICLE_TYPE]: 'Invalid vehicle type code',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.INVALID_VEHICLE_USAGE]: 'Invalid vehicle usage code',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.INVALID_VEHICLE_GENRE]: 'Invalid vehicle genre code',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.INVALID_ENERGY_SOURCE]: 'Invalid energy source code',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.INVALID_VEHICLE_CATEGORY]: 'Invalid vehicle category code',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.NO_INTERMEDIARY_RELATION]: 'No relationship between intermediary and company',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.INVALID_INSURED_EMAIL]: 'Invalid insured email address',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.INVALID_SUBSCRIBER_EMAIL]: 'Invalid subscriber email address',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.INVALID_CERTIFICATE_COLOR]: 'Invalid certificate color code',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.INVALID_SUBSCRIPTION_DATE]: 'Subscription date is before edition request date',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.INVALID_EFFECT_DATE]: 'Effect date is before subscription date',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.INVALID_DATE_FORMAT]: 'Invalid date format',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.DATA_ERROR]: 'Data error in request',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.SYSTEM_ERROR]: 'System error',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.SAVE_ERROR]: 'Save error',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.EDITION_FAILED]: 'Edition failed',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.AUTHORIZATION_ERROR]: 'Certificate authorization error',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.AUTHENTICATION_ERROR]: 'Authentication error',
            [ivoryAttestation_1.IvoryAttestationConstants.STATUS_CODES.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded, please try again later',
        };
        return descriptions[statusCode] || `Unknown status code: ${statusCode}`;
    }
}
exports.IvoryAttestationService = IvoryAttestationService;
//# sourceMappingURL=ivoryAttestation.service.js.map