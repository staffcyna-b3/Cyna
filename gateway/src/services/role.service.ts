import { UserRoleType } from "../enum/UserRoleType.enum";
import { RoleRepository } from "../repository/role.repository";

export class RoleService {

    private roleRepository = new RoleRepository();  

    async assignRole(userId: string, role: UserRoleType) {
        if (!userId) {
            throw new Error()
        }

        if (!role) {
            throw new Error()
        }

        return await this.roleRepository.assignRoleToUser(userId, role)
    }

    async getAllUsersWithRoles() {
        return await this.roleRepository.findAllUsersWithRoles()
    }

    async getUserWithRole(userId: string) {
        if (!userId) {
            throw new Error()
        }

        return await this.roleRepository.findUserWithRole(userId)
    }

    async removeUserRoles(userId: string) {
        if (!userId) {
            throw new Error()
        }

        return await this.roleRepository.deleteRolesByUserId(userId)
    }
}