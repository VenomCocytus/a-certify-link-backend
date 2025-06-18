import {IsString} from "class-validator";

export class CertificateCreationRequest {
    @IsString()
    policyNumber!: string;

    @IsString()
    registrationNumber!: string;

    @IsString()
    companyCode!: string;

    @IsString()
    agentCode?: string;

    @IsString()
    requestedBy!: string;

    @IsString()
    idempotencyKey?: string;

    @IsString()
    metadata?: Record<string, unknown>;

    constructor(init?: Partial<CertificateCreationRequest>) {
        Object.assign(this, init);
    }

    update(fields: Partial<CertificateCreationRequest>) {
        Object.assign(this, fields);
    }
}