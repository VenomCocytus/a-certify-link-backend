import { Options, Sequelize } from 'sequelize';
import { Environment } from './environment';
import { logger } from '@utils/logger';

// Extended Sequelize configuration with additional options for our models
const sequelizeConfig: Options = {
    host: Environment.DB_HOST,
    port: Environment.DB_PORT,
    database: Environment.DB_NAME,
    username: Environment.DB_USERNAME,
    password: Environment.DB_PASSWORD,
    dialect: 'postgres',
    dialectOptions: {
        ssl: Environment.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false,
        connectTimeout: 60000,
        application_name: 'eattestation-api',
    },

    pool: {
        max: Environment.DB_POOL_MAX || 20,
        min: Environment.DB_POOL_MIN || 0,
        acquire: Environment.DB_POOL_ACQUIRE || 30000,
        idle: Environment.DB_POOL_IDLE || 10000,
        evict: 1000,
    },

    logging: Environment.NODE_ENV === 'development'
        ? (sql: string, timing?: number) => {
            logger.debug(`SQL: ${sql}${timing ? ` (${timing}ms)` : ''}`);
        }
        : false,

    define: {
        underscored: true,
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: false,
        defaultScope: {},
    },

    timezone: '+00:00',

    query: {
        raw: false,
        nest: false,
    },

    retry: {
        max: 3,
        match: [
            /ETIMEDOUT/,
            /EHOSTUNREACH/,
            /ECONNRESET/,
            /ECONNREFUSED/,
            /TIMEOUT/,
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/,
        ],
    },

    benchmark: Environment.NODE_ENV === 'development',

    sync: {
        force: false,
        alter: Environment.NODE_ENV === 'development',
        hooks: true,
        logging: Environment.NODE_ENV === 'development' ? console.log : false,
    },
};

const sequelize = new Sequelize(sequelizeConfig);

export default sequelize;