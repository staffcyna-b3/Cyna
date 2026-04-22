import { UserRoleType } from '../enum/UserRoleType.enum';

export interface IRoleRepository {
    assignRoleToUser(userId: string, role: UserRoleType): Promise<any>;
    findAllUsersWithRoles(): Promise<any[]>;
    findUserWithRole(userId: string): Promise<any | null>;
    deleteRolesByUserId(userId: string): Promise<number>;
}
