import { AsaciAttestationEditionRequest } from '@dto/asaci.dto';
import {
    AsaciAttestationEditionRequest,
    AsaciAttestationEditionResponse,
    AsaciAttestationInfo
} from '@interfaces/ivoryAttestation.interfaces';
import { OrassPolicyModel } from '@/models';
import { OrassInsuredModel } from '@/models';
import { IvoryAttestationConstants } from '@/constants/ivoryAttestation';
import { OrassMapper } from './orass.mapper';
import { Helpers } from '@utils/helpers';

export class IvoryAttestationMapper {
    /**
     * Map certificate request and Orass data to IvoryAttestation request format
     */
    static toIvoryEditionRequest(
        certificateRequest: AsaciAttestationEditionRequest,
        policy: OrassPolicyModel,
        insured: OrassInsuredModel,
        companyCode: string,
        agentCode?: string
    ): AsaciAttestationEditionRequest {
        return {
            code_compagnie: companyCode,
            date_demande_edition: Helpers.formatDateForIvory(new Date()),
            date_souscription: Helpers.formatDateForIvory(policy.subscription_date),
            date_effet: Helpers.formatDateForIvory(policy.effective_date),
            date_echeance: Helpers.formatDateForIvory(policy.expiration_date),

            // Vehicle information
            genre_vehicule: OrassMapper.determineVehicleGenre(policy.vehicle_type),
            numero_immatriculation: policy.vehicle_registration,
            type_vehicule: OrassMapper.mapVehicleTypeToIvory(policy.vehicle_type),
            model_vehicule: policy.vehicle_model,
            categorie_vehicule: OrassMapper.determineVehicleCategory(policy.vehicle_type, policy.vehicle_usage),
            usage_vehicule: OrassMapper.mapVehicleUsageToIvory(policy.vehicle_usage),
            source_energie: OrassMapper.determineEnergySource(policy.vehicle_year, policy.vehicle_model),
            nombre_place: this.estimateSeatingCapacity(policy.vehicle_type),
            marque_vehicule: policy.vehicle_make,
            numero_chassis: policy.vehicle_chassis_number || 'NA',
            numero_moteur: policy.vehicle_motor_number || 'NA',

            // Card information
            numero_carte_brune_physique: this.generateCardNumber(policy.policy_number),

            // Subscriber information (policyholder)
            numero_rccm: insured.company_registration || 'NA',
            bureau_enregistreur: 'NA',
            nom_souscripteur: `${insured.first_name} ${insured.last_name}`,
            type_souscripteur: insured.type === 'individual'
                ? IvoryAttestationConstants.SUBSCRIBER_TYPES.PHYSICAL_PERSON
                : IvoryAttestationConstants.SUBSCRIBER_TYPES.LEGAL_ENTITY,
            adresse_mail_souscripteur: insured.email || 'noemail@example.com',
            numero_telephone_souscripteur: insured.phone || '0000000000',
            boite_postale_souscripteur: 'NA',

            // Insured information (can be the same as subscriber)
            type_assure: insured.type === 'individual'
                ? IvoryAttestationConstants.INSURED_TYPES.PHYSICAL_PERSON
                : IvoryAttestationConstants.INSURED_TYPES.LEGAL_ENTITY,
            nom_assure: `${insured.first_name} ${insured.last_name}`,
            adresse_mail_assure: insured.email || 'noemail@example.com',
            boite_postale_assure: 'NA',
            numero_police: policy.policy_number,
            numero_telephone_assure: insured.phone || '0000000000',
            profession_assure: OrassMapper.mapProfessionToIvory(insured.profession),

            // Sales point information
            type_point_vente_compagnie: 'AGENCE',
            code_point_vente_compagnie: agentCode || 'MAIN',
            denomination_point_vente_compagnie: 'Point de vente principal',

            // Financial information
            rc: this.calculateRC(policy.guarantees),
            code_nature_attestation: this.determineCertificateColor(policy.vehicle_type, policy.vehicle_usage),
            garantie: JSON.stringify(policy.guarantees || {}),
            contrat: JSON.stringify({
                policyNumber: policy.policy_number,
                type: 'AUTO',
                duration: this.calculateContractDuration(policy.effective_date, policy.expiration_date),
            }),
            zone_circulation: 'CIV002', // Default to Abidjan. This should be configurable
            date_premiere_mise_en_circulation: Helpers.formatDateForIvory(new Date(policy.vehicle_year || 2020, 0, 1)),

            // Amounts (convert from policy premium breakdown)
            valeur_neuve: this.estimateVehicleValue(policy.vehicle_year, policy.vehicle_make, policy.vehicle_model).toString(),
            valeur_venale: this.estimateVehicleValue(policy.vehicle_year, policy.vehicle_make, policy.vehicle_model, 0.7).toString(),
            montant_autres_garanties: this.calculateOtherGuarantees(policy.guarantees).toString(),
            montant_prime_nette_total: policy.premium_amount.toString(),
            montant_accessoires: this.calculateAccessories(Number(policy.premium_amount)).toString(),
            montant_taxes: this.calculateTaxes(Number(policy.premium_amount)).toString(),
            montant_carte_brune: this.calculateCardFee().toString(),
            fga: this.calculateFGA(Number(policy.premium_amount)).toString(),
            montant_prime_ttc: this.calculateTotalPremium(Number(policy.premium_amount)).toString(),
        };
    }

