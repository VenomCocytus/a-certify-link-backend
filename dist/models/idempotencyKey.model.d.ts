import { CreationOptional, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
export interface IdempotencyKeyModel extends Model<InferAttributes<IdempotencyKeyModel>, InferCreationAttributes<IdempotencyKeyModel>> {
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
export declare const initIdempotencyKeyModel: (sequelize: Sequelize) => import("sequelize").ModelCtor<IdempotencyKeyModel>;
//# sourceMappingURL=idempotencyKey.model.d.ts.map