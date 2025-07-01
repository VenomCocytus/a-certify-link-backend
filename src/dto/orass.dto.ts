import {
    IsDateString, IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString, Matches,
    Max,
    MaxLength,
    Min, MinLength,
    ValidateIf, ValidateNested
} from "class-validator";
import { Transform, Type } from 'class-transformer';
import {
    VehicleCategory, CertificateColor, CertificateType, ChannelType,
    VehicleEnergy,
    VehicleGenre,
    SubscriberType,
    VehicleType,
    VehicleUsage
} from "@interfaces/common.enum";

//TODO: clean this class
export class OrassConnectionConfig {
    host: string;
    port: number;
    sid: string;
    username: string;
    password: string;
    connectionTimeout?: number;
    requestTimeout?: number;
}

export class OrassServiceManagerConfig {
    host: string;
    port: number;
    sid: string;
    username: string;
    password: string;
    connectionTimeout?: number;
    requestTimeout?: number;
    autoConnect?: boolean;
}

export interface OrassPolicyResponse {
    policyNumber: string;
    organizationCode: string;
    officeCode: string;
    certificateType: CertificateType;
    emailNotification: string;
    generatedBy: string;
    channel: ChannelType;
    certificateColor: CertificateColor;
    subscriberName: string;
    subscriberPhone: string;
    subscriberEmail: string;
    subscriberPoBox: string;
    insuredName: string;
    insuredPhone: string;
    insuredEmail: string;
    insuredPoBox: string;
    vehicleRegistrationNumber: string;
    vehicleChassisNumber: string;
    vehicleBrand: string;
    vehicleModel: string;
    vehicleType: string;
    vehicleCategory: string;
    vehicleUsage: string;
    vehicleGenre: string;
    vehicleEnergy: string;
    vehicleSeats: number;
    vehicleFiscalPower: number;
    vehicleUsefulLoad: number;
    fleetReduction: number;
    subscriberType: string;
    premiumRC: number;
    policyEffectiveDate: Date;
    policyExpiryDate: Date;
    rNum: number;
    opATD: string;
}

/**
 * Validation class for ORASS Policy Response to create ASACI edition request
 * Based on the OrassPolicyResponse interface
 */
//TODO: Turn some fields to uppercase if necessary
export class CreateEditionFromOrassDataRequest {
    @IsString({message: 'Le numéro de police doit être une chaîne de caractères.'})
    @IsNotEmpty({message: 'Le numéro de police est requis.'})
    @MaxLength(50, {message: 'Le numéro de police ne peut pas contenir plus de 50 caractères.'})
    // @Transform(({value}) => value.trim())
    policyNumber: string;

    @IsString({message: 'Le code organisation doit être une chaîne de caractères.'})
    @IsNotEmpty({message: 'Le code organisation est requis.'})
    @MaxLength(50, {message: 'Le code organisation ne peut pas contenir plus de 50 caractères.'})
    // @Transform(({value}) => value?.trim().toUpperCase())
    organizationCode: string;

    @IsString()
    @IsNotEmpty()
    officeCode: string;

    @IsEnum(CertificateType, {message: 'Le type de certificat doit être une valeur valide (cima, pooltpv, matca, pooltpvbleu).'})
    @IsNotEmpty({message: 'Le type de certificat est requis.'})
    certificateType: CertificateType;

    @IsOptional()
    @IsEmail({}, {message: 'L\'adresse email de notification doit être valide.'})
    @MaxLength(255, {message: 'L\'email de notification ne peut pas contenir plus de 255 caractères.'})
    // @Transform(({value}) => value?.trim().toLowerCase())
    emailNotification?: string;

    @IsOptional()
    @IsString({message: 'Le champ généré par doit être une chaîne de caractères.'})
    @MaxLength(100, {message: 'Le champ généré par ne peut pas contenir plus de 100 caractères.'})
    // @Transform(({value}) => value?.trim())
    generatedBy?: string;

    @IsEnum(ChannelType, {message: 'Le canal doit être "api" ou "web".'})
    @IsNotEmpty({message: 'Le canal est requis.'})
    channel: ChannelType;

    @IsEnum(CertificateColor, {message: 'La couleur du certificat doit être une valeur valide.'})
    @IsNotEmpty({message: 'La couleur du certificat est requise.'})
    certificateColor: CertificateColor;

