import { Sequelize } from 'sequelize';
import { sequelizeConfig } from '@config/database';
import { logger } from '@utils/logger';

// Initialize Sequelize
export const sequelize = new Sequelize(sequelizeConfig);

// Import models
import { OrassInsuredModel, initOrassInsuredModel } from './orassInsured';
import { OrassPolicyModel, initOrassPolicyModel } from './orassPolicy';
import { CertificateModel, initCertificateModel } from './certificate';
import { UserModel, initUserModel } from './user';
import { CertificateAuditLogModel, initCertificateAuditLogModel } from './certificateAuditLog';
import { IdempotencyKeyModel, initIdempotencyKeyModel } from './idempotencyKey';

// Initialize models
const OrassInsured = initOrassInsuredModel(sequelize);
const OrassPolicy = initOrassPolicyModel(sequelize);
const Certificate = initCertificateModel(sequelize);
const User = initUserModel(sequelize);
const CertificateAuditLog = initCertificateAuditLogModel(sequelize);
const IdempotencyKey = initIdempotencyKeyModel(sequelize);

// Define associations
const setupAssociations = () => {
    // OrassInsured associations
    OrassInsured.hasMany(OrassPolicy, {
        foreignKey: 'insured_id',
        as: 'policies',
    });

    OrassInsured.hasMany(Certificate, {
        foreignKey: 'insured_id',
        as: 'certificates',
    });

    // OrassPolicy associations
    OrassPolicy.belongsTo(OrassInsured, {
        foreignKey: 'insured_id',
        as: 'insured',
    });

    OrassPolicy.hasMany(Certificate, {
        foreignKey: 'policy_id',
        as: 'certificates',
    });

    // Certificate associations
    Certificate.belongsTo(OrassPolicy, {
        foreignKey: 'policy_id',
        as: 'policy',
    });

    Certificate.belongsTo(OrassInsured, {
        foreignKey: 'insured_id',
        as: 'insured',
    });

    Certificate.belongsTo(User, {
        foreignKey: 'created_by',
        as: 'creator',
    });

    Certificate.hasMany(CertificateAuditLog, {
        foreignKey: 'certificate_id',
        as: 'auditLogs',
    });

    // User associations
    User.hasMany(Certificate, {
        foreignKey: 'created_by',
        as: 'createdCertificates',
    });

    User.hasMany(CertificateAuditLog, {
        foreignKey: 'user_id',
        as: 'auditLogs',
    });

    // CertificateAuditLog associations
    CertificateAuditLog.belongsTo(Certificate, {
        foreignKey: 'certificate_id',
        as: 'certificate',
    });

    CertificateAuditLog.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user',
    });
};

// Setup associations
setupAssociations();

// Test database connection
export const testConnection = async (): Promise<boolean> => {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established successfully');
        return true;
    } catch (error) {
        logger.error('Unable to connect to database:', error);
        return false;
    }
};

// Export models
export {
    OrassInsured,
    OrassPolicy,
    Certificate,
    User,
    CertificateAuditLog,
    IdempotencyKey,
};

// Export model types
export type {
    OrassInsuredModel,
    OrassPolicyModel,
    CertificateModel,
    UserModel,
    CertificateAuditLogModel,
    IdempotencyKeyModel,
};