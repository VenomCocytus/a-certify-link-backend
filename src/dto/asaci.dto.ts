import {IsString, IsEmail, IsDateString, IsOptional, IsEnum, IsArray, IsNotEmpty, IsNumber} from 'class-validator';
import { IvoryAttestationConstants } from '@/constants/ivoryAttestation';

export class AsaciAttestationEditionRequest {
    @IsString()
    @IsNotEmpty()
    code_compagnie!: string;

    @IsDateString()
    date_demande_edition!: string;

    @IsDateString()
    date_souscription!: string;

    @IsDateString()
    date_effet!: string;

    @IsDateString()
    date_echeance!: string;

    @IsString()
    @IsEnum(Object.values(IvoryAttestationConstants.VEHICLE_GENRES))
    genre_vehicule!: string;

    @IsString()
    @IsNotEmpty()
    numero_immatriculation!: string;

    @IsString()
    @IsEnum(Object.values(IvoryAttestationConstants.VEHICLE_TYPES))
    type_vehicule!: string;

    @IsString()
    @IsNotEmpty()
    model_vehicule!: string;

    @IsString()
    @IsEnum(Object.values(IvoryAttestationConstants.VEHICLE_CATEGORIES))
    categorie_vehicule!: string;

    @IsString()
    @IsEnum(Object.values(IvoryAttestationConstants.VEHICLE_USAGE))
    usage_vehicule!: string;

    @IsString()
    @IsEnum(Object.values(IvoryAttestationConstants.ENERGY_SOURCES))
    source_energie!: string;

    @IsString()
    @IsNotEmpty()
    nombre_place!: string;

    @IsString()
    @IsNotEmpty()
    marque_vehicule!: string;

    @IsString()
    @IsOptional()
    numero_chassis?: string;

    @IsString()
    @IsOptional()
    numero_moteur?: string;

    @IsString()
    @IsNotEmpty()
    numero_carte_brune_physique!: string;

    @IsString()
    @IsOptional()
    numero_rccm?: string;

    @IsString()
    @IsOptional()
    bureau_enregistreur?: string;

    @IsString()
    @IsNotEmpty()
    nom_souscripteur!: string;

    @IsString()
    @IsEnum(Object.values(IvoryAttestationConstants.SUBSCRIBER_TYPES))
    type_souscripteur!: string;

    @IsEmail()
    adresse_mail_souscripteur!: string;

    @IsString()
    @IsNotEmpty()
    numero_telephone_souscripteur!: string;

    @IsString()
    @IsOptional()
    boite_postale_souscripteur?: string;

    @IsString()
    @IsEnum(Object.values(IvoryAttestationConstants.INSURED_TYPES))
    @IsOptional()
    type_assure?: string;

    @IsString()
    @IsNotEmpty()
    nom_assure!: string;

    @IsEmail()
    adresse_mail_assure!: string;

    @IsString()
    @IsOptional()
    boite_postale_assure?: string;

    @IsString()
    @IsNotEmpty()
    numero_police!: string;

    @IsString()
    @IsNotEmpty()
    numero_telephone_assure!: string;

    @IsString()
    @IsEnum(Object.values(IvoryAttestationConstants.PROFESSIONS))
    profession_assure!: string;

    @IsString()
    @IsOptional()
    type_point_vente_compagnie?: string;

    @IsString()
    @IsNotEmpty()
    code_point_vente_compagnie!: string;

    @IsString()
    @IsNotEmpty()
    denomination_point_vente_compagnie!: string;

    @IsString()
    @IsNotEmpty()
    rc!: string;

    @IsString()
    @IsEnum(Object.values(IvoryAttestationConstants.CERTIFICATE_COLORS))
    code_nature_attestation!: string;

    @IsString()
    @IsOptional()
    garantie?: string;

    @IsString()
    @IsOptional()
    contrat?: string;

    @IsString()
    @IsOptional()
    zone_circulation?: string;

    @IsDateString()
    date_premiere_mise_en_circulation!: string;

    @IsString()
    @IsNotEmpty()
    valeur_neuve!: string;

    @IsString()
    @IsNotEmpty()
    valeur_venale!: string;

    @IsString()
    @IsNotEmpty()
    montant_autres_garanties!: string;

    @IsString()
    @IsNotEmpty()
    montant_prime_nette_total!: string;

    @IsString()
    @IsNotEmpty()
    montant_accessoires!: string;

    @IsString()
    @IsNotEmpty()
    montant_taxes!: string;

    @IsString()
    @IsNotEmpty()
    montant_carte_brune!: string;

    @IsString()
    @IsNotEmpty()
    fga!: string;

    @IsString()
    @IsNotEmpty()
    montant_prime_ttc!: string;
}

export class AsaciAttestationEditionResponse {
    @IsNumber()
    statut!: number;

    @IsString()
    @IsOptional()
    numero_demande?: string;

    @IsArray()
    @IsOptional()
    infos?: AsaciAttestationInfo[];
}

export class AsaciAttestationInfo {
    @IsString()
    @IsOptional()
    numero_attestation?: string;

    @IsString()
    @IsOptional()
    lien_telechargement?: string;

    @IsString()
    @IsOptional()
    status?: string;

    numero_immatriculation?: string;
    numero_police?: string;
}

export class AsaciAttestationVerificationRequest {
    @IsString()
    code_demandeur!: string;

    @IsString()
    reference_demande!: string;
}

export class AsaciAttestationVerificationResponse {
    @IsNumber()
    statut!: number;

    @IsString()
    @IsOptional()
    reference_demande?: string;

    message?: string;
}

export class AsaciAttestationUpdateStatusRequest {
    @IsString()
    @IsNotEmpty()
    code_demandeur!: string;

    @IsArray()
    @IsString({ each: true })
    numero_attestation!: string[];

    @IsString()
    @IsEnum(['109', '120']) // Cancel or Suspend
    code_operation!: string;
}

export class AsaciAttestationUpdateStatusResponse {
    @IsNumber()
    statut!: number;

    @IsArray()
    @IsOptional()
    liste_numero_attestation?: string[];

    message?: string;
}

export class CheckAsaciCertificateStatusRequest {
    @IsString()
    @IsNotEmpty()
    reference_demande!: string;
}

export class AsaciAttestationDownloadRequest {
    @IsString()
    @IsNotEmpty()
    code_demandeur!: string;

    @IsString()
    @IsNotEmpty()
    numero_demande!: string;

    @IsString()
    @IsNotEmpty()
    code_compagnie!: string;
}

export class AsaciAttestationDownloadResponse {
    statut: number;
    numero_demande?: string;
    infos?: AsaciAttestationDownloadInfo[];
}

export class AsaciAttestationDownloadInfo {
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

// Status code mappings from the documentation
export interface AsaciAttestationStatusCodes {
    SUCCESS: 0;
    PENDING_GENERATION: 121;
    GENERATING: 122;
    READY_FOR_TRANSFER: 123;
    TRANSFERRED: 124;

    // Error codes
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
    RATE_LIMIT_EXCEEDED: 0; // Special case for -00
}

export interface AsaciAttestationErrorDetails {
    code: number;
    message: string;
    description: string;
    isRetryable: boolean;
}

// Mapping of vehicle data from Orass to AsaciAttestation format
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