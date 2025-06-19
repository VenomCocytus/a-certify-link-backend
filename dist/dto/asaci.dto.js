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
exports.AsaciAttestationDownloadInfo = exports.AsaciAttestationDownloadResponse = exports.AsaciAttestationDownloadRequest = exports.CheckAsaciCertificateStatusRequest = exports.AsaciAttestationUpdateStatusResponse = exports.AsaciAttestationUpdateStatusRequest = exports.AsaciAttestationVerificationResponse = exports.AsaciAttestationVerificationRequest = exports.AsaciAttestationInfo = exports.AsaciAttestationEditionResponse = exports.AsaciAttestationEditionRequest = void 0;
const class_validator_1 = require("class-validator");
const ivoryAttestation_1 = require("@/constants/ivoryAttestation");
class AsaciAttestationEditionRequest {
}
exports.AsaciAttestationEditionRequest = AsaciAttestationEditionRequest;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "code_compagnie", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "date_demande_edition", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "date_souscription", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "date_effet", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "date_echeance", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(Object.values(ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_GENRES)),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "genre_vehicule", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "numero_immatriculation", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(Object.values(ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_TYPES)),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "type_vehicule", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "model_vehicule", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(Object.values(ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_CATEGORIES)),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "categorie_vehicule", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(Object.values(ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_USAGE)),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "usage_vehicule", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(Object.values(ivoryAttestation_1.IvoryAttestationConstants.ENERGY_SOURCES)),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "source_energie", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "nombre_place", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "marque_vehicule", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "numero_chassis", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "numero_moteur", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "numero_carte_brune_physique", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "numero_rccm", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "bureau_enregistreur", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "nom_souscripteur", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(Object.values(ivoryAttestation_1.IvoryAttestationConstants.SUBSCRIBER_TYPES)),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "type_souscripteur", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "adresse_mail_souscripteur", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "numero_telephone_souscripteur", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "boite_postale_souscripteur", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(Object.values(ivoryAttestation_1.IvoryAttestationConstants.INSURED_TYPES)),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "type_assure", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "nom_assure", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "adresse_mail_assure", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "boite_postale_assure", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "numero_police", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "numero_telephone_assure", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(Object.values(ivoryAttestation_1.IvoryAttestationConstants.PROFESSIONS)),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "profession_assure", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "type_point_vente_compagnie", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "code_point_vente_compagnie", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "denomination_point_vente_compagnie", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "rc", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(Object.values(ivoryAttestation_1.IvoryAttestationConstants.CERTIFICATE_COLORS)),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "code_nature_attestation", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "garantie", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "contrat", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "zone_circulation", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "date_premiere_mise_en_circulation", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "valeur_neuve", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "valeur_venale", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "montant_autres_garanties", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "montant_prime_nette_total", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "montant_accessoires", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "montant_taxes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "montant_carte_brune", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "fga", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationEditionRequest.prototype, "montant_prime_ttc", void 0);
class AsaciAttestationEditionResponse {
}
exports.AsaciAttestationEditionResponse = AsaciAttestationEditionResponse;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AsaciAttestationEditionResponse.prototype, "statut", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsaciAttestationEditionResponse.prototype, "numero_demande", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], AsaciAttestationEditionResponse.prototype, "infos", void 0);
class AsaciAttestationInfo {
}
exports.AsaciAttestationInfo = AsaciAttestationInfo;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsaciAttestationInfo.prototype, "numero_attestation", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsaciAttestationInfo.prototype, "lien_telechargement", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsaciAttestationInfo.prototype, "status", void 0);
class AsaciAttestationVerificationRequest {
}
exports.AsaciAttestationVerificationRequest = AsaciAttestationVerificationRequest;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AsaciAttestationVerificationRequest.prototype, "code_demandeur", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AsaciAttestationVerificationRequest.prototype, "reference_demande", void 0);
class AsaciAttestationVerificationResponse {
}
exports.AsaciAttestationVerificationResponse = AsaciAttestationVerificationResponse;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AsaciAttestationVerificationResponse.prototype, "statut", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsaciAttestationVerificationResponse.prototype, "reference_demande", void 0);
class AsaciAttestationUpdateStatusRequest {
}
exports.AsaciAttestationUpdateStatusRequest = AsaciAttestationUpdateStatusRequest;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationUpdateStatusRequest.prototype, "code_demandeur", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AsaciAttestationUpdateStatusRequest.prototype, "numero_attestation", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['109', '120']) // Cancel or Suspend
    ,
    __metadata("design:type", String)
], AsaciAttestationUpdateStatusRequest.prototype, "code_operation", void 0);
class AsaciAttestationUpdateStatusResponse {
}
exports.AsaciAttestationUpdateStatusResponse = AsaciAttestationUpdateStatusResponse;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AsaciAttestationUpdateStatusResponse.prototype, "statut", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], AsaciAttestationUpdateStatusResponse.prototype, "liste_numero_attestation", void 0);
class CheckAsaciCertificateStatusRequest {
}
exports.CheckAsaciCertificateStatusRequest = CheckAsaciCertificateStatusRequest;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CheckAsaciCertificateStatusRequest.prototype, "reference_demande", void 0);
class AsaciAttestationDownloadRequest {
}
exports.AsaciAttestationDownloadRequest = AsaciAttestationDownloadRequest;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationDownloadRequest.prototype, "code_demandeur", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationDownloadRequest.prototype, "numero_demande", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsaciAttestationDownloadRequest.prototype, "code_compagnie", void 0);
class AsaciAttestationDownloadResponse {
}
exports.AsaciAttestationDownloadResponse = AsaciAttestationDownloadResponse;
class AsaciAttestationDownloadInfo {
}
exports.AsaciAttestationDownloadInfo = AsaciAttestationDownloadInfo;
//# sourceMappingURL=asaci.dto.js.map