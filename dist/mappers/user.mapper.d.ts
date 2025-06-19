import { UserModel } from '@/models';
import { UserProfile } from '@dto/user.dto';
export declare class UserMapper {
    /**
     * Maps a UserModel instance to a UserDto with validation
     */
    static toProfile(user: UserModel): UserProfile;
    private static validateId;
    private static validateEmail;
    private static validateName;
    private static validateRole;
    private static validatePermissions;
}
//# sourceMappingURL=user.mapper.d.ts.map