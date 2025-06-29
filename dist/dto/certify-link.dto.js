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
exports.OrassPolicyResponseDto = exports.ValidateOrassPolicyDto = exports.BulkCreateCertificatesFromOrassDto = exports.CreateCertificateFromOrassDto = exports.SearchOrassPoliciesDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const asaci_dto_1 = require("@dto/asaci.dto");
// DTO for searching ORASS policies
class SearchOrassPoliciesDto {
    constructor() {
        this.limit = 100;
        this.offset = 0;
    }
}
exports.SearchOrassPoliciesDto = SearchOrassPoliciesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], SearchOrassPoliciesDto.prototype, "policyNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()?.toUpperCase()),
    __metadata("design:type", String)
], SearchOrassPoliciesDto.prototype, "vehicleRegistration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()?.toUpperCase()),
    __metadata("design:type", String)
], SearchOrassPoliciesDto.prototype, "vehicleChassisNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], SearchOrassPoliciesDto.prototype, "subscriberName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], SearchOrassPoliciesDto.prototype, "insuredName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchOrassPoliciesDto.prototype, "organizationCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchOrassPoliciesDto.prototype, "officeCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SearchOrassPoliciesDto.prototype, "contractStartDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SearchOrassPoliciesDto.prototype, "contractEndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchOrassPoliciesDto.prototype, "certificateColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SearchOrassPoliciesDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SearchOrassPoliciesDto.prototype, "offset", void 0);
// DTO for creating certificate production from ORASS policy
class CreateCertificateFromOrassDto {
}
exports.CreateCertificateFromOrassDto = CreateCertificateFromOrassDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCertificateFromOrassDto.prototype, "policyNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(asaci_dto_1.CertificateType),
    __metadata("design:type", String)
], CreateCertificateFromOrassDto.prototype, "certificateType", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCertificateFromOrassDto.prototype, "emailNotification", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCertificateFromOrassDto.prototype, "generatedBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(asaci_dto_1.ChannelType),
    __metadata("design:type", String)
], CreateCertificateFromOrassDto.prototype, "channel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCertificateFromOrassDto.prototype, "certificateColor", void 0);
// DTO for bulk certificate creation from multiple ORASS policies
class BulkCreateCertificatesFromOrassDto {
    constructor() {
        this.channel = 'api';
    }
}
exports.BulkCreateCertificatesFromOrassDto = BulkCreateCertificatesFromOrassDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one policy number is required' }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkCreateCertificatesFromOrassDto.prototype, "policyNumbers", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkCreateCertificatesFromOrassDto.prototype, "certificateType", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkCreateCertificatesFromOrassDto.prototype, "emailNotification", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkCreateCertificatesFromOrassDto.prototype, "generatedBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['api', 'web']),
    __metadata("design:type", String)
], BulkCreateCertificatesFromOrassDto.prototype, "channel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkCreateCertificatesFromOrassDto.prototype, "defaultCertificateColor", void 0);
// DTO for validating ORASS policy before certificate creation
class ValidateOrassPolicyDto {
}
exports.ValidateOrassPolicyDto = ValidateOrassPolicyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ValidateOrassPolicyDto.prototype, "policyNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateOrassPolicyDto.prototype, "expectedVehicleRegistration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateOrassPolicyDto.prototype, "expectedChassisNumber", void 0);
// Response DTO for ORASS policy search
class OrassPolicyResponseDto {
}
exports.OrassPolicyResponseDto = OrassPolicyResponseDto;
//# sourceMappingURL=certify-link.dto.js.map