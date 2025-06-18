export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'agent' | 'company_admin' | 'viewer';
    companyCode: string | null;
    agentCode: string | null;
    permissions: string[];
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
}