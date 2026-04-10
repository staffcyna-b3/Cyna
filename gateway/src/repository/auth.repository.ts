import User from "../models/User";
import UserRole from "../models/UserRole";


export class AuthRepository {

    async findUserByEmail (email: string)  {
        return await User.findOne({ where: { email } })
    }

    async updateRefreshToken (userId: string, refreshToken: string) {
        return await User.update({ refresh_token: refreshToken }, { where: { id: userId } })
    }

    async findUserRole (userId: string) {
        return await UserRole.findOne({ where: { user_id: userId } })
    }

    async findUserByIdAndToken(userId: string, refreshToken: string) {
        return await User.findOne({ where: { id: userId, refresh_token: refreshToken } })
    }

    async findUserById (userId: string) {
        return await User.findOne({ where: { id: userId } })
    }
}