import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize,} from 'sequelize';

export interface IdempotencyKeyModel extends Model<
    InferAttributes<IdempotencyKeyModel>,
    InferCreationAttributes<IdempotencyKeyModel>
> {
    id: CreationOptional<string>;
    key: string;
    status: 'pending' | 'completed' | 'failed';
    request_hash: string;
    request_path: string;
    request_method: string;
    response_status: number | null;
    response_body: Record<string, unknown> | null;
    user_id: string | null;
    expires_at: Date;
    created_at: CreationOptional<Date>;
    updated_at: CreationOptional<Date>;
}

export const initIdempotencyKeyModel = (sequelize: Sequelize) => {
    return sequelize.define<IdempotencyKeyModel>(
        'IdempotencyKey',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            key: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                comment: 'Unique idempotency key provided by client',
            },
            status: {
                type: DataTypes.ENUM('pending', 'completed', 'failed'),
                allowNull: false,
                defaultValue: 'pending',
            },
            request_hash: {
                type: DataTypes.STRING(255),
                allowNull: false,
                comment: 'Hash of the request body for verification',
            },
            request_path: {
                type: DataTypes.STRING(500),
                allowNull: false,
                comment: 'API endpoint path',
            },
            request_method: {
                type: DataTypes.STRING(10),
                allowNull: false,
                comment: 'HTTP method',
            },
            response_status: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: 'HTTP response status code',
            },
            response_body: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: 'Cached response body',
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: true,
                comment: 'User who made the request',
            },
            expires_at: {
                type: DataTypes.DATE,
                allowNull: false,
                comment: 'Expiration timestamp for the idempotency key',
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'idempotency_keys',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    unique: true,
                    fields: ['key'],
                },
                {
                    fields: ['status'],
                },
                {
                    fields: ['expires_at'],
                },
                {
                    fields: ['user_id'],
                },
                {
                    fields: ['request_path', 'request_method'],
                },
            ],
        }
    );
};