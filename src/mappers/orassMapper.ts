import { OrassInsuredModel } from '@/models';
import { OrassPolicyModel } from '@/models';
import {
    OrassInsuredData,
    OrassPolicyData,
    OrassInsuredDto,
    OrassPolicyDto
} from '@interfaces/orassInterfaces';
import { IvoryAttestationConstants } from '@/constants/ivoryAttestation';

export class OrassMapper {
    /**
     * Map Orass API response to OrassInsuredModel attributes
     */
    static apiToInsuredModel(apiData: OrassInsuredData): Partial<OrassInsuredModel> {
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
    static apiToPolicyModel(apiData: OrassPolicyData, insuredId: string): Partial<OrassPolicyModel> {
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
            guarantees: apiData.guarantees || null,
        };
    }

    /**
     * Map OrassInsuredModel to DTO
     */
    static insuredModelToDto(model: OrassInsuredModel): OrassInsuredDto {
        return {
            id: model.orass_id,
            firstName: model.first_name,
            lastName: model.last_name,
            email: model.email || undefined,
            phone: model.phone || undefined,
            address: model.address || undefined,
            profession: model.profession || undefined,
            type: model.type,
            dateOfBirth: model.date_of_birth?.toISOString().split('T')[0],
            nationalId: model.national_id || undefined,
            companyRegistration: model.company_registration || undefined,
        };
    }

    /**
     * Map OrassPolicyModel to DTO
     */
    static policyModelToDto(model: OrassPolicyModel): OrassPolicyDto {
        return {
            id: model.orass_id,
            policyNumber: model.policy_number,
            insuredId: model.insured_id,
            vehicleRegistration: model.vehicle_registration,
            vehicleMake: model.vehicle_make,
            vehicleModel: model.vehicle_model,
            vehicleYear: model.vehicle_year || undefined,
            vehicleType: model.vehicle_type || undefined,
            vehicleUsage: model.vehicle_usage || undefined,
            subscriptionDate: model.subscription_date.toISOString().split('T')[0],
            effectiveDate: model.effective_date.toISOString().split('T')[0],
            expirationDate: model.expiration_date.toISOString().split('T')[0],
            premiumAmount: Number(model.premium_amount),
            currency: model.currency,
            status: model.status,
            agentCode: model.agent_code || undefined,
            companyCode: model.company_code,
        };
    }

    /**
     * Map vehicle type from Orass to IvoryAttestation format
     */
    static mapVehicleTypeToIvory(orassVehicleType?: string): string {
        const mapping: Record<string, string> = {
            'passenger_car': IvoryAttestationConstants.VEHICLE_TYPES.PERSONAL,
            'commercial_vehicle': IvoryAttestationConstants.VEHICLE_TYPES.UTILITY,
            'motorcycle': IvoryAttestationConstants.VEHICLE_TYPES.MOTORCYCLE,
            'bus': IvoryAttestationConstants.VEHICLE_TYPES.BUS_LARGE,
            'taxi': IvoryAttestationConstants.VEHICLE_TYPES.TAXI_URBAN,
            'ambulance': IvoryAttestationConstants.VEHICLE_TYPES.AMBULANCE,
            'truck': IvoryAttestationConstants.VEHICLE_TYPES.UTILITY,
        };

        return mapping[orassVehicleType?.toLowerCase() || ''] || IvoryAttestationConstants.VEHICLE_TYPES.PERSONAL;
    }

    /**
     * Map vehicle usage from Orass to IvoryAttestation format
     */
    static mapVehicleUsageToIvory(orassUsage?: string): string {
        const mapping: Record<string, string> = {
            'personal': IvoryAttestationConstants.VEHICLE_USAGE.PERSONAL_BUSINESS,
            'commercial': IvoryAttestationConstants.VEHICLE_USAGE.PUBLIC_GOODS,
            'taxi': IvoryAttestationConstants.VEHICLE_USAGE.PUBLIC_PASSENGER,
            'rental': IvoryAttestationConstants.VEHICLE_USAGE.RENTAL,
            'driving_school': IvoryAttestationConstants.VEHICLE_USAGE.DRIVING_SCHOOL,
        };

        return mapping[orassUsage?.toLowerCase() || ''] || IvoryAttestationConstants.VEHICLE_USAGE.PERSONAL_BUSINESS;
    }

