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
exports.CertificateCreationRequest = void 0;
const class_validator_1 = require("class-validator");
class CertificateCreationRequest {
    constructor(init) {
        Object.assign(this, init);
    }
    update(fields) {
        Object.assign(this, fields);
    }
}
exports.CertificateCreationRequest = CertificateCreationRequest;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CertificateCreationRequest.prototype, "policyNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CertificateCreationRequest.prototype, "registrationNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CertificateCreationRequest.prototype, "companyCode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CertificateCreationRequest.prototype, "agentCode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CertificateCreationRequest.prototype, "requestedBy", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CertificateCreationRequest.prototype, "idempotencyKey", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], CertificateCreationRequest.prototype, "metadata", void 0);
//# sourceMappingURL=certificate.dto.js.map