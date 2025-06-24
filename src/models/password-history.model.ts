import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@config/database';

// Password History attributes interface
export interface PasswordHistoryAttributes {
    id: string;
    userId: string;
    passwordHash: string;
    createdAt: Date;
}

// Optional attributes for creation
export interface PasswordHistoryCreationAttributes extends Optional<PasswordHistoryAttributes,
    'id' | 'createdAt'> {}

export class PasswordHistory extends Model<PasswordHistoryAttributes, PasswordHistoryCreationAttributes>
    implements PasswordHistoryAttributes {
    public id!: string;
    public userId!: string;
    public passwordHash!: string;
    public readonly createdAt!: Date;

    // Static methods
    public static async cleanupOldPasswords(userId: string, keepCount: number = 5): Promise<void> {
        const passwords = await PasswordHistory.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            offset: keepCount
        });

        if (passwords.length > 0) {
            const idsToDelete = passwords.map(p => p.id);
            await PasswordHistory.destroy({
                where: {
                    id: idsToDelete
                }
            });
        }
    }

    public static async getRecentPasswords(userId: string, count: number = 5): Promise<PasswordHistory[]> {
        return PasswordHistory.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: count
        });
    }
}

PasswordHistory.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'PasswordHistory',
    tableName: 'password_histories',
    timestamps: false, // Only createdAt, no updatedAt
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['userId', 'createdAt']
        }
    ],
    hooks: {
        afterCreate: async (passwordHistory: PasswordHistory) => {
            // Keep only the last 5 passwords
            await PasswordHistory.cleanupOldPasswords(passwordHistory.userId, 5);
        }
    }
});

export default PasswordHistory;