    /**
     * Map IvoryAttestation response to internal format
     */
    static fromIvoryEditionResponse(response: AsaciAttestationEditionResponse): {
        success: boolean;
        requestNumber?: string;
        certificateInfo?: AsaciAttestationInfo[];
        errorCode?: number;
        errorMessage?: string;
    } {
        const isSuccess = response.statut === IvoryAttestationConstants.STATUS_CODES.SUCCESS;

        return {
            success: isSuccess,
            requestNumber: response.numero_demande,
            certificateInfo: response.infos,
            errorCode: response.statut,
            errorMessage: isSuccess ? undefined : this.getErrorMessage(response.statut),
        };
    }

    /**
     * Get an error message for IvoryAttestation status code
     */
    static getErrorMessage(statusCode: number): string {
        const errorMessages: Record<number, string> = {
            [-36]: 'Unauthorized to use the edition API',
            [-35]: 'Duplicate exists in database',
            [-34]: 'Invalid circulation zone code',
            [-33]: 'Invalid subscriber type code',
            [-32]: 'Invalid insured type code',
            [-31]: 'Invalid profession code',
            [-30]: 'Invalid vehicle type code',
            [-29]: 'Invalid vehicle usage code',
            [-28]: 'Invalid vehicle genre code',
            [-27]: 'Invalid energy source code',
            [-26]: 'Invalid vehicle category code',
            [-25]: 'No relationship between intermediary and company',
            [-24]: 'Invalid insured email address',
            [-23]: 'Invalid subscriber email address',
            [-22]: 'Invalid certificate color code',
            [-21]: 'Subscription date is before edition request date',
            [-20]: 'Effect date is before subscription date',
            [-19]: 'Invalid date format',
            [-18]: 'Data error in line',
            [-17]: 'System error',
            [-16]: 'Save error',
            [-15]: 'Edition failed',
            [-14]: 'Certificate authorization error',
            [-13]: 'Authentication error',
            [-12]: 'Incorrect access code',
            [-11]: 'Invalid file format',
            [-10]: 'Invalid file structure',
            [-9]: 'Invalid file data',
            [-8]: 'Incorrect authentication',
            [-7]: 'Effect date and expiration date error',
            [-6]: 'Contract duration error',
            [-5]: 'Company certificate stock error',
            [-4]: 'Intermediary certificate stock error',
            [-3]: 'Invalid intermediary code',
            [-2]: 'Invalid company code',
            [-1]: 'Duplicate error',
            [0]: 'Rate limit exceeded',
        };

        return errorMessages[statusCode] || `Unknown error code: ${statusCode}`;
    }

    /**
     * Estimate seating capacity based on a vehicle type
     */
    private static estimateSeatingCapacity(vehicleType?: string | null): string {
        const type = vehicleType?.toLowerCase() || '';

        if (type.includes('motorcycle')) return '2';
        if (type.includes('bus')) return '50';
        if (type.includes('minibus')) return '15';
        if (type.includes('truck')) return '3';
        if (type.includes('van')) return '9';

        return '5'; // Default for cars
    }

