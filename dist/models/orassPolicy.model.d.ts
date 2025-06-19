import { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
export interface OrassPolicyModel extends Model<InferAttributes<OrassPolicyModel>, InferCreationAttributes<OrassPolicyModel>> {
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
export declare const initOrassPolicyModel: (sequelize: Sequelize) => import("sequelize").ModelCtor<OrassPolicyModel>;
//# sourceMappingURL=orassPolicy.model.d.ts.map