"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrassMapper = void 0;
const ivoryAttestation_1 = require("@/constants/ivoryAttestation");
class OrassMapper {
    /**
     * Map Orass API response to OrassInsuredModel attributes
     */
    static apiToInsuredModel(apiData) {
        return {
            orass_id: apiData.id,
            first_name: apiData.firstName,
            last_name: apiData.lastName,
            email: apiData.email || null,
            phone: apiData.phone || null,
            address: apiData.address || null,
            profession: apiData.profession || null,
            type: apiData.type,
            date_of_birth: apiData.dateOfBirth ? new Date(apiData.dateOfBirth) : null,
            national_id: apiData.nationalId || null,
            company_registration: apiData.companyRegistration || null,
            company_code: '', // Will be set based on context
        };
    }
    /**
     * Map Orass API response to OrassPolicyModel attributes
     */
    static apiToPolicyModel(apiData, insuredId) {
        return {
            orass_id: apiData.id,
            policy_number: apiData.policyNumber,
            insured_id: insuredId,
            vehicle_registration: apiData.vehicleRegistration,
            vehicle_make: apiData.vehicleMake,
            vehicle_model: apiData.vehicleModel,
            vehicle_year: apiData.vehicleYear || null,
            vehicle_type: apiData.vehicleType || null,
            vehicle_usage: apiData.vehicleUsage || null,
            vehicle_chassis_number: apiData.vehicleChassisNumber || null,
            vehicle_motor_number: apiData.vehicleMotorNumber || null,
            subscription_date: new Date(apiData.subscriptionDate),
            effective_date: new Date(apiData.effectiveDate),
            expiration_date: new Date(apiData.expirationDate),
            premium_amount: apiData.premiumAmount,
            currency: apiData.currency,
            status: apiData.status,
            agent_code: apiData.agentCode || null,
            company_code: apiData.companyCode,
            // guarantees: apiData.guarantees || null,
        };
    }
    // /**
    //  * Map OrassInsuredModel to DTO
    //  */
    // static insuredModelToDto(model: OrassInsuredModel): OrassInsuredDto {
    //     return {
    //         id: model.orass_id,
    //         firstName: model.first_name,
    //         lastName: model.last_name,
    //         email: model.email || undefined,
    //         phone: model.phone || undefined,
    //         address: model.address || undefined,
    //         profession: model.profession || undefined,
    //         type: model.type,
    //         dateOfBirth: model.date_of_birth?.toISOString().split('T')[0],
    //         nationalId: model.national_id || undefined,
    //         companyRegistration: model.company_registration || undefined,
    //     };
    // }
    //
    // /**
    //  * Map OrassPolicyModel to DTO
    //  */
    // static policyModelToDto(model: OrassPolicyModel): OrassPolicyDto {
    //     return {
    //         id: model.orass_id,
    //         policyNumber: model.policy_number,
    //         insuredId: model.insured_id,
    //         vehicleRegistration: model.vehicle_registration,
    //         vehicleMake: model.vehicle_make,
    //         vehicleModel: model.vehicle_model,
    //         vehicleYear: model.vehicle_year || undefined,
    //         vehicleType: model.vehicle_type || undefined,
    //         vehicleUsage: model.vehicle_usage || undefined,
    //         subscriptionDate: model.subscription_date.toISOString().split('T')[0],
    //         effectiveDate: model.effective_date.toISOString().split('T')[0],
    //         expirationDate: model.expiration_date.toISOString().split('T')[0],
    //         premiumAmount: Number(model.premium_amount),
    //         currency: model.currency,
    //         status: model.status,
    //         agentCode: model.agent_code || undefined,
    //         companyCode: model.company_code,
    //     };
    // }
    /**
     * Map vehicle type from Orass to IvoryAttestation format
     */
    static mapVehicleTypeToIvory(orassVehicleType) {
        const mapping = {
            'passenger_car': ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_TYPES.PERSONAL,
            'commercial_vehicle': ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_TYPES.UTILITY,
            'motorcycle': ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_TYPES.MOTORCYCLE,
            'bus': ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_TYPES.BUS_LARGE,
            'taxi': ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_TYPES.TAXI_URBAN,
            'ambulance': ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_TYPES.AMBULANCE,
            'truck': ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_TYPES.UTILITY,
        };
        return mapping[orassVehicleType?.toLowerCase() || ''] || ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_TYPES.PERSONAL;
    }
    /**
     * Map vehicle usage from Orass to IvoryAttestation format
     */
    static mapVehicleUsageToIvory(orassUsage) {
        const mapping = {
            'personal': ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_USAGE.PERSONAL_BUSINESS,
            'commercial': ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_USAGE.PUBLIC_GOODS,
            'taxi': ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_USAGE.PUBLIC_PASSENGER,
            'rental': ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_USAGE.RENTAL,
            'driving_school': ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_USAGE.DRIVING_SCHOOL,
        };
        return mapping[orassUsage?.toLowerCase() || ''] || ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_USAGE.PERSONAL_BUSINESS;
    }
    /**
     * Map profession from Orass to IvoryAttestation format
     */
    static mapProfessionToIvory(orassProfession) {
        const mapping = {
            'farmer': ivoryAttestation_1.IvoryAttestationConstants.PROFESSIONS.FARMER,
            'employee': ivoryAttestation_1.IvoryAttestationConstants.PROFESSIONS.EMPLOYEE,
            'employer': ivoryAttestation_1.IvoryAttestationConstants.PROFESSIONS.EMPLOYER,
            'artisan': ivoryAttestation_1.IvoryAttestationConstants.PROFESSIONS.ARTISAN,
            'retired': ivoryAttestation_1.IvoryAttestationConstants.PROFESSIONS.RETIRED,
            'unemployed': ivoryAttestation_1.IvoryAttestationConstants.PROFESSIONS.UNEMPLOYED,
            'sales_representative': ivoryAttestation_1.IvoryAttestationConstants.PROFESSIONS.SALES_REP,
            'commercial_agent': ivoryAttestation_1.IvoryAttestationConstants.PROFESSIONS.COMMERCIAL_AGENT,
        };
        return mapping[orassProfession?.toLowerCase() || ''] || ivoryAttestation_1.IvoryAttestationConstants.PROFESSIONS.OTHER;
    }
    /**
     * Determine vehicle category based on type and usage
     */
    static determineVehicleCategory(vehicleType, usage) {
        if (usage?.toLowerCase().includes('taxi')) {
            return ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_CATEGORIES.CATEGORY_4;
        }
        if (usage?.toLowerCase().includes('commercial') || usage?.toLowerCase().includes('goods')) {
            return ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_CATEGORIES.CATEGORY_3;
        }
        if (vehicleType?.toLowerCase().includes('motorcycle')) {
            return ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_CATEGORIES.CATEGORY_5;
        }
        if (usage?.toLowerCase().includes('rental')) {
            return ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_CATEGORIES.CATEGORY_8;
        }
        if (usage?.toLowerCase().includes('driving_school')) {
            return ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_CATEGORIES.CATEGORY_7;
        }
        // Default to personal vehicle
        return ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_CATEGORIES.CATEGORY_1;
    }
    /**
     * Determine vehicle genre based on type
     */
    static determineVehicleGenre(vehicleType) {
        const type = vehicleType?.toLowerCase() || '';
        if (type.includes('motorcycle') || type.includes('scooter')) {
            return ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_GENRES.MOTORCYCLE;
        }
        if (type.includes('truck') || type.includes('lorry')) {
            return ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_GENRES.TRUCK;
        }
        if (type.includes('van') || type.includes('utility')) {
            return ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_GENRES.VAN;
        }
        if (type.includes('bus')) {
            return ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_GENRES.BUS;
        }
        // Default to a car
        return ivoryAttestation_1.IvoryAttestationConstants.VEHICLE_GENRES.CAR;
    }
    /**
     * Determine energy source from vehicle data
     */
    static determineEnergySource(vehicleYear, vehicleModel) {
        const model = vehicleModel?.toLowerCase() || '';
        if (model.includes('electric') || model.includes('ev')) {
            return ivoryAttestation_1.IvoryAttestationConstants.ENERGY_SOURCES.ELECTRIC;
        }
        if (model.includes('hybrid')) {
            return ivoryAttestation_1.IvoryAttestationConstants.ENERGY_SOURCES.HYBRID;
        }
        if (model.includes('diesel')) {
            return ivoryAttestation_1.IvoryAttestationConstants.ENERGY_SOURCES.DIESEL;
        }
        // Default logic based on year and common patterns
        if (vehicleYear && vehicleYear > 2015) {
            // Newer vehicles more likely to be gasoline
            return ivoryAttestation_1.IvoryAttestationConstants.ENERGY_SOURCES.GASOLINE;
        }
        // Default to diesel for older vehicles
        return ivoryAttestation_1.IvoryAttestationConstants.ENERGY_SOURCES.DIESEL;
    }
}
exports.OrassMapper = OrassMapper;
//# sourceMappingURL=orass.mapper.js.map