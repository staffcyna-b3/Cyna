import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
   
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(401).json({ 
            success: false,
            error: "UNAUTHORIZED",
            message: "Token manquant", 
            timestamp: new Date().toISOString()
        })
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        req.user = decoded
        // Inject user context headers for downstream micro-services (e.g. payments-service)
        req.headers['x-user-id'] = decoded.userId;
        req.headers['x-user-email'] = decoded.email;
        req.headers['x-user-role'] = decoded.role;
        next()

    } catch (error) {
        return res.status(401).json({ 
            success: false,
            error: "UNAUTHORIZED",
            message: "Token invalide",
            timestamp: new Date().toISOString()
        })
    }
}