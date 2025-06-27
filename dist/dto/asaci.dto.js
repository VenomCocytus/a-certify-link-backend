"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelTransactionDto = exports.RejectTransactionDto = exports.UpdateTransactionDto = exports.CreateTransactionDto = exports.SuspendCertificateDto = exports.CancelCertificateDto = exports.UpdateOrderDto = exports.CreateOrderDto = exports.CreateProductionRequestDto = exports.ProductionDataDto = exports.TransactionType = exports.ChannelType = exports.VehicleCode = exports.AttestationColor = exports.CertificateType = exports.RevokeTokensDto = exports.SetInitialPasswordDto = exports.ResendWelcomeDto = exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.OtpValidateDto = exports.GenerateTokenDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
// Authentication DTOs
class GenerateTokenDto {
}
exports.GenerateTokenDto = GenerateTokenDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Le champ value doit être une adresse e-mail valide.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    __metadata("design:type", String)
], GenerateTokenDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    __metadata("design:type", String)
], GenerateTokenDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], GenerateTokenDto.prototype, "client_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], GenerateTokenDto.prototype, "expires_at", void 0);
class OtpValidateDto {
}
exports.OtpValidateDto = OtpValidateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OtpValidateDto.prototype, "code", void 0);
class ForgotPasswordDto {
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Le champ value doit être une adresse e-mail valide.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class ResetPasswordDto {
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Token is required' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Le champ value doit être une adresse e-mail valide.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100, { message: 'Le texte de value ne peut pas contenir plus de 100 caractères.' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "client_name", void 0);
class ResendWelcomeDto {
}
exports.ResendWelcomeDto = ResendWelcomeDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Le champ value doit être une adresse e-mail valide.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    __metadata("design:type", String)
], ResendWelcomeDto.prototype, "email", void 0);
class SetInitialPasswordDto {
}
exports.SetInitialPasswordDto = SetInitialPasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Le texte de value ne peut pas contenir plus de 100 caractères.' }),
    __metadata("design:type", String)
], SetInitialPasswordDto.prototype, "password", void 0);
class RevokeTokensDto {
}
exports.RevokeTokensDto = RevokeTokensDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Token IDs are required' }),
    __metadata("design:type", Array)
], RevokeTokensDto.prototype, "token_ids", void 0);
// Certificate Enums
var CertificateType;
(function (CertificateType) {
    CertificateType["CIMA"] = "cima";
    CertificateType["POOLTPV"] = "pooltpv";
    CertificateType["MATCA"] = "matca";
    CertificateType["POOLTPVBLEU"] = "pooltpvbleu";
})(CertificateType || (exports.CertificateType = CertificateType = {}));
var AttestationColor;
(function (AttestationColor) {
    AttestationColor["CIMA_JAUNE"] = "cima-jaune";
    AttestationColor["CIMA_VERTE"] = "cima-verte";
    AttestationColor["POOLTPV_ROUGE"] = "pooltpv-rouge";
    AttestationColor["POOLTPV_BLEU"] = "pooltpv-bleu";
    AttestationColor["POOLTPV_MARRON"] = "pooltpv-marron";
    AttestationColor["MATCA_BLEU"] = "matca-bleu";
})(AttestationColor || (exports.AttestationColor = AttestationColor = {}));
var VehicleCode;
(function (VehicleCode) {
    VehicleCode["UV01"] = "UV01";
    VehicleCode["UV02"] = "UV02";
    VehicleCode["UV03"] = "UV03";
    VehicleCode["UV04"] = "UV04";
    VehicleCode["UV05"] = "UV05";
    VehicleCode["UV06"] = "UV06";
    VehicleCode["UV07"] = "UV07";
    VehicleCode["UV08"] = "UV08";
    VehicleCode["UV09"] = "UV09";
    VehicleCode["UV10"] = "UV10";
    VehicleCode["ST01"] = "ST01";
    VehicleCode["ST02"] = "ST02";
    VehicleCode["ST03"] = "ST03";
    VehicleCode["ST04"] = "ST04";
    VehicleCode["ST05"] = "ST05";
    VehicleCode["ST06"] = "ST06";
    VehicleCode["ST07"] = "ST07";
    VehicleCode["ST08"] = "ST08";
    VehicleCode["ST09"] = "ST09";
    VehicleCode["ST10"] = "ST10";
    VehicleCode["ST11"] = "ST11";
    VehicleCode["ST12"] = "ST12";
    VehicleCode["TAPP"] = "TAPP";
    VehicleCode["TAPM"] = "TAPM";
    VehicleCode["TSPP"] = "TSPP";
    VehicleCode["TSPM"] = "TSPM";
    VehicleCode["TV01"] = "TV01";
    VehicleCode["TV02"] = "TV02";
    VehicleCode["TV03"] = "TV03";
    VehicleCode["TV04"] = "TV04";
    VehicleCode["TV05"] = "TV05";
    VehicleCode["TV06"] = "TV06";
    VehicleCode["TV07"] = "TV07";
    VehicleCode["TV08"] = "TV08";
    VehicleCode["TV09"] = "TV09";
    VehicleCode["TV10"] = "TV10";
    VehicleCode["TV11"] = "TV11";
    VehicleCode["TV12"] = "TV12";
    VehicleCode["TV13"] = "TV13";
    VehicleCode["GV01"] = "GV01";
    VehicleCode["GV02"] = "GV02";
    VehicleCode["GV03"] = "GV03";
    VehicleCode["GV04"] = "GV04";
    VehicleCode["GV05"] = "GV05";
    VehicleCode["GV06"] = "GV06";
    VehicleCode["GV07"] = "GV07";
    VehicleCode["GV08"] = "GV08";
    VehicleCode["GV09"] = "GV09";
    VehicleCode["GV10"] = "GV10";
    VehicleCode["GV11"] = "GV11";
    VehicleCode["GV12"] = "GV12";
    VehicleCode["CODE_01"] = "01";
    VehicleCode["CODE_02"] = "02";
    VehicleCode["CODE_03"] = "03";
    VehicleCode["CODE_04"] = "04";
    VehicleCode["CODE_05"] = "05";
    VehicleCode["CODE_06"] = "06";
    VehicleCode["CODE_07"] = "07";
    VehicleCode["CODE_08"] = "08";
    VehicleCode["CODE_09"] = "09";
    VehicleCode["CODE_10"] = "10";
    VehicleCode["CODE_11"] = "11";
    VehicleCode["CODE_12"] = "12";
    VehicleCode["SEES"] = "SEES";
    VehicleCode["SEDI"] = "SEDI";
    VehicleCode["SEHY"] = "SEHY";
    VehicleCode["SEEL"] = "SEEL";
})(VehicleCode || (exports.VehicleCode = VehicleCode = {}));
var ChannelType;
(function (ChannelType) {
    ChannelType["API"] = "api";
    ChannelType["WEB"] = "web";
})(ChannelType || (exports.ChannelType = ChannelType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "deposit";
    TransactionType["WITHDRAW"] = "withdraw";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
// Production Data DTO
class ProductionDataDto {
}
exports.ProductionDataDto = ProductionDataDto;
__decorate([
    (0, class_validator_1.IsEnum)(AttestationColor),
    (0, class_validator_1.IsNotEmpty)({ message: 'Couleur d\'attestation is required' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "COULEUR_D_ATTESTATION_A_EDITER", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Prime RC is required' }),
    __metadata("design:type", Number)
], ProductionDataDto.prototype, "PRIME_RC", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(VehicleCode),
    (0, class_validator_1.IsNotEmpty)({ message: 'Energie du véhicule is required' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "ENERGIE_DU_VEHICULE", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Numéro de chassis is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "NUMERO_DE_CHASSIS_DU_VEHICULE", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Modèle du véhicule is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "MODELE_DU_VEHICULE", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(VehicleCode),
    (0, class_validator_1.IsNotEmpty)({ message: 'Genre du véhicule is required' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "GENRE_DU_VEHICULE", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(VehicleCode),
    (0, class_validator_1.IsNotEmpty)({ message: 'Catégorie du véhicule is required' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "CATEGORIE_DU_VEHICULE", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(VehicleCode),
    (0, class_validator_1.IsNotEmpty)({ message: 'Usage du véhicule is required' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "USAGE_DU_VEHICULE", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Marque du véhicule is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "MARQUE_DU_VEHICULE", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(VehicleCode),
    (0, class_validator_1.IsNotEmpty)({ message: 'Type du véhicule is required' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "TYPE_DU_VEHICULE", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nombre de place is required' }),
    __metadata("design:type", Number)
], ProductionDataDto.prototype, "NOMBRE_DE_PLACE_DU_VEHICULE", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(VehicleCode),
    (0, class_validator_1.IsNotEmpty)({ message: 'Type de souscripteur is required' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "TYPE_DE_SOUSCRIPTEUR", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Numéro de téléphone du souscripteur is required' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "NUMERO_DE_TELEPHONE_DU_SOUSCRIPTEUR", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Boîte postale du souscripteur is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "BOITE_POSTALE_DU_SOUSCRIPTEUR", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Adresse email du souscripteur is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "ADRESSE_EMAIL_DU_SOUSCRIPTEUR", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nom du souscripteur is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "NOM_DU_SOUSCRIPTEUR", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Téléphone mobile de l\'assuré is required' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "TELEPHONE_MOBILE_DE_L_ASSURE", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Boîte postale de l\'assuré is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "BOITE_POSTALE_DE_L_ASSURE", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Adresse email de l\'assuré is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "ADRESSE_EMAIL_DE_L_ASSURE", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nom de l\'assuré is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "NOM_DE_L_ASSURE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "IMMATRICULATION_DU_VEHICULE", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Numéro de police is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "NUMERO_DE_POLICE", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Date d\'effet du contrat is required' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "DATE_D_EFFET_DU_CONTRAT", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Date d\'échéance du contrat is required' }),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "DATE_D_ECHEANCE_DU_CONTRAT", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductionDataDto.prototype, "OP_ATD", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ProductionDataDto.prototype, "PUISSANCE_FISCALE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ProductionDataDto.prototype, "CHARGE_UTILE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ProductionDataDto.prototype, "REDUCTION_FLOTTE", void 0);
// Production Request DTO
class CreateProductionRequestDto {
}
exports.CreateProductionRequestDto = CreateProductionRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Office code is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], CreateProductionRequestDto.prototype, "office_code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Organization code is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], CreateProductionRequestDto.prototype, "organization_code", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(CertificateType),
    (0, class_validator_1.IsNotEmpty)({ message: 'Certificate type is required' }),
    __metadata("design:type", String)
], CreateProductionRequestDto.prototype, "certificate_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], CreateProductionRequestDto.prototype, "email_notification", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], CreateProductionRequestDto.prototype, "generated_by", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ChannelType),
    __metadata("design:type", String)
], CreateProductionRequestDto.prototype, "channel", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ProductionDataDto),
    (0, class_validator_1.IsNotEmpty)({ message: 'Productions data is required' }),
    __metadata("design:type", Array)
], CreateProductionRequestDto.prototype, "productions", void 0);
// Order DTOs
class CreateOrderDto {
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(5, { message: 'La valeur de value doit être supérieure ou égale à 5.' }),
    (0, class_validator_1.Max)(100000, { message: 'La valeur de value ne peut pas être supérieure à 100000.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Quantity is required' }),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Certificate type ID is required' }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "certificate_type_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "email_notification", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "generated_by", void 0);
class UpdateOrderDto {
}
exports.UpdateOrderDto = UpdateOrderDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1, { message: 'La valeur de value doit être supérieure ou égale à 1.' }),
    (0, class_validator_1.Max)(250000, { message: 'La valeur de value ne peut pas être supérieure à 250000.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Quantity is required' }),
    __metadata("design:type", Number)
], UpdateOrderDto.prototype, "quantity", void 0);
// Certificate DTOs
class CancelCertificateDto {
}
exports.CancelCertificateDto = CancelCertificateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Reason is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], CancelCertificateDto.prototype, "reason", void 0);
class SuspendCertificateDto {
}
exports.SuspendCertificateDto = SuspendCertificateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Reason is required' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], SuspendCertificateDto.prototype, "reason", void 0);
// Transaction DTOs
class CreateTransactionDto {
}
exports.CreateTransactionDto = CreateTransactionDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1, { message: 'La valeur de value doit être supérieure ou égale à 1.' }),
    (0, class_validator_1.Max)(15000, { message: 'La valeur de value ne peut pas être supérieure à 15000.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Quantity is required' }),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Organization ID is required' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "organization_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Office ID is required' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "office_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Certificate type ID is required' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "certificate_type_id", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TransactionType),
    (0, class_validator_1.IsNotEmpty)({ message: 'Transaction type is required' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "type", void 0);
class UpdateTransactionDto {
}
exports.UpdateTransactionDto = UpdateTransactionDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1, { message: 'La valeur de value doit être supérieure ou égale à 1.' }),
    (0, class_validator_1.Max)(250000, { message: 'La valeur de value ne peut pas être supérieure à 250000.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Quantity is required' }),
    __metadata("design:type", Number)
], UpdateTransactionDto.prototype, "quantity", void 0);
class RejectTransactionDto {
}
exports.RejectTransactionDto = RejectTransactionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], RejectTransactionDto.prototype, "reason", void 0);
class CancelTransactionDto {
}
exports.CancelTransactionDto = CancelTransactionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255, { message: 'Le texte de value ne peut pas contenir plus de 255 caractères.' }),
    __metadata("design:type", String)
], CancelTransactionDto.prototype, "reason", void 0);
//# sourceMappingURL=asaci.dto.js.map