    // Subscriber Information
    @IsString({message: 'Le nom du souscripteur doit être une chaîne de caractères.'})
    @IsNotEmpty({message: 'Le nom du souscripteur est requis.'})
    @MaxLength(255, {message: 'Le nom du souscripteur ne peut pas contenir plus de 255 caractères.'})
    @MinLength(2, {message: 'Le nom du souscripteur doit contenir au moins 2 caractères.'})
    // @Transform(({value}) => value?.trim().toUpperCase())
    subscriberName: string;

    @IsString({message: 'Le téléphone du souscripteur doit être une chaîne de caractères.'})
    @IsNotEmpty({message: 'Le téléphone du souscripteur est requis.'})
    @Matches(/^\+?[1-9]\d{1,14}$/, {message: 'Le numéro de téléphone du souscripteur doit être un numéro valide (format international recommandé).'})
    // @Transform(({value}) => value?.trim())
    subscriberPhone: string;

    @IsEmail({}, {message: 'L\'adresse email du souscripteur doit être valide.'})
    @IsNotEmpty({message: 'L\'email du souscripteur est requis.'})
    @MaxLength(255, {message: 'L\'email du souscripteur ne peut pas contenir plus de 255 caractères.'})
    // @Transform(({value}) => value?.trim().toLowerCase())
    subscriberEmail: string;

    @IsString({message: 'La boîte postale du souscripteur doit être une chaîne de caractères.'})
    @IsNotEmpty({message: 'La boîte postale du souscripteur est requise.'})
    @MaxLength(50, {message: 'La boîte postale du souscripteur ne peut pas contenir plus de 50 caractères.'})
    // @Transform(({value}) => value?.trim().toUpperCase())
    subscriberPoBox: string;

    // Insured Information
    @IsString({message: 'Le nom de l\'assuré doit être une chaîne de caractères.'})
    @IsNotEmpty({message: 'Le nom de l\'assuré est requis.'})
    @MaxLength(255, {message: 'Le nom de l\'assuré ne peut pas contenir plus de 255 caractères.'})
    @MinLength(2, {message: 'Le nom de l\'assuré doit contenir au moins 2 caractères.'})
    // @Transform(({value}) => value?.trim().toUpperCase())
    insuredName: string;

    @IsString({message: 'Le téléphone de l\'assuré doit être une chaîne de caractères.'})
    @IsNotEmpty({message: 'Le téléphone de l\'assuré est requis.'})
    @Matches(/^\+?[1-9]\d{1,14}$/, {message: 'Le numéro de téléphone de l\'assuré doit être un numéro valide (format international recommandé).'})
    // @Transform(({value}) => value?.trim())
    insuredPhone: string;

    @IsEmail({}, {message: 'L\'adresse email de l\'assuré doit être valide.'})
    @IsNotEmpty({message: 'L\'email de l\'assuré est requis.'})
    @MaxLength(255, {message: 'L\'email de l\'assuré ne peut pas contenir plus de 255 caractères.'})
    // @Transform(({value}) => value?.trim().toLowerCase())
    insuredEmail: string;

    @IsString({message: 'La boîte postale de l\'assuré doit être une chaîne de caractères.'})
    @IsNotEmpty({message: 'La boîte postale de l\'assuré est requise.'})
    @MaxLength(50, {message: 'La boîte postale de l\'assuré ne peut pas contenir plus de 50 caractères.'})
    // @Transform(({value}) => value?.trim().toUpperCase())
    insuredPoBox: string;

    // Vehicle Information
    @IsString({message: 'Le numéro d\'immatriculation doit être une chaîne de caractères.'})
    @IsNotEmpty({message: 'Le numéro d\'immatriculation est requis.'})
    @MaxLength(20, {message: 'Le numéro d\'immatriculation ne peut pas contenir plus de 20 caractères.'})
    // @Transform(({value}) => value?.trim().toUpperCase())
    vehicleRegistrationNumber: string;

    @IsString({message: 'Le numéro de châssis doit être une chaîne de caractères.'})
    @IsNotEmpty({message: 'Le numéro de châssis est requis.'})
    @MaxLength(50, {message: 'Le numéro de châssis ne peut pas contenir plus de 50 caractères.'})
    @MinLength(10, {message: 'Le numéro de châssis doit contenir au moins 10 caractères.'})
    // @Transform(({value}) => value?.trim().toUpperCase())
    vehicleChassisNumber: string;

