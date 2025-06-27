import { UserModel } from './user.model';
import { RoleModel } from './role.model';
import sequelize from '@config/database';
import { PasswordHistoryModel } from './password-history.model';
import { AsaciRequestModel } from './asaci-request.model';
import { OperationLogModel } from './operation-log.model';
export declare function initializeDatabase(): Promise<void>;
export declare function checkDatabaseHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: any;
}>;
export { sequelize };
export declare function getUser(): typeof UserModel;
export declare function getRole(): typeof RoleModel;
export declare function getPasswordHistory(): typeof PasswordHistoryModel;
export declare function getAsaciRequest(): typeof AsaciRequestModel;
export declare function getOperationLog(): typeof OperationLogModel;
export declare function getModels(): {
    User: typeof UserModel;
    Role: typeof RoleModel;
    PasswordHistory: typeof PasswordHistoryModel;
    AsaciRequest: typeof AsaciRequestModel;
    OperationLog: typeof OperationLogModel;
};
//# sourceMappingURL=index.d.ts.map