    /**
     * Map profession from Orass to IvoryAttestation format
     */
    static mapProfessionToIvory(orassProfession?: string): string {
        const mapping: Record<string, string> = {
            'farmer': IvoryAttestationConstants.PROFESSIONS.FARMER,
            'employee': IvoryAttestationConstants.PROFESSIONS.EMPLOYEE,
            'employer': IvoryAttestationConstants.PROFESSIONS.EMPLOYER,
            'artisan': IvoryAttestationConstants.PROFESSIONS.ARTISAN,
            'retired': IvoryAttestationConstants.PROFESSIONS.RETIRED,
            'unemployed': IvoryAttestationConstants.PROFESSIONS.UNEMPLOYED,
            'sales_representative': IvoryAttestationConstants.PROFESSIONS.SALES_REP,
            'commercial_agent': IvoryAttestationConstants.PROFESSIONS.COMMERCIAL_AGENT,
        };

        return mapping[orassProfession?.toLowerCase() || ''] || IvoryAttestationConstants.PROFESSIONS.OTHER;
    }

    /**
     * Determine vehicle category based on type and usage
     */
    static determineVehicleCategory(vehicleType?: string, usage?: string): string {
        if (usage?.toLowerCase().includes('taxi')) {
            return IvoryAttestationConstants.VEHICLE_CATEGORIES.CATEGORY_4;
        }

        if (usage?.toLowerCase().includes('commercial') || usage?.toLowerCase().includes('goods')) {
            return IvoryAttestationConstants.VEHICLE_CATEGORIES.CATEGORY_3;
        }

        if (vehicleType?.toLowerCase().includes('motorcycle')) {
            return IvoryAttestationConstants.VEHICLE_CATEGORIES.CATEGORY_5;
        }

        if (usage?.toLowerCase().includes('rental')) {
            return IvoryAttestationConstants.VEHICLE_CATEGORIES.CATEGORY_8;
        }

        if (usage?.toLowerCase().includes('driving_school')) {
            return IvoryAttestationConstants.VEHICLE_CATEGORIES.CATEGORY_7;
        }

        // Default to personal vehicle
        return IvoryAttestationConstants.VEHICLE_CATEGORIES.CATEGORY_1;
    }

    /**
     * Determine vehicle genre based on type
     */
    static determineVehicleGenre(vehicleType?: string): string {
        const type = vehicleType?.toLowerCase() || '';

        if (type.includes('motorcycle') || type.includes('scooter')) {
            return IvoryAttestationConstants.VEHICLE_GENRES.MOTORCYCLE;
        }

        if (type.includes('truck') || type.includes('lorry')) {
            return IvoryAttestationConstants.VEHICLE_GENRES.TRUCK;
        }

        if (type.includes('van') || type.includes('utility')) {
            return IvoryAttestationConstants.VEHICLE_GENRES.VAN;
        }

        if (type.includes('bus')) {
            return IvoryAttestationConstants.VEHICLE_GENRES.BUS;
        }

        // Default to car
        return IvoryAttestationConstants.VEHICLE_GENRES.CAR;
    }

    /**
     * Determine energy source from vehicle data
     */
    static determineEnergySource(vehicleYear?: number, vehicleModel?: string): string {
        const model = vehicleModel?.toLowerCase() || '';

        if (model.includes('electric') || model.includes('ev')) {
            return IvoryAttestationConstants.ENERGY_SOURCES.ELECTRIC;
        }

        if (model.includes('hybrid')) {
            return IvoryAttestationConstants.ENERGY_SOURCES.HYBRID;
        }

        if (model.includes('diesel')) {
            return IvoryAttestationConstants.ENERGY_SOURCES.DIESEL;
        }

        // Default logic based on year and common patterns
        if (vehicleYear && vehicleYear > 2015) {
            // Newer vehicles more likely to be gasoline
            return IvoryAttestationConstants.ENERGY_SOURCES.GASOLINE;
        }

        // Default to diesel for older vehicles
        return IvoryAttestationConstants.ENERGY_SOURCES.DIESEL;
    }
}