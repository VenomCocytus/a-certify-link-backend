import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize,} from 'sequelize';

export interface OrassInsuredModel extends Model<
    InferAttributes<OrassInsuredModel>,
    InferCreationAttributes<OrassInsuredModel>
> {
    id: CreationOptional<string>;
    orass_id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    profession: string | null;
    type: 'individual' | 'corporate';
    date_of_birth: Date | null;
    national_id: string | null;
    company_registration: string | null;
    company_code: string;
    created_at: CreationOptional<Date>;
    updated_at: CreationOptional<Date>;
    deleted_at: CreationOptional<Date | null>;
}

export const initOrassInsuredModel = (sequelize: Sequelize) => {
    return sequelize.define<OrassInsuredModel>(
        'OrassInsured',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            orass_id: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
                comment: 'Unique identifier from Orass system',
            },
            first_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            last_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: true,
                validate: {
                    isEmail: true,
                },
            },
            phone: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            profession: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            type: {
                type: DataTypes.ENUM('individual', 'corporate'),
                allowNull: false,
                defaultValue: 'individual',
            },
            date_of_birth: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            national_id: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            company_registration: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            company_code: {
                type: DataTypes.STRING(20),
                allowNull: false,
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
            tableName: 'orass_insured',
            timestamps: true,
            paranoid: true,
            underscored: true,
            indexes: [
                {
                    unique: true,
                    fields: ['orass_id'],
                },
                {
                    fields: ['company_code'],
                },
                {
                    fields: ['type'],
                },
                {
                    fields: ['email'],
                },
                {
                    fields: ['national_id'],
                },
                {
                    fields: ['company_registration'],
                },
            ],
        }
    );
};