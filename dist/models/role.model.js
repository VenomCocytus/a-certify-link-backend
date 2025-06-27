"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleModel = void 0;
exports.initRoleModel = initRoleModel;
const sequelize_1 = require("sequelize");
class RoleModel extends sequelize_1.Model {
    // Instance methods
    hasPermission(permission) {
        return this.permissions.includes(permission);
    }
    hasAnyPermission(permissions) {
        return permissions.some(permission => this.permissions.includes(permission));
    }
    hasAllPermissions(permissions) {
        return permissions.every(permission => this.permissions.includes(permission));
    }
    // Static methods
    static async findByName(name) {
        return this.findOne({
            where: { name, isActive: true }
        });
    }
    static async getDefaultRole() {
        return this.findOne({
            where: { name: 'USER', isActive: true }
        });
    }
}
exports.RoleModel = RoleModel;
// Model initialization function
function initRoleModel(sequelize) {
    RoleModel.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                len: [2, 50],
                notEmpty: true,
                isUppercase: true
            }
        },
        description: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true
        },
        permissions: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            validate: {
                isArrayValidator(value) {
                    if (!Array.isArray(value)) {
                        throw new Error('Permissions must be an array');
                    }
                }
            }
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
            allowNull: false
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            field: 'created_at',
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            field: 'updated_at',
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Role',
        tableName: 'roles',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['name']
            },
            {
                fields: ['is_active']
            }
        ]
    });
    return RoleModel;
}
exports.default = RoleModel;
//# sourceMappingURL=role.model.js.map