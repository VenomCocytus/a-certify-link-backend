import { Options } from 'sequelize';
import { Environment } from './environment';

const sequelizeConfig: Options = {
    host: Environment.DB_HOST,
    port: Environment.DB_PORT,
    database: Environment.DB_NAME,
    username: Environment.DB_USERNAME,
    password: Environment.DB_PASSWORD,
    dialect: 'mssql' as const,
    dialectOptions: {
        encrypt: true,
        trustServerCertificate: true,
        requestTimeout: 30000,
        connectionTimeout: 30000,
        options: {
            enableArithAbort: true,
            validateBulkLoadParameters: false,
        },
    },
    pool: {
        max: Environment.DB_POOL_MAX,
        min: Environment.DB_POOL_MIN,
        acquire: Environment.DB_POOL_ACQUIRE,
        idle: Environment.DB_POOL_IDLE,
    },
    logging: Environment.NODE_ENV === 'development' ? console.log : false,
    define: {
        underscored: true,
        freezeTableName: true,
        timestamps: true,
    },
    timezone: '+00:00',
};

export { sequelizeConfig };