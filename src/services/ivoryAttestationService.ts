import {IvoryAttestationServiceInterface} from '../interfaces/serviceInterfaces';
import {
    IvoryAttestationEditionRequest,
    IvoryAttestationEditionResponse,
    IvoryAttestationUpdateStatusRequest,
    IvoryAttestationUpdateStatusResponse,
    IvoryAttestationVerificationRequest,
    IvoryAttestationVerificationResponse,
} from '@interfaces/ivoryAttestationInterfaces';
import {HttpClient} from '@utils/httpClient';
import {ivoryAttestationCircuitBreaker} from '@utils/circuitBreaker';
import {Environment} from '@config/environment';
import {IvoryAttestationConstants} from '@/constants/ivoryAttestation';
import {ExternalApiException} from '@exceptions/externalApiException';
import {ValidationException} from '@exceptions/validationException';
import {logger} from '@utils/logger';

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
    async createAttestation(request: IvoryAttestationEditionRequest): Promise<IvoryAttestationEditionResponse> {
        // Validate request before submission
        const validation = await this.validateRequest(request);
        if (!validation.isValid) {
            throw new ValidationException('Invalid IvoryAttestation request', {
                errors: validation.errors,
            });
        }

        const circuitBreaker = ivoryAttestationCircuitBreaker(async () => {
            try {
                const response = await this.httpClient.post<IvoryAttestationEditionResponse>(
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

        return circuitBreaker();
    }

    /**
     * Check attestation status
     */
    async checkAttestationStatus(request: IvoryAttestationVerificationRequest): Promise<IvoryAttestationVerificationResponse> {
        const circuitBreaker = ivoryAttestationCircuitBreaker(async () => {
            try {
                return await this.httpClient.post<IvoryAttestationVerificationResponse>(
                    IvoryAttestationConstants.ENDPOINTS.VERIFICATION,
                    request
                );
            } catch (error) {
                logger.error('IvoryAttestation status check failed:', error);
                throw ExternalApiException.ivoryAttestationConnectionError(error as Error);
            }
        });

        return circuitBreaker();
    }

    /**
     * Update attestation status (cancel/suspend)
     */
    async updateAttestationStatus(request: IvoryAttestationUpdateStatusRequest): Promise<IvoryAttestationUpdateStatusResponse> {
        const circuitBreaker = ivoryAttestationCircuitBreaker(async () => {
            try {
                const response = await this.httpClient.post<IvoryAttestationUpdateStatusResponse>(
                    IvoryAttestationConstants.ENDPOINTS.UPDATE_STATUS,
                    request
                );

                if (response.statut !== IvoryAttestationConstants.STATUS_CODES.SUCCESS) {
                    throw new ExternalApiException(
                        'IvoryAttestation',
                        `Status update failed: ${this.getStatusCodeDescription(response.statut)}`,
                        'IVORY_ATTESTATION_UPDATE_FAILED'
                    );
                }

                return response;
            } catch (error) {
                logger.error('IvoryAttestation status update failed:', error);
                throw ExternalApiException.ivoryAttestationConnectionError(error as Error);
            }
        });

        return circuitBreaker();
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
                        'IVORY_ATTESTATION_DOWNLOAD_FAILED'
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

        return circuitBreaker();
    }

    /**
     * Validate IvoryAttestation request
     */
    async validateRequest(request: IvoryAttestationEditionRequest): Promise<{ isValid: boolean; errors: string[] }> {
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
            if (!request[field as keyof IvoryAttestationEditionRequest]) {
                errors.push(`${field} is required`);
            }
        });

        // Date format validation
        const dateFields = ['date_demande_edition', 'date_souscription', 'date_effet', 'date_echeance'];
        dateFields.forEach(field => {
            const value = request[field as keyof IvoryAttestationEditionRequest] as string;
            if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                errors.push(`${field} must be in YYYY-MM-DD format`);
            }
        });

        // Email validation
        const emailFields = ['adresse_mail_souscripteur', 'adresse_mail_assure'];
        emailFields.forEach(field => {
            const value = request[field as keyof IvoryAttestationEditionRequest] as string;
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errors.push(`${field} must# Business Logic Services