"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordHistoryModel = void 0;
exports.initPasswordHistoryModel = initPasswordHistoryModel;
const sequelize_1 = require("sequelize");
class PasswordHistoryModel extends sequelize_1.Model {
    // Static methods
    static async cleanupOldPasswords(userId, keepCount = 5) {
        const passwords = await this.findAll({
            where: { userId },
            order: [['changedAt', 'DESC']],
            offset: keepCount
        });
        if (passwords.length > 0) {
            const idsToDelete = passwords.map(p => p.id);
            await this.destroy({
                where: {
                    id: idsToDelete
                }
            });
        }
    }
    static async getRecentPasswords(userId, count = 5) {
        return this.findAll({
            where: { userId },
            order: [['changedAt', 'DESC']],
            limit: count
        });
    }
}
exports.PasswordHistoryModel = PasswordHistoryModel;
// Model initialization function
function initPasswordHistoryModel(sequelize) {
    PasswordHistoryModel.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            field: 'user_id',
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        passwordHash: {
            type: sequelize_1.DataTypes.STRING(255),
            field: 'password_hash',
            allowNull: false
        },
        changedAt: {
            type: sequelize_1.DataTypes.DATE,
            field: 'changed_at',
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'PasswordHistory',
        tableName: 'password_histories',
        timestamps: false,
        underscored: true,
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['user_id', 'changed_at']
            }
        ],
        hooks: {
            afterCreate: async (passwordHistory) => {
                await PasswordHistoryModel.cleanupOldPasswords(passwordHistory.userId, 5);
            }
        }
    });
    return PasswordHistoryModel;
}
exports.default = PasswordHistoryModel;
//# sourceMappingURL=password-history.model.js.map