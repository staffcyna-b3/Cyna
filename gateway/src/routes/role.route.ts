import { Router } from "express";
import { RoleController } from "../controllers/role.controller";
import { RoleService } from "../services/role.service";
import { RoleRepository } from "../repository/role.repository";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.guard";
import { UserRoleType } from "../enum/UserRoleType.enum";

const router = Router();

const roleRepository = new RoleRepository();
const roleService = new RoleService(roleRepository);
const controller = new RoleController(roleService);

router.post(
  "/assign",
  authMiddleware,
  requireRole(UserRoleType.ADMIN),
  controller.assignRole.bind(controller)
);

router.get(
  "/users",
  authMiddleware,
  requireRole(UserRoleType.ADMIN),
  controller.getAllUsersWithRoles.bind(controller)
);

router.get(
  "/user/:userId",
  authMiddleware,
  requireRole(UserRoleType.ADMIN),
  controller.getUserWithRole.bind(controller)
);

router.delete(
  "/user/:userId",
  authMiddleware,
  requireRole(UserRoleType.ADMIN),
  controller.removeUserRoles.bind(controller)
);

export default router;