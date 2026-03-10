import jwt  from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import { findUserByEmail, findUserRole, updateRefreshToken } from '../repository/auth.repository';
import User from '../models/User';
import { JwtPayloadDto } from '../dto/JwtPayloadDto';

//Login
export const login = async (email: string, password: string) => {

    const user = await findUserByEmail(email)

    if (!user) {
        throw new Error('Utilisateur non trouvé')
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
        throw new Error('Mot de passe incorrect')
    }

    const role = await findUserRole(user.id)

        //Palyload
    
        const payload: JwtPayloadDto = {
            userId: user.id,
            email: user.email,
            role: role?.role as string 
        }
    
        //Access token
        const accessToken = jwt.sign(
            payload, 
            process.env.JWT_SECRET!,
            { expiresIn: "15m" }
        );
    
        //Refresh token
        const refreshToken = jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET!,
            { expiresIn: "7d" }
        )
    
        //sauvegarder le refresh token en bdd
        await updateRefreshToken(user.id, refreshToken)

        return { accessToken, refreshToken, user: { id: user.id, email: user.email }}
}


//refresh
export const refresh = async (refreshToken: string) => {
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any

    const user = await User.findOne({ where: { id: decoded.userId, refresh_token: refreshToken }})

    if (!user) {
        throw new Error('Refresh token invalide')
    }

    const role = await findUserRole(user.id)



    const payload: JwtPayloadDto = {
        userId: user.id,
        email: user.email,
        role: role?.role as string
    }

    const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
    )

    return { accessToken }

}







