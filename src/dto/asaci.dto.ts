import {
    IsEmail,
    IsString,
    IsOptional,
    IsInt,
    IsArray,
    IsEnum,
    MaxLength,
    Min,
    Max,
    IsNotEmpty,
    ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

// Authentication DTOs
export class GenerateTokenDto {
    @IsEmail({}, { message: 'Le champ value doit être une adresse e-mail valide.' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    password: string;

    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    client_name?: string;

    @IsOptional()
    @IsInt()
    expires_at?: number;
}

export class OtpValidateDto {
    @IsOptional()
    @IsString()
    code?: string;
}

export class ForgotPasswordDto {
    @IsEmail({}, { message: 'Le champ value doit être une adresse e-mail valide.' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;
}

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'Token is required' })
    token: string;

    @IsEmail({}, { message: 'Le champ value doit être une adresse e-mail valide.' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsOptional()
    @IsString()
    @MaxLength(100, { message: 'Le texte de value ne peut pas contenir plus de 100 caractères.' })
    password?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    client_name?: string;
}

export class ResendWelcomeDto {
    @IsEmail({}, { message: 'Le champ value doit être une adresse e-mail valide.' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;
}

export class SetInitialPasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MaxLength(100, { message: 'Le texte de value ne peut pas contenir plus de 100 caractères.' })
    password: string;
}

export class RevokeTokensDto {
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ message: 'Token IDs are required' })
    token_ids: string[];
}

// Certificate Enums
export enum CertificateType {
    CIMA = 'cima',
    POOLTPV = 'pooltpv',
    MATCA = 'matca',
    POOLTPVBLEU = 'pooltpvbleu'
}

export enum AttestationColor {
    CIMA_JAUNE = 'cima-jaune',
    CIMA_VERTE = 'cima-verte',
    POOLTPV_ROUGE = 'pooltpv-rouge',
    POOLTPV_BLEU = 'pooltpv-bleu',
    POOLTPV_MARRON = 'pooltpv-marron',
    MATCA_BLEU = 'matca-bleu'
}

export enum VehicleCode {
    UV01 = 'UV01', UV02 = 'UV02', UV03 = 'UV03', UV04 = 'UV04', UV05 = 'UV05',
    UV06 = 'UV06', UV07 = 'UV07', UV08 = 'UV08', UV09 = 'UV09', UV10 = 'UV10',
    ST01 = 'ST01', ST02 = 'ST02', ST03 = 'ST03', ST04 = 'ST04', ST05 = 'ST05',
    ST06 = 'ST06', ST07 = 'ST07', ST08 = 'ST08', ST09 = 'ST09', ST10 = 'ST10',
    ST11 = 'ST11', ST12 = 'ST12', TAPP = 'TAPP', TAPM = 'TAPM', TSPP = 'TSPP',
    TSPM = 'TSPM', TV01 = 'TV01', TV02 = 'TV02', TV03 = 'TV03', TV04 = 'TV04',
    TV05 = 'TV05', TV06 = 'TV06', TV07 = 'TV07', TV08 = 'TV08', TV09 = 'TV09',
    TV10 = 'TV10', TV11 = 'TV11', TV12 = 'TV12', TV13 = 'TV13', GV01 = 'GV01',
    GV02 = 'GV02', GV03 = 'GV03', GV04 = 'GV04', GV05 = 'GV05', GV06 = 'GV06',
    GV07 = 'GV07', GV08 = 'GV08', GV09 = 'GV09', GV10 = 'GV10', GV11 = 'GV11',
    GV12 = 'GV12', CODE_01 = '01', CODE_02 = '02', CODE_03 = '03', CODE_04 = '04',
    CODE_05 = '05', CODE_06 = '06', CODE_07 = '07', CODE_08 = '08', CODE_09 = '09',
    CODE_10 = '10', CODE_11 = '11', CODE_12 = '12', SEES = 'SEES', SEDI = 'SEDI',
    SEHY = 'SEHY', SEEL = 'SEEL'
}

export enum ChannelType {
    API = 'api',
    WEB = 'web'
}

export enum TransactionType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw'
}

// Production Data DTO
export class ProductionDataDto {
    @IsEnum(AttestationColor)
    @IsNotEmpty({ message: 'Couleur d\'attestation is required' })
    COULEUR_D_ATTESTATION_A_EDITER: AttestationColor;

    @IsInt()
    @IsNotEmpty({ message: 'Prime RC is required' })
    PRIME_RC: number;

    @IsEnum(VehicleCode)
    @IsNotEmpty({ message: 'Energie du véhicule is required' })
    ENERGIE_DU_VEHICULE: VehicleCode;

    @IsString()
    @IsNotEmpty({ message: 'Numéro de chassis is required' })
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    NUMERO_DE_CHASSIS_DU_VEHICULE: string;

    @IsString()
    @IsNotEmpty({ message: 'Modèle du véhicule is required' })
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    MODELE_DU_VEHICULE: string;

    @IsEnum(VehicleCode)
    @IsNotEmpty({ message: 'Genre du véhicule is required' })
    GENRE_DU_VEHICULE: VehicleCode;

    @IsEnum(VehicleCode)
    @IsNotEmpty({ message: 'Catégorie du véhicule is required' })
    CATEGORIE_DU_VEHICULE: VehicleCode;

    @IsEnum(VehicleCode)
    @IsNotEmpty({ message: 'Usage du véhicule is required' })
    USAGE_DU_VEHICULE: VehicleCode;

    @IsString()
    @IsNotEmpty({ message: 'Marque du véhicule is required' })
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    MARQUE_DU_VEHICULE: string;

    @IsEnum(VehicleCode)
    @IsNotEmpty({ message: 'Type du véhicule is required' })
    TYPE_DU_VEHICULE: VehicleCode;

    @IsInt()
    @IsNotEmpty({ message: 'Nombre de place is required' })
    NOMBRE_DE_PLACE_DU_VEHICULE: number;

    @IsEnum(VehicleCode)
    @IsNotEmpty({ message: 'Type de souscripteur is required' })
    TYPE_DE_SOUSCRIPTEUR: VehicleCode;

    @IsString()
    @IsNotEmpty({ message: 'Numéro de téléphone du souscripteur is required' })
    NUMERO_DE_TELEPHONE_DU_SOUSCRIPTEUR: string;

    @IsString()
    @IsNotEmpty({ message: 'Boîte postale du souscripteur is required' })
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    BOITE_POSTALE_DU_SOUSCRIPTEUR: string;

    @IsString()
    @IsNotEmpty({ message: 'Adresse email du souscripteur is required' })
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    ADRESSE_EMAIL_DU_SOUSCRIPTEUR: string;

    @IsString()
    @IsNotEmpty({ message: 'Nom du souscripteur is required' })
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    NOM_DU_SOUSCRIPTEUR: string;

    @IsString()
    @IsNotEmpty({ message: 'Téléphone mobile de l\'assuré is required' })
    TELEPHONE_MOBILE_DE_L_ASSURE: string;

    @IsString()
    @IsNotEmpty({ message: 'Boîte postale de l\'assuré is required' })
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    BOITE_POSTALE_DE_L_ASSURE: string;

    @IsString()
    @IsNotEmpty({ message: 'Adresse email de l\'assuré is required' })
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    ADRESSE_EMAIL_DE_L_ASSURE: string;

    @IsString()
    @IsNotEmpty({ message: 'Nom de l\'assuré is required' })
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    NOM_DE_L_ASSURE: string;

    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    IMMATRICULATION_DU_VEHICULE?: string;

    @IsString()
    @IsNotEmpty({ message: 'Numéro de police is required' })
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    NUMERO_DE_POLICE: string;

    @IsString()
    @IsNotEmpty({ message: 'Date d\'effet du contrat is required' })
    DATE_D_EFFET_DU_CONTRAT: string;

    @IsString()
    @IsNotEmpty({ message: 'Date d\'échéance du contrat is required' })
    DATE_D_ECHEANCE_DU_CONTRAT: string;

    @IsOptional()
    @IsString()
    OP_ATD?: string;

    @IsOptional()
    @IsInt()
    PUISSANCE_FISCALE?: number;

    @IsOptional()
    @IsInt()
    CHARGE_UTILE?: number;

    @IsOptional()
    @IsInt()
    REDUCTION_FLOTTE?: number;
}

// Production Request DTO
export class CreateProductionRequestDto {
    @IsString()
    @IsNotEmpty({ message: 'Office code is required' })
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    office_code: string;

    @IsString()
    @IsNotEmpty({ message: 'Organization code is required' })
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    organization_code: string;

    @IsEnum(CertificateType)
    @IsNotEmpty({ message: 'Certificate type is required' })
    certificate_type: CertificateType;

    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    email_notification?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    generated_by?: string;

    @IsOptional()
    @IsEnum(ChannelType)
    channel?: ChannelType;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductionDataDto)
    @IsNotEmpty({ message: 'Productions data is required' })
    productions: ProductionDataDto[];
}

// Order DTOs
export class CreateOrderDto {
    @IsInt()
    @Min(5, { message: 'La valeur de value doit être supérieure ou égale à 5.' })
    @Max(100000, { message: 'La valeur de value ne peut pas être supérieure à 100000.' })
    @IsNotEmpty({ message: 'Quantity is required' })
    quantity: number;

    @IsString()
    @IsNotEmpty({ message: 'Certificate type ID is required' })
    certificate_type_id: string;

    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    email_notification?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    generated_by?: string;
}

export class UpdateOrderDto {
    @IsInt()
    @Min(1, { message: 'La valeur de value doit être supérieure ou égale à 1.' })
    @Max(250000, { message: 'La valeur de value ne peut pas être supérieure à 250000.' })
    @IsNotEmpty({ message: 'Quantity is required' })
    quantity: number;
}

// Certificate DTOs
export class CancelCertificateDto {
    @IsString()
    @IsNotEmpty({ message: 'Reason is required' })
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    reason: string;
}

export class SuspendCertificateDto {
    @IsString()
    @IsNotEmpty({ message: 'Reason is required' })
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    reason: string;
}

// Transaction DTOs
export class CreateTransactionDto {
    @IsInt()
    @Min(1, { message: 'La valeur de value doit être supérieure ou égale à 1.' })
    @Max(15000, { message: 'La valeur de value ne peut pas être supérieure à 15000.' })
    @IsNotEmpty({ message: 'Quantity is required' })
    quantity: number;

    @IsString()
    @IsNotEmpty({ message: 'Organization ID is required' })
    organization_id: string;

    @IsString()
    @IsNotEmpty({ message: 'Office ID is required' })
    office_id: string;

    @IsString()
    @IsNotEmpty({ message: 'Certificate type ID is required' })
    certificate_type_id: string;

    @IsEnum(TransactionType)
    @IsNotEmpty({ message: 'Transaction type is required' })
    type: TransactionType;
}

export class UpdateTransactionDto {
    @IsInt()
    @Min(1, { message: 'La valeur de value doit être supérieure ou égale à 1.' })
    @Max(250000, { message: 'La valeur de value ne peut pas être supérieure à 250000.' })
    @IsNotEmpty({ message: 'Quantity is required' })
    quantity: number;
}

export class RejectTransactionDto {
    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    reason?: string;
}

export class CancelTransactionDto {
    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' })
    reason?: string;
}