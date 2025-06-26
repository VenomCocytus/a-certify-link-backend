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
        application_name: Environment.APP_NAME,
    },

    pool: {
        max: Math.max(1, parseInt(Environment.DB_POOL_MAX?.toString() || '5', 10)),
        min: Math.max(0, parseInt(Environment.DB_POOL_MIN?.toString() || '0', 10)),
        acquire: Environment.DB_POOL_ACQUIRE,
        idle: Environment.DB_POOL_IDLE,
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