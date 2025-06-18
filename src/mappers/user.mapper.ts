import { UserModel } from '@/models';
import { UserProfile } from '@dto/user.dto';
import { InvalidDataError } from '@exceptions/invalidData.exception';

export class UserMapper {
    /**
     * Maps a UserModel instance to a UserDto with validation
     */
    public static toProfile(user: UserModel): UserProfile {
        if (!user) {
            throw new InvalidDataError('User model cannot be null or undefined');
        }

        return {
            id: this.validateId(user.id),
            email: this.validateEmail(user.email),
            firstName: this.validateName(user.first_name, 'First name'),
            lastName: this.validateName(user.last_name, 'Last name'),
            role: this.validateRole(user.role),
            companyCode: user.company_code ?? null,
            agentCode: user.agent_code ?? null,
            permissions: this.validatePermissions(user.permissions),
            isActive: user.is_active,
            lastLoginAt: user.last_login_at ? new Date(user.last_login_at) : null,
            createdAt: new Date(user.created_at)
        };
    }

    // Validation helper methods
    private static validateId(id: unknown): string {
        if (typeof id !== 'string' || !id) {
            throw new InvalidDataError('Invalid user ID');
        }
        return id;
    }

    private static validateEmail(email: unknown): string {
        if (typeof email !== 'string' || !email.includes('@')) {
            throw new InvalidDataError('Invalid email address');
        }
        return email;
    }

    private static validateName(name: unknown, fieldName: string): string {
        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new InvalidDataError(`Invalid ${fieldName}`);
        }
        return name;
    }

    private static validateRole(role: unknown): UserProfile['role'] {
        const validRoles = ['admin', 'agent', 'company_admin', 'viewer'];
        if (typeof role !== 'string' || !validRoles.includes(role)) {
            throw new InvalidDataError('Invalid user role');
        }
        return role as UserProfile['role'];
    }

    private static validatePermissions(permissions: unknown): string[] {
        if (!Array.isArray(permissions)) {
            return [];
        }
        return permissions.filter(p => typeof p === 'string');
    }
}