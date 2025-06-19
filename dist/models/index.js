"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyKey = exports.CertificateAuditLog = exports.User = exports.Certificate = exports.OrassPolicy = exports.OrassInsured = exports.testConnection = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("@config/database");
const logger_1 = require("@utils/logger");
// Initialize Sequelize
exports.sequelize = new sequelize_1.Sequelize(database_1.sequelizeConfig);
// Import models
const orassInsured_model_1 = require("./orassInsured.model");
const orassPolicy_model_1 = require("./orassPolicy.model");
const certificate_model_1 = require("./certificate.model");
const user_model_1 = require("./user.model");
const certificateAuditLog_model_1 = require("./certificateAuditLog.model");
const idempotencyKey_model_1 = require("./idempotencyKey.model");
// Initialize models
const OrassInsured = (0, orassInsured_model_1.initOrassInsuredModel)(exports.sequelize);
exports.OrassInsured = OrassInsured;
const OrassPolicy = (0, orassPolicy_model_1.initOrassPolicyModel)(exports.sequelize);
exports.OrassPolicy = OrassPolicy;
const Certificate = (0, certificate_model_1.initCertificateModel)(exports.sequelize);
exports.Certificate = Certificate;
const User = (0, user_model_1.initUserModel)(exports.sequelize);
exports.User = User;
const CertificateAuditLog = (0, certificateAuditLog_model_1.initCertificateAuditLogModel)(exports.sequelize);
exports.CertificateAuditLog = CertificateAuditLog;
const IdempotencyKey = (0, idempotencyKey_model_1.initIdempotencyKeyModel)(exports.sequelize);
exports.IdempotencyKey = IdempotencyKey;
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
const testConnection = async () => {
    try {
        await exports.sequelize.authenticate();
        logger_1.logger.info('Database connection established successfully');
        return true;
    }
    catch (error) {
        logger_1.logger.error('Unable to connect to database:', error);
        return false;
    }
};
exports.testConnection = testConnection;
//# sourceMappingURL=index.js.map