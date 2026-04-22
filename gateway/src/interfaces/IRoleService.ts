import { UserRoleType } from '../enum/UserRoleType.enum';

export interface IRoleService {
    assignRole(userId: string, role: UserRoleType): Promise<any>;
    getAllUsersWithRoles(): Promise<any[]>;
    getUserWithRole(userId: string): Promise<any | null>;
    removeUserRoles(userId: string): Promise<number>;
}
