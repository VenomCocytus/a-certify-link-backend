import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Role attributes interface
export interface RoleAttributes {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Optional attributes for creation
export interface RoleCreationAttributes extends Optional<RoleAttributes,
    'id' | 'description' | 'isActive' | 'createdAt' | 'updatedAt'> {}

export class RoleModel extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
    public id!: string;
    public name!: string;
    public description?: string;
    public permissions!: string[];
    public isActive!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Instance methods
    public hasPermission(permission: string): boolean {
        return this.permissions.includes(permission);
    }

    public hasAnyPermission(permissions: string[]): boolean {
        return permissions.some(permission => this.permissions.includes(permission));
    }

    public hasAllPermissions(permissions: string[]): boolean {
        return permissions.every(permission => this.permissions.includes(permission));
    }

    // Static methods
    public static async findByName(name: string): Promise<RoleModel | null> {
        return this.findOne({
            where: { name, isActive: true }
        });
    }

    public static async getDefaultRole(): Promise<RoleModel | null> {
        return this.findOne({
            where: { name: 'USER', isActive: true }
        });
    }
}

// Helper function to serialize JSON for MSSQL
function serializeJsonRole(value: any): string | null {
    if (value === null || value === undefined) return null;
    try {
        return JSON.stringify(value);
    } catch (error) {
        console.error('Error serializing JSON:', error);
        return null;
    }
}

// Helper function to deserialize JSON for MSSQL
function deserializeJsonRole(value: string | null): any {
    if (!value) return [];
    try {
        return JSON.parse(value);
    } catch (error) {
        console.error('Error deserializing JSON:', error);
        return [];
    }
}

// Model initialization function
export function initRoleModel(sequelize: Sequelize): typeof RoleModel {
    RoleModel.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                len: [2, 50],
                notEmpty: true,
                isUppercase: true
            }
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        permissions: {
            type: DataTypes.TEXT,
            allowNull: false,
            // Remove defaultValue to avoid MSSQL ALTER COLUMN DEFAULT issues
            get() {
                const value = this.getDataValue('permissions') as unknown as string;
                return deserializeJsonRole(value);
            },
            set(value: any) {
                // Validate that value is an array
                if (!Array.isArray(value)) {
                    throw new Error('Permissions must be an array');
                }
                this.setDataValue('permissions', serializeJsonRole(value) as any);
            },
            validate: {
                isArrayValidator(value: any) {
                    // Since we're storing as string, we need to parse it first to validate
                    try {
                        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
                        if (!Array.isArray(parsed)) {
                            throw new Error('Permissions must be an array');
                        }
                    } catch (error) {
                        throw new Error('Permissions must be a valid JSON array');
                    }
                }
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at',
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updated_at',
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Role',
        tableName: 'roles',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'idx_roles_name',
                unique: true,
                fields: ['name']
            },
            {
                name: 'idx_roles_is_active',
                fields: ['is_active']
            }
        ],
        hooks: {
            beforeCreate: (role: RoleModel) => {
                if (role.isActive === undefined) role.setDataValue('isActive', true);
                if (role.permissions === undefined) role.setDataValue('permissions', []);
            }
        }
    });

    return RoleModel;
}

export default RoleModel;