import { Request, Response } from "express";
import { login, refresh } from "../services/auth.service";

export class AuthController {
    async login(req: Request, res: Response) {
        
        const { email, password } = req.body

        try {
            const result = await login(email, password)

            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true, //le cookie ne peutpas être lu par le JS du navigateur -- protège des attaques XSS
                secure: process.env.NODE_ENV === 'production', //le cookie ne voyage qu'en HTTPS -- en dev c'est false, en prod c'est true
                sameSite: 'strict', //le cookie ne peut pas être envoyé depuis un autre site
                maxAge: 7 * 24 * 60 * 60 * 1000 //durée de vie du cookie : 7 jours en millisecondes
            })

            res.status(200).json({
                success: true,
                data: {
                    accessToken: result.accessToken,
                    user: result.user
                },
                timestamp: new Date().toISOString()
            })
        
        } catch (error: any) {
            res.status(401).json({
                success: false,
                error: "UNAUTHORIZED",
                message: error.message,
                timestamp: new Date().toISOString()
        })

        }
    }

    async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken

    try {
        const result = await refresh(refreshToken)

        res.status(200).json({
            success: true,
            data: { accessToken: result.accessToken },
            timestamp: new Date().toISOString()
        })

    } catch (error: any) {
        res.status(401).json({
            success: false,
            error: "UNAUTHORIZED",
            message: error.message,
            timestamp: new Date().toISOString()
        })
    }
    }

    async me(req: Request, res: Response) {
    res.status(200).json({
        success: true,
        data: { user: req.user },
        timestamp: new Date().toISOString()
    })
    }
}