    @IsString({message: 'La marque du véhicule doit être une chaîne de caractères.'})
    @IsNotEmpty({message: 'La marque du véhicule est requise.'})
    @MaxLength(50, {message: 'La marque du véhicule ne peut pas contenir plus de 50 caractères.'})
    // @Transform(({value}) => value?.trim().toUpperCase())
    vehicleBrand: string;

    @IsString({message: 'Le modèle du véhicule doit être une chaîne de caractères.'})
    @IsNotEmpty({message: 'Le modèle du véhicule est requis.'})
    @MaxLength(100, {message: 'Le modèle du véhicule ne peut pas contenir plus de 100 caractères.'})
    // @Transform(({value}) => value?.trim())
    vehicleModel: string;

    @IsEnum(VehicleType, {message: 'Le type de véhicule doit être une valeur valide.'})
    @IsNotEmpty({message: 'Le type de véhicule est requis.'})
    vehicleType: VehicleType;

    @IsEnum(VehicleCategory, {message: 'La catégorie de véhicule doit être une valeur valide.'})
    @IsNotEmpty({message: 'La catégorie de véhicule est requise.'})
    vehicleCategory: VehicleCategory;

    @IsEnum(VehicleUsage, {message: 'L\'usage du véhicule doit être une valeur valide.'})
    @IsNotEmpty({message: 'L\'usage du véhicule est requis.'})
    vehicleUsage: VehicleUsage;

    @IsEnum(VehicleGenre, {message: 'Le genre du véhicule doit être une valeur valide.'})
    @IsNotEmpty({message: 'Le genre du véhicule est requis.'})
    vehicleGenre: VehicleGenre;

    @IsEnum(VehicleEnergy, {message: 'L\'énergie du véhicule doit être une valeur valide.'})
    @IsNotEmpty({message: 'L\'énergie du véhicule est requise.'})
    vehicleEnergy: VehicleEnergy;

    @IsInt({message: 'Le nombre de places doit être un nombre entier.'})
    @IsNotEmpty({message: 'Le nombre de places est requis.'})
    @Min(1, {message: 'Le nombre de places doit être au moins 1.'})
    @Max(100, {message: 'Le nombre de places ne peut pas être supérieur à 100.'})
    @Type(() => Number)
    vehicleSeats: number;

    @IsNumber({}, {message: 'La puissance fiscale doit être un nombre.'})
    @IsNotEmpty({message: 'La puissance fiscale est requise.'})
    @Min(1, {message: 'La puissance fiscale doit être au moins 1.'})
    @Max(50, {message: 'La puissance fiscale ne peut pas être supérieure à 50.'})
    @Type(() => Number)
    vehicleFiscalPower: number;

    @IsNumber({}, {message: 'La charge utile doit être un nombre.'})
    @Min(0, {message: 'La charge utile ne peut pas être négative.'})
    @Max(100000, {message: 'La charge utile ne peut pas être supérieure à 100000.'})
    @Type(() => Number)
    vehicleUsefulLoad: number;

    @IsNumber({}, {message: 'La réduction flotte doit être un nombre.'})
    @Min(0, {message: 'La réduction flotte ne peut pas être négative.'})
    @Max(100, {message: 'La réduction flotte ne peut pas être supérieure à 100.'})
    @Type(() => Number)
    fleetReduction: number;

    @IsEnum(SubscriberType, {message: 'Le type de souscripteur doit être une valeur valide.'})
    @IsNotEmpty({message: 'Le type de souscripteur est requis.'})
    subscriberType: SubscriberType;

    @IsNumber({}, {message: 'La prime RC doit être un nombre.'})
    @IsNotEmpty({message: 'La prime RC est requise.'})
    @Min(1, {message: 'La prime RC doit être au moins 1.'})
    @Max(10000000, {message: 'La prime RC ne peut pas être supérieure à 10,000,000.'})
    @Type(() => Number)
    premiumRC: number;

    @IsDateString({}, {message: 'La date d\'effet doit être au format ISO 8601 (YYYY-MM-DD).'})
    @IsNotEmpty({message: 'La date d\'effet du contrat est requise.'})
    @Transform(({value}) => {
        if (value instanceof Date) {
            return value.toISOString().split('T')[0];
        }
        return value;
    })
    policyEffectiveDate: string;

