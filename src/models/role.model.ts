import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@config/database';

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

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
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
    public static async findByName(name: string): Promise<Role | null> {
        return Role.findOne({
            where: { name, isActive: true }
        });
    }

    public static async getDefaultRole(): Promise<Role | null> {
        return Role.findOne({
            where: { name: 'USER', isActive: true }
        });
    }
}

Role.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
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
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        validate: {
            isArray: {
                msg: 'Permissions must be an array',  // Validation message
                args: true  // Indicates we want array validation
            }
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['name']
        },
        {
            fields: ['isActive']
        }
    ]
});

export default Role;