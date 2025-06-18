import {IvoryAttestationServiceInterface} from '@interfaces/serviceInterfaces';
import {
    AsaciAttestationEditionRequest,
    AsaciAttestationEditionResponse,
    AsaciAttestationUpdateStatusRequest,
    AsaciAttestationUpdateStatusResponse,
    AsaciAttestationVerificationRequest,
    AsaciAttestationVerificationResponse,
} from '@interfaces/ivoryAttestation.interfaces';
import {HttpClient} from '@utils/httpClient';
import {ivoryAttestationCircuitBreaker} from '@utils/circuitBreaker';
import {Environment} from '@config/environment';
import {IvoryAttestationConstants} from '@/constants/ivoryAttestation';
import {ExternalApiException} from '@exceptions/externalApi.exception';
import {ValidationException} from '@exceptions/validation.exception';
import {logger} from '@utils/logger';
import {ErrorCodes} from "@/constants/errorCodes";

// Define the type for the validation entries
interface CodeValidation {
    field: keyof AsaciAttestationEditionRequest;
    validValues: string[];
}

export class IvoryAttestationService implements IvoryAttestationServiceInterface {
    private httpClient: HttpClient;

    constructor() {
        this.httpClient = new HttpClient({
            baseURL: Environment.IVORY_ATTESTATION_BASE_URL,
            timeout: Environment.IVORY_ATTESTATION_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Environment.IVORY_ATTESTATION_TOKEN,
                'Charset': 'UTF-8',
            },
        });
    }

    /**
     * Create digital attestation
     */
    async createAttestation(request: AsaciAttestationEditionRequest): Promise<AsaciAttestationEditionResponse> {
        // Validate request before submission
        const validation = await this.validateRequest(request);
        if (!validation.isValid) {
            throw new ValidationException('Invalid IvoryAttestation request', {
                errors: validation.errors,
            });
        }

        const circuitBreaker = ivoryAttestationCircuitBreaker(async () => {
            try {
                const response = await this.httpClient.post<AsaciAttestationEditionResponse>(
                    IvoryAttestationConstants.ENDPOINTS.EDITION,
                    request
                );

                logger.info('IvoryAttestation edition response received', {
                    status: response.statut,
                    requestNumber: response.numero_demande,
                });

                return response;
            } catch (error) {
                logger.error('IvoryAttestation edition request failed:', error);
                throw ExternalApiException.ivoryAttestationConnectionError(error as Error);
            }
        });

        return circuitBreaker.fire();
    }

    /**
     * Check attestation status
     */
    async checkAttestationStatus(request: AsaciAttestationVerificationRequest): Promise<AsaciAttestationVerificationResponse> {
        const circuitBreaker = ivoryAttestationCircuitBreaker(async () => {
            try {
                return await this.httpClient.post<AsaciAttestationVerificationResponse>(
                    IvoryAttestationConstants.ENDPOINTS.VERIFICATION,
                    request
                );
            } catch (error) {
                logger.error('IvoryAttestation status check failed:', error);
                throw ExternalApiException.ivoryAttestationConnectionError(error as Error);
            }
        });

        return circuitBreaker.fire();
    }

    /**
     * Update attestation status (cancel/suspend)
     */
    async updateAttestationStatus(request: AsaciAttestationUpdateStatusRequest): Promise<AsaciAttestationUpdateStatusResponse> {
        const circuitBreaker = ivoryAttestationCircuitBreaker(async () => {
            try {
                const response = await this.httpClient.post<AsaciAttestationUpdateStatusResponse>(
                    IvoryAttestationConstants.ENDPOINTS.UPDATE_STATUS,
                    request
                );

                if (response.statut !== IvoryAttestationConstants.STATUS_CODES.SUCCESS) {
                    throw new ExternalApiException(
                        'IvoryAttestation',
                        `Status update failed: ${this.getStatusCodeDescription(response.statut)}`,
                        ErrorCodes.IVORY_ATTESTATION_UPDATE_FAILED
                    );
                }

                return response;
            } catch (error) {
                logger.error('IvoryAttestation status update failed:', error);
                throw ExternalApiException.ivoryAttestationConnectionError(error as Error);
            }
        });

        return circuitBreaker.fire();
    }

    /**
     * Download attestation files
     */
    async downloadAttestation(companyCode: string, requestNumber: string): Promise<{ url: string; type: string }[]> {
        const circuitBreaker = ivoryAttestationCircuitBreaker(async () => {
            try {
                const response = await this.httpClient.post<any>(
                    IvoryAttestationConstants.ENDPOINTS.DOWNLOAD,
                    {
                        code_demandeur: 'SYSTEM', // Should be configurable
                        code_compagnie: companyCode,
                        numero_demande: requestNumber,
                    }
                );

                if (response.statut !== IvoryAttestationConstants.STATUS_CODES.SUCCESS) {
                    throw new ExternalApiException(
                        'IvoryAttestation',
                        `Download failed: ${this.getStatusCodeDescription(response.statut)}`,
                        ErrorCodes.IVORY_ATTESTATION_DOWNLOAD_FAILED
                    );
                }

                // Map response to download links
                const downloadLinks: { url: string; type: string }[] = [];

                if (response.infos && Array.isArray(response.infos)) {
                    response.infos.forEach((info: any) => {
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
            } catch (error) {
                logger.error('IvoryAttestation download failed:', error);
                throw ExternalApiException.ivoryAttestationConnectionError(error as Error);
            }
        });

        return circuitBreaker.fire();
    }

    /**
     * Validate IvoryAttestation request
     */
    async validateRequest(request: AsaciAttestationEditionRequest): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];

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
            if (!request[field as keyof AsaciAttestationEditionRequest]) {
                errors.push(`${field} is required`);
            }
        });

        // Date format validation
        const dateFields = ['date_demande_edition', 'date_souscription', 'date_effet', 'date_echeance'];
        dateFields.forEach(field => {
            const value = request[field as keyof AsaciAttestationEditionRequest] as string;
            if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                errors.push(`${field} must be in YYYY-MM-DD format`);
            }
        });

        // Email validation
        const emailFields = ['adresse_mail_souscripteur', 'adresse_mail_assure'];
        emailFields.forEach(field => {
            const value = request[field as keyof AsaciAttestationEditionRequest] as string;
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errors.push(`${field} must be a valid email address`);
            }
        });

        // Code validation against constants
        const codeValidations: CodeValidation[] = [
            { field: 'genre_vehicule', validValues: Object.values(IvoryAttestationConstants.VEHICLE_GENRES) as string[] },
            { field: 'type_vehicule', validValues: Object.values(IvoryAttestationConstants.VEHICLE_TYPES) as string[] },
            { field: 'categorie_vehicule', validValues: Object.values(IvoryAttestationConstants.VEHICLE_CATEGORIES) as string[] },
            { field: 'usage_vehicule', validValues: Object.values(IvoryAttestationConstants.VEHICLE_USAGE) as string[] },
            { field: 'source_energie', validValues: Object.values(IvoryAttestationConstants.ENERGY_SOURCES) as string[] },
            { field: 'type_souscripteur', validValues: Object.values(IvoryAttestationConstants.SUBSCRIBER_TYPES) as string[] },
            { field: 'profession_assure', validValues: Object.values(IvoryAttestationConstants.PROFESSIONS) as string[] },
            { field: 'code_nature_attestation', validValues: Object.values(IvoryAttestationConstants.CERTIFICATE_COLORS) as string[] },
        ];

        codeValidations.forEach(({ field, validValues }) => {
            const value = request[field as keyof AsaciAttestationEditionRequest] as string;
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
    async checkConnection(): Promise<boolean> {
        try {
            // Simple health check - try to make a minimal request
            const testRequest = {
                code_demandeur: 'HEALTH_CHECK',
                reference_demande: 'HC001',
            };

            await this.httpClient.post(IvoryAttestationConstants.ENDPOINTS.VERIFICATION, testRequest);
            return true;
        } catch (error) {
            logger.error('IvoryAttestation connection check failed:', error);
            return false;
        }
    }

    /**
     * Get a human-readable description for status code
     */
    getStatusCodeDescription(statusCode: number): string {
        const descriptions: Record<number, string> = {
            [IvoryAttestationConstants.STATUS_CODES.SUCCESS]: 'Operation completed successfully',
            [IvoryAttestationConstants.STATUS_CODES.PENDING]: 'Attestation generation pending',
            [IvoryAttestationConstants.STATUS_CODES.GENERATING]: 'Attestation being generated',
            [IvoryAttestationConstants.STATUS_CODES.READY_FOR_TRANSFER]: 'Attestation ready for transfer',
            [IvoryAttestationConstants.STATUS_CODES.TRANSFERRED]: 'Attestation transferred successfully',

            // Error codes
            [IvoryAttestationConstants.STATUS_CODES.UNAUTHORIZED]: 'Unauthorized to use the edition API',
            [IvoryAttestationConstants.STATUS_CODES.DUPLICATE_EXISTS]: 'Duplicate attestation exists in database',
            [IvoryAttestationConstants.STATUS_CODES.INVALID_CIRCULATION_ZONE]: 'Invalid circulation zone code',
            [IvoryAttestationConstants.STATUS_CODES.INVALID_SUBSCRIBER_TYPE]: 'Invalid subscriber type code',
            [IvoryAttestationConstants.STATUS_CODES.INVALID_INSURED_TYPE]: 'Invalid insured type code',
            [IvoryAttestationConstants.STATUS_CODES.INVALID_PROFESSION]: 'Invalid profession code',
            [IvoryAttestationConstants.STATUS_CODES.INVALID_VEHICLE_TYPE]: 'Invalid vehicle type code',
            [IvoryAttestationConstants.STATUS_CODES.INVALID_VEHICLE_USAGE]: 'Invalid vehicle usage code',
            [IvoryAttestationConstants.STATUS_CODES.INVALID_VEHICLE_GENRE]: 'Invalid vehicle genre code',
            [IvoryAttestationConstants.STATUS_CODES.INVALID_ENERGY_SOURCE]: 'Invalid energy source code',
            [IvoryAttestationConstants.STATUS_CODES.INVALID_VEHICLE_CATEGORY]: 'Invalid vehicle category code',
            [IvoryAttestationConstants.STATUS_CODES.NO_INTERMEDIARY_RELATION]: 'No relationship between intermediary and company',
            [IvoryAttestationConstants.STATUS_CODES.INVALID_INSURED_EMAIL]: 'Invalid insured email address',
            [IvoryAttestationConstants.STATUS_CODES.INVALID_SUBSCRIBER_EMAIL]: 'Invalid subscriber email address',
            [IvoryAttestationConstants.STATUS_CODES.INVALID_CERTIFICATE_COLOR]: 'Invalid certificate color code',
            [IvoryAttestationConstants.STATUS_CODES.INVALID_SUBSCRIPTION_DATE]: 'Subscription date is before edition request date',
            [IvoryAttestationConstants.STATUS_CODES.INVALID_EFFECT_DATE]: 'Effect date is before subscription date',
            [IvoryAttestationConstants.STATUS_CODES.INVALID_DATE_FORMAT]: 'Invalid date format',
            [IvoryAttestationConstants.STATUS_CODES.DATA_ERROR]: 'Data error in request',
            [IvoryAttestationConstants.STATUS_CODES.SYSTEM_ERROR]: 'System error',
            [IvoryAttestationConstants.STATUS_CODES.SAVE_ERROR]: 'Save error',
            [IvoryAttestationConstants.STATUS_CODES.EDITION_FAILED]: 'Edition failed',
            [IvoryAttestationConstants.STATUS_CODES.AUTHORIZATION_ERROR]: 'Certificate authorization error',
            [IvoryAttestationConstants.STATUS_CODES.AUTHENTICATION_ERROR]: 'Authentication error',
            [IvoryAttestationConstants.STATUS_CODES.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded, please try again later',
        };

        return descriptions[statusCode] || `Unknown status code: ${statusCode}`;
    }
}