    @IsDateString({}, {message: 'La date d\'échéance doit être au format ISO 8601 (YYYY-MM-DD).'})
    @IsNotEmpty({message: 'La date d\'échéance du contrat est requise.'})
    @Transform(({value}) => {
        if (value instanceof Date) {
            return value.toISOString().split('T')[0];
        }
        return value;
    })
    policyExpiryDate: string;

    @IsInt({message: 'Le numéro R doit être un nombre entier.'})
    @IsNotEmpty({message: 'Le numéro R est requis.'})
    @Min(1, {message: 'Le numéro R doit être au moins 1.'})
    @Type(() => Number)
    rNum: number;

    @IsOptional()
    @IsString({message: 'L\'OP ATD doit être une chaîne de caractères.'})
    @MaxLength(50, {message: 'L\'OP ATD ne peut pas contenir plus de 50 caractères.'})
    // @Transform(({value}) => value?.trim().toUpperCase())
    opATD?: string;

    /**
     * Custom validation to ensure policy expiry date is after effective date
     */
    @ValidateIf((obj) => obj.policyEffectiveDate && obj.policyExpiryDate)
    get isValidDateRange(): boolean {
        if (!this.policyEffectiveDate || !this.policyExpiryDate) {
            return true; // Let individual field validations handle empty values
        }

        const effectiveDate = new Date(this.policyEffectiveDate);
        const expiryDate = new Date(this.policyExpiryDate);

        return expiryDate > effectiveDate;
    }

    /**
     * Transform to ASACI production request format
     */
    toAsaciProductionRequest() {
        return {
            office_code: this.officeCode,
            organization_code: this.organizationCode,
            certificate_type: this.certificateType,
            email_notification: this.emailNotification,
            generated_by: this.generatedBy || 'ORASS_INTEGRATION',
            channel: this.channel,
            productions: [
                {
                    COULEUR_D_ATTESTATION_A_EDITER: this.certificateColor,
                    PRIME_RC: this.premiumRC,
                    ENERGIE_DU_VEHICULE: this.vehicleEnergy,
                    NUMERO_DE_CHASSIS_DU_VEHICULE: this.vehicleChassisNumber,
                    MODELE_DU_VEHICULE: this.vehicleModel,
                    GENRE_DU_VEHICULE: this.vehicleGenre,
                    CATEGORIE_DU_VEHICULE: this.vehicleCategory,
                    USAGE_DU_VEHICULE: this.vehicleUsage,
                    MARQUE_DU_VEHICULE: this.vehicleBrand,
                    TYPE_DU_VEHICULE: this.vehicleType,
                    NOMBRE_DE_PLACE_DU_VEHICULE: this.vehicleSeats,
                    TYPE_DE_SOUSCRIPTEUR: this.subscriberType,
                    NUMERO_DE_TELEPHONE_DU_SOUSCRIPTEUR: this.subscriberPhone,
                    BOITE_POSTALE_DU_SOUSCRIPTEUR: this.subscriberPoBox,
                    ADRESSE_EMAIL_DU_SOUSCRIPTEUR: this.subscriberEmail,
                    NOM_DU_SOUSCRIPTEUR: this.subscriberName,
                    TELEPHONE_MOBILE_DE_L_ASSURE: this.insuredPhone,
                    BOITE_POSTALE_DE_L_ASSURE: this.insuredPoBox,
                    ADRESSE_EMAIL_DE_L_ASSURE: this.insuredEmail,
                    NOM_DE_L_ASSURE: this.insuredName,
                    IMMATRICULATION_DU_VEHICULE: this.vehicleRegistrationNumber,
                    NUMERO_DE_POLICE: this.policyNumber,
                    DATE_D_EFFET_DU_CONTRAT: this.policyEffectiveDate,
                    DATE_D_ECHEANCE_DU_CONTRAT: this.policyExpiryDate,
                    OP_ATD: this.opATD,
                    PUISSANCE_FISCALE: this.vehicleFiscalPower,
                    CHARGE_UTILE: this.vehicleUsefulLoad,
                    REDUCTION_FLOTTE: this.fleetReduction
                }
            ]
        };
    }
}


/**
 * Validation class for bulk creation from multiple ORASS policies
 */
