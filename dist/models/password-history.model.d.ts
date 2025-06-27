import { Model, Optional, Sequelize } from 'sequelize';
export interface PasswordHistoryAttributes {
    id: string;
    userId: string;
    passwordHash: string;
    changedAt: Date;
}
export interface PasswordHistoryCreationAttributes extends Optional<PasswordHistoryAttributes, 'id' | 'changedAt'> {
}
export declare class PasswordHistoryModel extends Model<PasswordHistoryAttributes, PasswordHistoryCreationAttributes> implements PasswordHistoryAttributes {
    id: string;
    userId: string;
    passwordHash: string;
    readonly changedAt: Date;
    static cleanupOldPasswords(userId: string, keepCount?: number): Promise<void>;
    static getRecentPasswords(userId: string, count?: number): Promise<PasswordHistoryModel[]>;
}
export declare function initPasswordHistoryModel(sequelize: Sequelize): typeof PasswordHistoryModel;
export default PasswordHistoryModel;
//# sourceMappingURL=password-history.model.d.ts.map