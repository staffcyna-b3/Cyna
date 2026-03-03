import { Request, Response, NextFunction } from "express";
import { UserRoleType } from "../enum/UserRoleType.enum";

export const requireRole = (...roles: UserRoleType[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        
        if(!req.user) {
            return res.status(401).json({ 
                success: false,
                error: "UNAUTHORIZED",
                message: "Non authentifié",
                timestamp: new Date().toISOString()
            })
        } 

        if(!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                error: "Forbidden",   
                message: "Accès interdit",
                timestamp: new Date().toISOString()            
            })
        }

        next()

    }

}