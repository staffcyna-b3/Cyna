import User from "../models/User";
import UserRole from "../models/UserRole";

export const findUserByEmail = async (email: string) => {
    return await User.findOne({ where: { email } })
}

export const updateRefreshToken = async (userId: string, refreshToken: string) => {
    return await User.update({ refresh_token: refreshToken }, { where: { id: userId } })
}

export const findUserRole = async (userId: string) => {
    return await UserRole.findOne({ where: { user_id: userId } })
}