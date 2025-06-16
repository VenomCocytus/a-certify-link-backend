import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize,
} from 'sequelize';

export interface OrassPolicyModel extends Model<
    InferAttributes<OrassPolicyModel>,
    InferCreationAttributes<OrassPolicyModel>
> {
    id: CreationOptional<string>;
    orass_id: string;
    policy_number: string;
    insured_id: ForeignKey<string>;
    vehicle_registration: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: number | null;
    vehicle_type: string | null;
    vehicle_usage: string | null;
    vehicle_chassis_number: string | null;
    vehicle_motor_number: string | null;
    subscription_date: Date;
    effective_date: Date;
    expiration_date: Date;
    premium_amount: number;
    currency: string;
    status: 'active' | 'expired' | 'cancelled' | 'suspended';
    agent_code: string | null;
    company_code: string;
    guarantees: Record<string, unknown> | null;
    created_at: CreationOptional<Date>;
    updated_at: CreationOptional<Date>;
    deleted_at: CreationOptional<Date | null>;
}

export const initOrassPolicyModel = (sequelize: Sequelize) => {
    return sequelize.define<OrassPolicyModel>(
        'OrassPolicy',
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
            policy_number: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
            },
            insured_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'orass_insured',
                    key: 'id',
                },
            },
            vehicle_registration: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            vehicle_make: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            vehicle_model: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            vehicle_year: {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: {
                    min: 1900,
                    max: new Date().getFullYear() + 1,
                },
            },
            vehicle_type: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            vehicle_usage: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            vehicle_chassis_number: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            vehicle_motor_number: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            subscription_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            effective_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            expiration_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            premium_amount: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                validate: {
                    min: 0,
                },
            },
            currency: {
                type: DataTypes.STRING(3),
                allowNull: false,
                defaultValue: 'XOF',
            },
            status: {
                type: DataTypes.ENUM('active', 'expired', 'cancelled', 'suspended'),
                allowNull: false,
                defaultValue: 'active',
            },
            agent_code: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            company_code: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            guarantees: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: 'JSON object containing policy guarantees',
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
            tableName: 'orass_policy',
            timestamps: true,
            paranoid: true,
            underscored: true,
            indexes: [
                {
                    unique: true,
                    fields: ['orass_id'],
                },
                {
                    unique: true,
                    fields: ['policy_number'],
                },
                {
                    fields: ['insured_id'],
                },
                {
                    fields: ['vehicle_registration'],
                },
                {
                    fields: ['company_code'],
                },
                {
                    fields: ['agent_code'],
                },
                {
                    fields: ['status'],
                },
                {
                    fields: ['effective_date'],
                },
                {
                    fields: ['expiration_date'],
                },
            ],
        }
    );
};