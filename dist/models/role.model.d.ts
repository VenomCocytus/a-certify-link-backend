import { Model, Optional, Sequelize } from 'sequelize';
export interface RoleAttributes {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'description' | 'isActive' | 'createdAt' | 'updatedAt'> {
}
export declare class RoleModel extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    hasPermission(permission: string): boolean;
    hasAnyPermission(permissions: string[]): boolean;
    hasAllPermissions(permissions: string[]): boolean;
    static findByName(name: string): Promise<RoleModel | null>;
    static getDefaultRole(): Promise<RoleModel | null>;
}
export declare function initRoleModel(sequelize: Sequelize): typeof RoleModel;
export default RoleModel;
//# sourceMappingURL=role.model.d.ts.map