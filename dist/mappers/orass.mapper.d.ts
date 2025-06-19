import { OrassInsuredModel } from '@/models';
import { OrassPolicyModel } from '@/models';
import { OrassInsuredData, OrassPolicyData } from '@interfaces/orass.interfaces';
export declare class OrassMapper {
    /**
     * Map Orass API response to OrassInsuredModel attributes
     */
    static apiToInsuredModel(apiData: OrassInsuredData): Partial<OrassInsuredModel>;
    /**
     * Map Orass API response to OrassPolicyModel attributes
     */
    static apiToPolicyModel(apiData: OrassPolicyData, insuredId: string): Partial<OrassPolicyModel>;
    /**
     * Map vehicle type from Orass to IvoryAttestation format
     */
    static mapVehicleTypeToIvory(orassVehicleType?: string | null): string;
    /**
     * Map vehicle usage from Orass to IvoryAttestation format
     */
    static mapVehicleUsageToIvory(orassUsage?: string | null): string;
    /**
     * Map profession from Orass to IvoryAttestation format
     */
    static mapProfessionToIvory(orassProfession?: string | null): string;
    /**
     * Determine vehicle category based on type and usage
     */
    static determineVehicleCategory(vehicleType?: string | null, usage?: string | null): string;
    /**
     * Determine vehicle genre based on type
     */
    static determineVehicleGenre(vehicleType?: string | null): string;
    /**
     * Determine energy source from vehicle data
     */
    static determineEnergySource(vehicleYear?: number | null, vehicleModel?: string): string;
}
//# sourceMappingURL=orass.mapper.d.ts.map