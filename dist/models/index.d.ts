import { Sequelize } from 'sequelize';
export declare const sequelize: Sequelize;
import { OrassInsuredModel } from './orassInsured.model';
import { OrassPolicyModel } from './orassPolicy.model';
import { CertificateModel } from './certificate.model';
import { UserModel } from './user.model';
import { CertificateAuditLogModel } from './certificateAuditLog.model';
import { IdempotencyKeyModel } from './idempotencyKey.model';
declare const OrassInsured: import("sequelize").ModelCtor<OrassInsuredModel>;
declare const OrassPolicy: import("sequelize").ModelCtor<OrassPolicyModel>;
declare const Certificate: import("sequelize").ModelCtor<CertificateModel>;
declare const User: import("sequelize").ModelCtor<UserModel>;
declare const CertificateAuditLog: import("sequelize").ModelCtor<CertificateAuditLogModel>;
declare const IdempotencyKey: import("sequelize").ModelCtor<IdempotencyKeyModel>;
export declare const testConnection: () => Promise<boolean>;
export { OrassInsured, OrassPolicy, Certificate, User, CertificateAuditLog, IdempotencyKey, };
export type { OrassInsuredModel, OrassPolicyModel, CertificateModel, UserModel, CertificateAuditLogModel, IdempotencyKeyModel, };
//# sourceMappingURL=index.d.ts.map