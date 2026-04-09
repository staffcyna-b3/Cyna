import UserRole from "../models/UserRole";
import User from "../models/User";
import { UserRoleType } from "../enum/UserRoleType.enum";

export class RoleRepository {

    async assignRoleToUser(userId: string, role: UserRoleType) {
        // upsert : met à jour la ligne si elle existe, la crée sinon
        const [userRole] = await UserRole.upsert({ user_id: userId, role });
        return userRole;
    }

    async findAllUsersWithRoles() {
        return await User.findAll({
            include: [{ model: UserRole, as: "userRole" }]
        });
    }

    async findUserWithRole(userId: string) {
        return await User.findByPk(userId, {
            include: [{ model: UserRole, as: "userRole" }]
        });
    }

    async deleteRolesByUserId(userId: string) {
        return await UserRole.destroy({ where: { user_id: userId } });
    }
}
