import { Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
export interface UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
    id: CreationOptional<string>;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'agent' | 'company_admin' | 'viewer';
    company_code: string | null;
    agent_code: string | null;
    permissions: string[];
    is_active: boolean;
    last_login_at: Date | null;
    password_changed_at: Date | null;
    failed_login_attempts: number;
    locked_until: Date | null;
    created_at: CreationOptional<Date>;
    updated_at: CreationOptional<Date>;
    deleted_at: CreationOptional<Date | null>;
    validatePassword(password: string): Promise<boolean>;
    toJSON(): Omit<UserModel, 'password'>;
}
export declare const initUserModel: (sequelize: Sequelize) => import("sequelize").ModelCtor<UserModel>;
//# sourceMappingURL=user.model.d.ts.map