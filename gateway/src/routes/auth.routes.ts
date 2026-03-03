import { Router } from 'express';
import jwt  from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import User from '../models/User'
import { authMiddleware } from '../middlewares/auth.middleware';



const router = Router();

//Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email }})

    if(!user) {
        return res.status(401).json({ 
                success: false,
                error: "Unauthorized",   
                message: "Utilisateur non trouvé",
                timestamp: new Date().toISOString()            
            })
    }

    const compare = await bcrypt.compare(password, user.password)

    if (!compare) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Mot de passe incorrect",
        timestamp: new Date().toISOString()
      });
    }

    //Palyload

    const payload = {
        userId: user.id,
        email: user.email,
        role: "user"
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

    //sauvegarder le user en bdd
    await user.update({ refresh_token: refreshToken})

    res.status(200).json({
        success: true,
        data: {
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email}
        },
        timeStamp: new Date().toISOString()
    })
})





    //Refresh
    router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            error: "UNAUTHORIZED",
            message: "Refresh token manquant",
            timestamp: new Date().toISOString()
        })
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any

        const user = await User.findOne({ where: { id: decoded.userId, refresh_token: refreshToken }})

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "UNAUTHORIZED",
                message: "Refresh token invalide",
                timestamp: new Date().toISOString()
            })
        }

        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, role: "user" },
            process.env.JWT_SECRET!,
            { expiresIn: "15m" }
        )

        res.status(200).json({
            success: true,
            data: { accessToken },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        return res.status(401).json({
            success: false,
            error: "UNAUTHORIZED",
            message: "Refresh token invalide ou expiré",
            timestamp: new Date().toISOString()
        })
    }
})






    //me 
    router.get('/me', authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        data: { user: req.user },
        timestamp: new Date().toISOString()
    })
})





export default router;
