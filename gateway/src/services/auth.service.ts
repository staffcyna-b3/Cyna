import jwt  from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import { AuthRepository } from '../repository/auth.repository';
import { JwtPayloadDto } from '../dto/JwtPayloadDto';

export class AuthService {
    private repository = new AuthRepository()

    //Login
    async login (email: string, password: string)  {

        const user = await this.repository.findUserByEmail(email) 

        if (!user) {
            throw new Error('Utilisateur non trouvé')
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            throw new Error('Mot de passe incorrect')
        }

        const role = await this.repository.findUserRole(user.id)

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
            await this.repository.updateRefreshToken(user.id, refreshToken)

            return { accessToken, refreshToken, user: { id: user.id, email: user.email }}
    }


    //refresh
    async refresh (refreshToken: string) {
        
        let decoded: JwtPayloadDto

        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayloadDto
        } catch (error) {
            throw new Error('Refresh token expiré ou invalide')
        }

        const user = await this.repository.findUserByIdAndToken(decoded.userId, refreshToken)

        if (!user) {
            throw new Error('Refresh token invalide')
        }

        const role = await this.repository.findUserRole(user.id)



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
}





