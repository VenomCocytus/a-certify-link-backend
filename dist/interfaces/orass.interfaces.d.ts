export interface OrassInsuredData {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    profession?: string;
    type: 'individual' | 'corporate';
    dateOfBirth?: string;
    nationalId?: string;
    companyRegistration?: string;
    createdAt: string;
    updatedAt: string;
}
export interface OrassPolicyData {
    id: string;
    policyNumber: string;
    insuredId: string;
    vehicleRegistration: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear?: number;
    vehicleType?: string;
    vehicleUsage?: string;
    vehicleChassisNumber?: string;
    vehicleMotorNumber?: string;
    subscriptionDate: string;
    effectiveDate: string;
    expirationDate: string;
    premiumAmount: number;
    currency: string;
    status: 'active' | 'expired' | 'cancelled' | 'suspended';
    agentCode?: string;
    companyCode: string;
    guarantees?: OrassGuarantee[];
    createdAt: string;
    updatedAt: string;
}
export interface OrassGuarantee {
    id: string;
    name: string;
    code: string;
    amount: number;
    description?: string;
}
export interface OrassApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errorCode?: string;
    timestamp: string;
}
export interface OrassErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    timestamp: string;
}
export interface OrassAuthRequest {
    apiKey: string;
    timestamp: string;
    signature?: string;
}
export interface OrassAuthResponse {
    token: string;
    expiresIn: number;
    tokenType: string;
}
export interface OrassQueryParams {
    policyNumber?: string;
    insuredId?: string;
    vehicleRegistration?: string;
    companyCode?: string;
    status?: string;
    page?: number;
    limit?: number;
}
export interface OrassInsuredQueryParams {
    nationalId?: string;
    email?: string;
    phone?: string;
    companyRegistration?: string;
    type?: 'individual' | 'corporate';
    page?: number;
    limit?: number;
}
//# sourceMappingURL=orass.interfaces.d.ts.map