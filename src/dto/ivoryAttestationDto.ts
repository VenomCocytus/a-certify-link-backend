import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class IvoryAttestationRequestDto {
    @IsString()
    code_compagnie!: string;

    @IsString()
    date_demande_edition!: string;

    @IsString()
    date_souscription!: string;

    @IsString()
    date_effet!: string;

    @IsString()
    date_echeance!: string;

    @IsString()
    genre_vehicule!: string;

    @IsString()
    numero_immatriculation!: string;

    @IsString()
    type_vehicule!: string;

    @IsString()
    model_vehicule!: string;

    @IsString()
    categorie_vehicule!: string;

    @IsString()
    usage_vehicule!: string;

    @IsString()
    source_energie!: string;

    @IsString()
    nombre_place!: string;

    @IsString()
    marque_vehicule!: string;

    @IsString()
    numero_chassis!: string;

    @IsString()
    numero_moteur!: string;

    @IsString()
    numero_carte_brune_physique!: string;

    @IsString()
    numero_rccm!: string;

    @IsString()
    bureau_enregistreur!: string;

    @IsString()
    nom_souscripteur!: string;

    @IsString()
    type_souscripteur!: string;

    @IsString()
    adresse_mail_souscripteur!: string;

    @IsString()
    numero_telephone_souscripteur!: string;

    @IsString()
    boite_postale_souscripteur!: string;

    @IsString()
    type_assure!: string;

    @IsString()
    nom_assure!: string;

    @IsString()
    adresse_mail_assure!: string;

    @IsString()
    boite_postale_assure!: string;

    @IsString()
    numero_police!: string;

    @IsString()
    numero_telephone_assure!: string;

    @IsString()
    profession_assure!: string;

    @IsString()
    type_point_vente_compagnie!: string;

    @IsString()
    code_point_vente_compagnie!: string;

    @IsString()
    denomination_point_vente_compagnie!: string;

    @IsString()
    rc!: string;

    @IsString()
    code_nature_attestation!: string;

    @IsString()
    garantie!: string;

    @IsString()
    contrat!: string;

    @IsString()
    zone_circulation!: string;

    @IsString()
    date_premiere_mise_en_circulation!: string;

    @IsString()
    valeur_neuve!: string;

    @IsString()
    valeur_venale!: string;

    @IsString()
    montant_autres_garanties!: string;

    @IsString()
    montant_prime_nette_total!: string;

    @IsString()
    montant_accessoires!: string;

    @IsString()
    montant_taxes!: string;

    @IsString()
    montant_carte_brune!: string;

    @IsString()
    fga!: string;

    @IsString()
    montant_prime_ttc!: string;
}

export class IvoryAttestationResponseDto {
    @IsNumber()
    statut!: number;

    @IsString()
    @IsOptional()
    numero_demande?: string;

    @IsArray()
    @IsOptional()
    infos?: IvoryAttestationInfoDto[];
}

export class IvoryAttestationInfoDto {
    @IsString()
    @IsOptional()
    numero_attestation?: string;

    @IsString()
    @IsOptional()
    lien_telechargement?: string;

    @IsString()
    @IsOptional()
    status?: string;
}

export class IvoryVerificationRequestDto {
    @IsString()
    code_demandeur!: string;

    @IsString()
    reference_demande!: string;
}

export class IvoryVerificationResponseDto {
    @IsNumber()
    statut!: number;

    @IsString()
    @IsOptional()
    reference_demande?: string;
}

export class IvoryUpdateStatusRequestDto {
    @IsString()
    code_demandeur!: string;

    @IsArray()
    @IsString({ each: true })
    numero_attestation!: string[];

    @IsString()
    code_operation!: string;
}

export class IvoryUpdateStatusResponseDto {
    @IsNumber()
    statut!: number;

    @IsArray()
    @IsOptional()
    liste_numero_attestation?: string[];
}

export class IvoryDownloadRequestDto {
    @IsString()
    code_demandeur!: string;

    @IsString()
    code_compagnie!: string;

    @IsString()
    numero_demande!: string;
}