export declare class AsaciAttestationEditionRequest {
    code_compagnie: string;
    date_demande_edition: string;
    date_souscription: string;
    date_effet: string;
    date_echeance: string;
    genre_vehicule: string;
    numero_immatriculation: string;
    type_vehicule: string;
    model_vehicule: string;
    categorie_vehicule: string;
    usage_vehicule: string;
    source_energie: string;
    nombre_place: string;
    marque_vehicule: string;
    numero_chassis?: string;
    numero_moteur?: string;
    numero_carte_brune_physique: string;
    numero_rccm?: string;
    bureau_enregistreur?: string;
    nom_souscripteur: string;
    type_souscripteur: string;
    adresse_mail_souscripteur: string;
    numero_telephone_souscripteur: string;
    boite_postale_souscripteur?: string;
    type_assure?: string;
    nom_assure: string;
    adresse_mail_assure: string;
    boite_postale_assure?: string;
    numero_police: string;
    numero_telephone_assure: string;
    profession_assure: string;
    type_point_vente_compagnie?: string;
    code_point_vente_compagnie: string;
    denomination_point_vente_compagnie: string;
    rc: string;
    code_nature_attestation: string;
    garantie?: string;
    contrat?: string;
    zone_circulation?: string;
    date_premiere_mise_en_circulation: string;
    valeur_neuve: string;
    valeur_venale: string;
    montant_autres_garanties: string;
    montant_prime_nette_total: string;
    montant_accessoires: string;
    montant_taxes: string;
    montant_carte_brune: string;
    fga: string;
    montant_prime_ttc: string;
}
export declare class AsaciAttestationEditionResponse {
    statut: number;
    numero_demande?: string;
    infos?: AsaciAttestationInfo[];
}
export declare class AsaciAttestationInfo {
    numero_attestation?: string;
    lien_telechargement?: string;
    status?: string;
    numero_immatriculation?: string;
    numero_police?: string;
}
export declare class AsaciAttestationVerificationRequest {
    code_demandeur: string;
    reference_demande: string;
}
export declare class AsaciAttestationVerificationResponse {
    statut: number;
    reference_demande?: string;
    message?: string;
}
export declare class AsaciAttestationUpdateStatusRequest {
    code_demandeur: string;
    numero_attestation: string[];
    code_operation: string;
}
export declare class AsaciAttestationUpdateStatusResponse {
    statut: number;
    liste_numero_attestation?: string[];
    message?: string;
}
export declare class CheckAsaciCertificateStatusRequest {
    reference_demande: string;
}
export declare class AsaciAttestationDownloadRequest {
    code_demandeur: string;
    numero_demande: string;
    code_compagnie: string;
}
export declare class AsaciAttestationDownloadResponse {
    statut: number;
    numero_demande?: string;
    infos?: AsaciAttestationDownloadInfo[];
}
export declare class AsaciAttestationDownloadInfo {
    numero_attestation: string;
    lien_telechargement: string;
    type_fichier: 'PDF' | 'IMAGE' | 'QRCODE';
}
export interface AsaciAttestationApiHeaders {
    'Content-Type': 'application/json';
    'Authorization': string;
    'Charset': 'UTF-8';
}
export interface AsaciAttestationAuthConfig {
    token: string;
    companyCode: string;
    requesterId: string;
}
export interface AsaciAttestationStatusCodes {
    SUCCESS: 0;
    PENDING_GENERATION: 121;
    GENERATING: 122;
    READY_FOR_TRANSFER: 123;
    TRANSFERRED: 124;
    UNAUTHORIZED: -36;
    DUPLICATE_EXISTS: -35;
    INVALID_CIRCULATION_ZONE: -34;
    INVALID_SUBSCRIBER_TYPE: -33;
    INVALID_INSURED_TYPE: -32;
    INVALID_PROFESSION: -31;
    INVALID_VEHICLE_TYPE: -30;
    INVALID_VEHICLE_USAGE: -29;
    INVALID_VEHICLE_GENRE: -28;
    INVALID_ENERGY_SOURCE: -27;
    INVALID_VEHICLE_CATEGORY: -26;
    NO_INTERMEDIARY_RELATION: -25;
    INVALID_INSURED_EMAIL: -24;
    INVALID_SUBSCRIBER_EMAIL: -23;
    INVALID_CERTIFICATE_COLOR: -22;
    INVALID_SUBSCRIPTION_DATE: -21;
    INVALID_EFFECT_DATE: -20;
    INVALID_DATE_FORMAT: -19;
    DATA_ERROR: -18;
    SYSTEM_ERROR: -17;
    SAVE_ERROR: -16;
    EDITION_FAILED: -15;
    AUTHORIZATION_ERROR: -14;
    AUTHENTICATION_ERROR: -13;
    INCORRECT_ACCESS_CODE: -12;
    INVALID_FILE_FORMAT: -11;
    INVALID_FILE_STRUCTURE: -10;
    INVALID_FILE_DATA: -9;
    INCORRECT_AUTHENTICATION: -8;
    DATE_ERROR: -7;
    CONTRACT_DURATION_ERROR: -6;
    COMPANY_STOCK_ERROR: -5;
    INTERMEDIARY_STOCK_ERROR: -4;
    INVALID_INTERMEDIARY_CODE: -3;
    INVALID_COMPANY_CODE: -2;
    DUPLICATE_ERROR: -1;
    RATE_LIMIT_EXCEEDED: 0;
}
export interface AsaciAttestationErrorDetails {
    code: number;
    message: string;
    description: string;
    isRetryable: boolean;
}
export interface VehicleDataMapping {
    orassField: string;
    ivoryField: string;
    transformer?: (value: any) => string;
    required: boolean;
    defaultValue?: string;
}
export interface CertificateDownloadLink {
    url: string;
    type: 'PDF' | 'IMAGE' | 'QRCODE';
    expiresAt?: Date;
    fileName: string;
}
export interface AsaciAttestationMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    lastRequestTime: Date;
    circuitBreakerStatus: 'closed' | 'open' | 'half-open';
}
//# sourceMappingURL=asaci.dto.d.ts.map