    /**
     * Generate card number based on policy number
     */
    private static generateCardNumber(policyNumber: string): string {
        // Generate a card number based on the policy number
        const timestamp = Date.now().toString().slice(-6);
        return `CB${policyNumber.slice(-4)}${timestamp}`;
    }

    /**
     * Calculate RC amount from guarantees
     */
    private static calculateRC(guarantees: any): string {
        if (guarantees && guarantees.rc) {
            return guarantees.rc.toString();
        }
        // Default RC amount for the Ivory Coast
        return '10000000'; // 10M XOF
    }

    /**
     * Determine certificate color based on vehicle type and usage
     */
    private static determineCertificateColor(vehicleType?: string | null, usage?: string | null): string {
        if (usage?.toLowerCase().includes('taxi')) {
            return IvoryAttestationConstants.CERTIFICATE_COLORS.BLUE_MATCA;
        }

        if (usage?.toLowerCase().includes('commercial')) {
            return IvoryAttestationConstants.CERTIFICATE_COLORS.BROWN;
        }

        if (usage?.toLowerCase().includes('public')) {
            return IvoryAttestationConstants.CERTIFICATE_COLORS.GREEN;
        }

        // Default to yellow for personal vehicles
        return IvoryAttestationConstants.CERTIFICATE_COLORS.YELLOW;
    }

    /**
     * Calculate contract duration in the past months
     */
    private static calculateContractDuration(effectiveDate: Date, expirationDate: Date): number {
        const diffTime = Math.abs(expirationDate.getTime() - effectiveDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.round(diffDays / 30); // Convert to months
    }

    /**
     * Estimate vehicle value based on year, make, and model
     */
    private static estimateVehicleValue(
        year?: number | null,
        make?: string,
        model?: string,
        depreciationFactor: number = 1
    ): number {
        // Basic vehicle valuation logic
        const currentYear = new Date().getFullYear();
        const vehicleYear = year || currentYear - 5;
        const age = currentYear - vehicleYear;

        // Base values by make (in XOF)
        const baseValues: Record<string, number> = {
            'toyota': 15000000,
            'honda': 12000000,
            'nissan': 10000000,
            'hyundai': 8000000,
            'kia': 7000000,
            'peugeot': 9000000,
            'renault': 8500000,
            'volkswagen': 11000000,
        };

        const makeLower = make?.toLowerCase() || '';
        let baseValue = baseValues[makeLower] || 8000000; // Default 8M XOF

        // Apply depreciation
        const depreciationRate = 0.15; // 15% per year
        const depreciation = Math.min(age * depreciationRate, 0.8); // Max 80% depreciation
        const currentValue = baseValue * (1 - depreciation);

        return Math.round(currentValue * depreciationFactor);
    }

    /**
     * Calculate other guarantees amount
     */
    private static calculateOtherGuarantees(guarantees: any): number {
        if (!guarantees) return 0;

        let total = 0;
        Object.entries(guarantees).forEach(([key, value]) => {
            if (key !== 'rc' && typeof value === 'number') {
                total += value;
            }
        });

        return total;
    }

    /**
     * Calculate accessories amount (typically 5% of premium)
     */
    private static calculateAccessories(premium: number): number {
        return Math.round(premium * 0.05);
    }

    /**
     * Calculate taxes (TVA + other taxes, typically 18% in the Ivory Coast)
     */
    private static calculateTaxes(premium: number): number {
        return Math.round(premium * 0.18);
    }

    /**
     * Calculate card fee (fixed amount)
     */
    private static calculateCardFee(): number {
        return 5000; // 5,000 XOF
    }

    /**
     * Calculate FGA (Fonds de Garantie Automobile, typically 1% of premium)
     */
    private static calculateFGA(premium: number): number {
        return Math.round(premium * 0.01);
    }

    /**
     * Calculate total premium including all fees and taxes
     */
    private static calculateTotalPremium(basePremium: number): number {
        const accessories = this.calculateAccessories(basePremium);
        const taxes = this.calculateTaxes(basePremium);
        const cardFee = this.calculateCardFee();
        const fga = this.calculateFGA(basePremium);

        return basePremium + accessories + taxes + cardFee + fga;
    }
}