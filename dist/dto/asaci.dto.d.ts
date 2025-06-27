export declare class GenerateTokenDto {
    email: string;
    password: string;
    client_name?: string;
    expires_at?: number;
}
export declare class OtpValidateDto {
    code?: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    email: string;
    password?: string;
    client_name?: string;
}
export declare class ResendWelcomeDto {
    email: string;
}
export declare class SetInitialPasswordDto {
    password: string;
}
export declare class RevokeTokensDto {
    token_ids: string[];
}
export declare enum CertificateType {
    CIMA = "cima",
    POOLTPV = "pooltpv",
    MATCA = "matca",
    POOLTPVBLEU = "pooltpvbleu"
}
export declare enum AttestationColor {
    CIMA_JAUNE = "cima-jaune",
    CIMA_VERTE = "cima-verte",
    POOLTPV_ROUGE = "pooltpv-rouge",
    POOLTPV_BLEU = "pooltpv-bleu",
    POOLTPV_MARRON = "pooltpv-marron",
    MATCA_BLEU = "matca-bleu"
}
export declare enum VehicleCode {
    UV01 = "UV01",
    UV02 = "UV02",
    UV03 = "UV03",
    UV04 = "UV04",
    UV05 = "UV05",
    UV06 = "UV06",
    UV07 = "UV07",
    UV08 = "UV08",
    UV09 = "UV09",
    UV10 = "UV10",
    ST01 = "ST01",
    ST02 = "ST02",
    ST03 = "ST03",
    ST04 = "ST04",
    ST05 = "ST05",
    ST06 = "ST06",
    ST07 = "ST07",
    ST08 = "ST08",
    ST09 = "ST09",
    ST10 = "ST10",
    ST11 = "ST11",
    ST12 = "ST12",
    TAPP = "TAPP",
    TAPM = "TAPM",
    TSPP = "TSPP",
    TSPM = "TSPM",
    TV01 = "TV01",
    TV02 = "TV02",
    TV03 = "TV03",
    TV04 = "TV04",
    TV05 = "TV05",
    TV06 = "TV06",
    TV07 = "TV07",
    TV08 = "TV08",
    TV09 = "TV09",
    TV10 = "TV10",
    TV11 = "TV11",
    TV12 = "TV12",
    TV13 = "TV13",
    GV01 = "GV01",
    GV02 = "GV02",
    GV03 = "GV03",
    GV04 = "GV04",
    GV05 = "GV05",
    GV06 = "GV06",
    GV07 = "GV07",
    GV08 = "GV08",
    GV09 = "GV09",
    GV10 = "GV10",
    GV11 = "GV11",
    GV12 = "GV12",
    CODE_01 = "01",
    CODE_02 = "02",
    CODE_03 = "03",
    CODE_04 = "04",
    CODE_05 = "05",
    CODE_06 = "06",
    CODE_07 = "07",
    CODE_08 = "08",
    CODE_09 = "09",
    CODE_10 = "10",
    CODE_11 = "11",
    CODE_12 = "12",
    SEES = "SEES",
    SEDI = "SEDI",
    SEHY = "SEHY",
    SEEL = "SEEL"
}
export declare enum ChannelType {
    API = "api",
    WEB = "web"
}
export declare enum TransactionType {
    DEPOSIT = "deposit",
    WITHDRAW = "withdraw"
}
export declare class ProductionDataDto {
    COULEUR_D_ATTESTATION_A_EDITER: AttestationColor;
    PRIME_RC: number;
    ENERGIE_DU_VEHICULE: VehicleCode;
    NUMERO_DE_CHASSIS_DU_VEHICULE: string;
    MODELE_DU_VEHICULE: string;
    GENRE_DU_VEHICULE: VehicleCode;
    CATEGORIE_DU_VEHICULE: VehicleCode;
    USAGE_DU_VEHICULE: VehicleCode;
    MARQUE_DU_VEHICULE: string;
    TYPE_DU_VEHICULE: VehicleCode;
    NOMBRE_DE_PLACE_DU_VEHICULE: number;
    TYPE_DE_SOUSCRIPTEUR: VehicleCode;
    NUMERO_DE_TELEPHONE_DU_SOUSCRIPTEUR: string;
    BOITE_POSTALE_DU_SOUSCRIPTEUR: string;
    ADRESSE_EMAIL_DU_SOUSCRIPTEUR: string;
    NOM_DU_SOUSCRIPTEUR: string;
    TELEPHONE_MOBILE_DE_L_ASSURE: string;
    BOITE_POSTALE_DE_L_ASSURE: string;
    ADRESSE_EMAIL_DE_L_ASSURE: string;
    NOM_DE_L_ASSURE: string;
    IMMATRICULATION_DU_VEHICULE?: string;
    NUMERO_DE_POLICE: string;
    DATE_D_EFFET_DU_CONTRAT: string;
    DATE_D_ECHEANCE_DU_CONTRAT: string;
    OP_ATD?: string;
    PUISSANCE_FISCALE?: number;
    CHARGE_UTILE?: number;
    REDUCTION_FLOTTE?: number;
}
export declare class CreateProductionRequestDto {
    office_code: string;
    organization_code: string;
    certificate_type: CertificateType;
    email_notification?: string;
    generated_by?: string;
    channel?: ChannelType;
    productions: ProductionDataDto[];
}
export declare class CreateOrderDto {
    quantity: number;
    certificate_type_id: string;
    email_notification?: string;
    generated_by?: string;
}
export declare class UpdateOrderDto {
    quantity: number;
}
export declare class CancelCertificateDto {
    reason: string;
}
export declare class SuspendCertificateDto {
    reason: string;
}
export declare class CreateTransactionDto {
    quantity: number;
    organization_id: string;
    office_id: string;
    certificate_type_id: string;
    type: TransactionType;
}
export declare class UpdateTransactionDto {
    quantity: number;
}
export declare class RejectTransactionDto {
    reason?: string;
}
export declare class CancelTransactionDto {
    reason?: string;
}
//# sourceMappingURL=asaci.dto.d.ts.map