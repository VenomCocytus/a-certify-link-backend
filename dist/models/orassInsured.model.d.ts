import { CreationOptional, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
export interface OrassInsuredModel extends Model<InferAttributes<OrassInsuredModel>, InferCreationAttributes<OrassInsuredModel>> {
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
export declare const initOrassInsuredModel: (sequelize: Sequelize) => import("sequelize").ModelCtor<OrassInsuredModel>;
//# sourceMappingURL=orassInsured.model.d.ts.map