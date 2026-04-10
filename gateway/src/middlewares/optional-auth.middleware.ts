import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next();
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded as any;
    } catch {
        // Token invalide ou expiré : on laisse passer sans user
    }

    next();
}
