export declare class CertificateCreationRequest {
    policyNumber: string;
    registrationNumber: string;
    companyCode: string;
    agentCode?: string;
    requestedBy: string;
    idempotencyKey?: string;
    metadata?: Record<string, unknown>;
    constructor(init?: Partial<CertificateCreationRequest>);
    update(fields: Partial<CertificateCreationRequest>): void;
}
//# sourceMappingURL=certificate.dto.d.ts.map