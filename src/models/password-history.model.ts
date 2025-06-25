import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Password History attributes interface
export interface PasswordHistoryAttributes {
    id: string;
    userId: string;
    passwordHash: string;
    changedAt: Date;
}

// Optional attributes for creation
export interface PasswordHistoryCreationAttributes extends Optional<PasswordHistoryAttributes,
    'id' | 'changedAt'> {}

export class PasswordHistoryModel extends Model<PasswordHistoryAttributes, PasswordHistoryCreationAttributes>
    implements PasswordHistoryAttributes {
    public id!: string;
    public userId!: string;
    public passwordHash!: string;
    public readonly changedAt!: Date;

    // Static methods
    public static async cleanupOldPasswords(userId: string, keepCount: number = 5): Promise<void> {
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

    public static async getRecentPasswords(userId: string, count: number = 5): Promise<PasswordHistoryModel[]> {
        return this.findAll({
            where: { userId },
            order: [['changedAt', 'DESC']],
            limit: count
        });
    }
}

// Model initialization function
export function initPasswordHistoryModel(sequelize: Sequelize): typeof PasswordHistoryModel {
    PasswordHistoryModel.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            field: 'user_id',
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        passwordHash: {
            type: DataTypes.STRING(255),
            field: 'password_hash',
            allowNull: false
        },
        changedAt: {
            type: DataTypes.DATE,
            field: 'changed_at',
            allowNull: false,
            defaultValue: DataTypes.NOW
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
            afterCreate: async (passwordHistory: PasswordHistoryModel) => {
                await PasswordHistoryModel.cleanupOldPasswords(passwordHistory.userId, 5);
            }
        }
    });

    return PasswordHistoryModel;
}

export default PasswordHistoryModel;