export class BulkCreateEditionRequestFromOrassDto {
    @ValidateNested({ each: true })
    @Type(() => CreateEditionFromOrassDataRequest)
    @IsNotEmpty({ message: 'Au moins une police ORASS est requise.' })
    @Max(1000, { message: 'Vous ne pouvez pas traiter plus de 1000 polices à la fois.' })
    policies: CreateEditionFromOrassDataRequest[];

    @IsOptional()
    @IsString({ message: 'L\'email de notification doit être une chaîne de caractères.' })
    @IsEmail({}, { message: 'L\'adresse email de notification doit être valide.' })
    @MaxLength(255, { message: 'L\'email de notification ne peut pas contenir plus de 255 caractères.' })
    @Transform(({ value }) => value?.trim()?.toLowerCase())
    bulkEmailNotification?: string;

    @IsOptional()
    @IsString({ message: 'Le nom du lot doit être une chaîne de caractères.' })
    @MaxLength(100, { message: 'Le nom du lot ne peut pas contenir plus de 100 caractères.' })
    @Transform(({ value }) => value?.trim())
    batchName?: string;
}

//TODO: find which is the applicant code
export interface OrassPolicySearchCriteria {
    policyNumber?: string;
    applicantCode?: string;
    endorsementNumber?: string;
    organizationCode?: string;
    officeCode?: string;
}

export interface OrassQueryResult {
    policies: OrassPolicyResponse[];
    totalCount: number;
    hasMore: boolean;
}

export interface OrassConnectionStatus {
    connected: boolean;
    lastChecked: Date;
    error?: string;
    connectionInfo: {
        host: string;
        port: number;
        sid: string;
        username: string;
    };
}

// Certificate color mapping
export type CertificateColorMapping = {
    [key: string]: string;
};

export const CERTIFICATE_COLOR_MAP: CertificateColorMapping = {
    'CIMA_YELLOW': 'cima-jaune',
    'CIMA_GREEN': 'cima-verte',
    'POOLTPV_RED': 'pooltpv-rouge',
    'POOLTPV_BLUE': 'pooltpv-bleu',
    'POOLTPV_BROWN': 'pooltpv-marron',
    'MATCA_BLUE': 'matca-bleu'
};

// Vehicle type mapping for ASACI compliance
export const VEHICLE_TYPE_MAP: { [key: string]: string } = {
    // UV - Urban Vehicles
    'UV01': 'UV01', 'UV02': 'UV02', 'UV03': 'UV03', 'UV04': 'UV04', 'UV05': 'UV05',
    'UV06': 'UV06', 'UV07': 'UV07', 'UV08': 'UV08', 'UV09': 'UV09', 'UV10': 'UV10',

    // ST - Special Transport
    'ST01': 'ST01', 'ST02': 'ST02', 'ST03': 'ST03', 'ST04': 'ST04', 'ST05': 'ST05',
    'ST06': 'ST06', 'ST07': 'ST07', 'ST08': 'ST08', 'ST09': 'ST09', 'ST10': 'ST10',
    'ST11': 'ST11', 'ST12': 'ST12',

    // TA - Transport Agriculture
    'TAPP': 'TAPP', 'TAPM': 'TAPM', 'TSPP': 'TSPP', 'TSPM': 'TSPM',

    // TV - Transport Vehicles
    'TV01': 'TV01', 'TV02': 'TV02', 'TV03': 'TV03', 'TV04': 'TV04', 'TV05': 'TV05',
    'TV06': 'TV06', 'TV07': 'TV07', 'TV08': 'TV08', 'TV09': 'TV09', 'TV10': 'TV10',
    'TV11': 'TV11', 'TV12': 'TV12', 'TV13': 'TV13',

    // GV - Good Vehicles
    'GV01': 'GV01', 'GV02': 'GV02', 'GV03': 'GV03', 'GV04': 'GV04', 'GV05': 'GV05',
    'GV06': 'GV06', 'GV07': 'GV07', 'GV08': 'GV08', 'GV09': 'GV09', 'GV10': 'GV10',
    'GV11': 'GV11', 'GV12': 'GV12',

    // Numeric codes
    '01': '01', '02': '02', '03': '03', '04': '04', '05': '05', '06': '06',
    '07': '07', '08': '08', '09': '09', '10': '10', '11': '11', '12': '12',

    // SE - Special Energy
    'SEES': 'SEES', 'SEDI': 'SEDI', 'SEHY': 'SEHY', 'SEEL': 'SEEL'
};