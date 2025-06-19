import { Options } from 'sequelize';
import { Environment } from './environment';

const isTrusted = Environment.DB_TRUSTED_CONNECTION === 'true';

const sequelizeConfig: Options = {
    host: Environment.DB_HOST,
    port: Environment.DB_PORT,
    database: Environment.DB_NAME,
    dialect: 'mssql' as const,
    ...(isTrusted
            ? {
                dialectOptions: {
                    options: {
                        encrypt: true,
                        trustServerCertificate: true,
                        enableArithAbort: true,
                        validateBulkLoadParameters: false,
                    },
                    trustedConnection: true,
                    requestTimeout: 30000,
                    connectionTimeout: 30000,
                },
            }
            : {
                username: Environment.DB_USERNAME,
                password: Environment.DB_PASSWORD,
                dialectOptions: {
                    options: {
                        encrypt: true,
                        trustServerCertificate: true,
                        enableArithAbort: true,
                        validateBulkLoadParameters: false,
                    },
                    requestTimeout: 30000,
                    connectionTimeout: 30000,
                },
            }
    ),
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