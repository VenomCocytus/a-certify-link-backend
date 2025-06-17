import {
    Model,
    DataTypes,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import bcrypt from 'bcryptjs';

export interface UserModel extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
> {
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

    // Instance methods
    validatePassword(password: string): Promise<boolean>;
    toJSON(): Omit<UserModel, 'password'>;
}

export const initUserModel = (sequelize: Sequelize) => {
    const User = sequelize.define<UserModel>(
        'User',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            first_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            last_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            role: {
                type: DataTypes.ENUM('admin', 'agent', 'company_admin', 'viewer'),
                allowNull: false,
                defaultValue: 'viewer',
            },
            company_code: {
                type: DataTypes.STRING(20),
                allowNull: true,
                comment: 'Company code for company-specific users',
            },
            agent_code: {
                type: DataTypes.STRING(20),
                allowNull: true,
                comment: 'Agent code for agent users',
            },
            permissions: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: [],
                comment: 'Array of permission strings',
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            last_login_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            password_changed_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            failed_login_attempts: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            locked_until: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            deleted_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            tableName: 'users',
            timestamps: true,
            paranoid: true,
            underscored: true,
            indexes: [
                {
                    unique: true,
                    fields: ['email'],
                },
                {
                    fields: ['role'],
                },
                {
                    fields: ['company_code'],
                },
                {
                    fields: ['agent_code'],
                },
                {
                    fields: ['is_active'],
                },
            ],
            hooks: {
                beforeCreate: async (user: UserModel) => {
                    if (user.password) {
                        const saltRounds = 12;
                        user.password = await bcrypt.hash(user.password, saltRounds);
                        user.password_changed_at = new Date();
                    }
                },
                beforeUpdate: async (user: UserModel) => {
                    if (user.changed('password')) {
                        const saltRounds = 12;
                        user.password = await bcrypt.hash(user.password, saltRounds);
                        user.password_changed_at = new Date();
                    }
                },
            },
        }
    );

    // // Instance methods
    // User.prototype.validatePassword = async function (password: string): Promise<boolean> {
    //     return bcrypt.compare(password, this.password);
    // };
    //
    // User.prototype.toJSON = function () {
    //     const values = { ...this.get() };
    //     delete values.password;
    //     return values;
    // };

    return User;
};