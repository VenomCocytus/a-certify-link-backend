"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
const invalidData_exception_1 = require("@exceptions/invalidData.exception");
class UserMapper {
    /**
     * Maps a UserModel instance to a UserDto with validation
     */
    static toProfile(user) {
        if (!user) {
            throw new invalidData_exception_1.InvalidDataError('User model cannot be null or undefined');
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
    static validateId(id) {
        if (typeof id !== 'string' || !id) {
            throw new invalidData_exception_1.InvalidDataError('Invalid user ID');
        }
        return id;
    }
    static validateEmail(email) {
        if (typeof email !== 'string' || !email.includes('@')) {
            throw new invalidData_exception_1.InvalidDataError('Invalid email address');
        }
        return email;
    }
    static validateName(name, fieldName) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new invalidData_exception_1.InvalidDataError(`Invalid ${fieldName}`);
        }
        return name;
    }
    static validateRole(role) {
        const validRoles = ['admin', 'agent', 'company_admin', 'viewer'];
        if (typeof role !== 'string' || !validRoles.includes(role)) {
            throw new invalidData_exception_1.InvalidDataError('Invalid user role');
        }
        return role;
    }
    static validatePermissions(permissions) {
        if (!Array.isArray(permissions)) {
            return [];
        }
        return permissions.filter(p => typeof p === 'string');
    }
}
exports.UserMapper = UserMapper;
//# sourceMappingURL=user.mapper.js.map