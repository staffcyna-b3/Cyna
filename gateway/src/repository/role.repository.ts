import UserRole from "../models/UserRole";
import User from "../models/User";
import { UserRoleType } from "../enum/UserRoleType.enum";

export class RoleRepository {

    async assignRoleToUser(userId: string, role: UserRoleType) {
        await UserRole.destroy({ where: { user_id: userId } });

        return await UserRole.create({ user_id: userId, role});
    }

    async findAllUsersWithRoles() {
        return await User.findAll({
            include: [{ model: UserRole, as: "roles"}]
        });
    }

    async findUserWithRole(userId: string) {
        return await User.findByPk(userId, {
            include: [{ model: UserRole, as: "roles"}]
        });
    }

    async deleteRolesByUserId(userId: string) {
        return await UserRole.destroy({ where: { user_id: userId } });
    }


}