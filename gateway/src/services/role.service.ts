import { UserRoleType } from "../enum/UserRoleType.enum";
import { RoleRepository } from "../repository/role.repository";

export class RoleService {
    // Injection du repository via le constructeur
    constructor(private roleRepository: RoleRepository) {}  

    async assignRole(userId: string, role: UserRoleType) {
        if (!userId || !role) {
            throw new Error("Données manquantes");
        }
        return await this.roleRepository.assignRoleToUser(userId, role);
    }

    async getAllUsersWithRoles() {
        return await this.roleRepository.findAllUsersWithRoles();
    }

    async getUserWithRole(userId: string) {
        if (!userId) {
            throw new Error("userId manquant");
        }
        return await this.roleRepository.findUserWithRole(userId);
    }

    async removeUserRoles(userId: string) {
        if (!userId) {
            throw new Error("userId manquant");
        }
        return await this.roleRepository.deleteRolesByUserId(userId);
    }
}