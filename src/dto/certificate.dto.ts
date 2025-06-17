import { IsString, IsEmail, IsDateString, IsOptional, IsEnum, IsArray, IsNotEmpty } from 'class-validator';
import { IvoryAttestationConstants } from '@/constants/ivoryAttestation';

export class CreateCertificateRequestDto {
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

export class CertificateResponseDto {
    id!: string;
    referenceNumber!: string;
    ivoryRequestNumber?: string;
    status!: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'suspended';
    certificateNumber?: string;
    downloadUrl?: string;
    createdAt!: Date;
    updatedAt!: Date;
    policyNumber!: string;
    registrationNumber!: string;
    companyCode!: string;
}

export class UpdateCertificateStatusDto {
    @IsArray()
    @IsString({ each: true })
    numero_attestation!: string[];

    @IsString()
    @IsEnum(['109', '120']) // Cancel or Suspend
    code_operation!: string;
}

export class CertificateStatusCheckDto {
    @IsString()
    @IsNotEmpty()
    reference_demande!: string;
}

export class DownloadCertificateDto {
    @IsString()
    @IsNotEmpty()
    numero_demande!: string;

    @IsString()
    @IsNotEmpty()
    code_compagnie!: string;
}