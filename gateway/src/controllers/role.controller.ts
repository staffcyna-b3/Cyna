import { Request, Response } from "express";
import { IRoleService } from "../interfaces/IRoleService";
import { UserRoleType } from "../enum/UserRoleType.enum";

export class RoleController {
    constructor(private roleService: IRoleService) {}    
    
    async assignRole(req: Request, res: Response) {
        try  {
            const { userId, role } = req.body;

            if (!userId || !role) {
                return res.status(400).json({
                    success: false,
                    error: "BAD_REQUEST",
                    message: "Données manquantes",
                    timestamp: new Date().toISOString()
                });
            }

            if (!Object.values(UserRoleType).includes(role)) {
                return res.status(400).json({
                    success: false,
                    error: "BAD_REQUEST",
                    message: "Rôle invalide",
                    timestamp: new Date().toISOString()
                });
            }

            const result = await this.roleService.assignRole(userId, role);

            return res.status(200).json({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                error: "INTERNAL_ERROR",
                message: "Erreur serveur",
                timestamp: new Date().toISOString()
            });
        }
    }

    async getAllUsersWithRoles(req: Request, res: Response) {
        try {
            const users = await this.roleService.getAllUsersWithRoles();

            return res.status(200).json({
                success: true,
                data: users,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                error: "INTERNAL_ERROR",
                message: "Erreur serveur",
                timestamp: new Date().toISOString()
            });
        }
    }

    async getUserWithRole(req: Request, res: Response) {
        try {
            const { userId } = req.params as {userId: string};

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: "BAD_REQUEST",
                    message: "userId manquant",
                    timestamp: new Date().toISOString()
                });
            }

            const user = await this.roleService.getUserWithRole(userId);

            return res.status(200).json({
                success: true,
                data: user,
                timestamp: new Date().toISOString()
            });

        } catch (error) { 
            return res.status(500).json({
                success: false,
                error: "INTERNAL_ERROR",
                message: "Erreur serveur",
                timestamp: new Date().toISOString()
            });
        }
    }

    async removeUserRoles(req: Request, res: Response) {
        try {
            const { userId } = req.params as {userId: string};

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: "BAD_REQUEST",
                    message: "userId manquant",
                    timestamp: new Date().toISOString()
                });
            }

            await this.roleService.removeUserRoles(userId);

            return res.status(200).json({
                success: true,
                message: "Rôle supprimé avec succès",
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {   
            return res.status(500).json({
                success: false,
                error: "INTERNAL_ERROR",
                message: "Erreur serveur",
                timestamp: new Date().toISOString()
            });
        }
    }
}