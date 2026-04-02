import { Router } from "express";
import { RoleController } from "../controllers/role.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.guard";
import { UserRoleType } from "../enum/UserRoleType.enum";

const router = Router();
const controller = new RoleController();


router.post(
  "/assign",
  authMiddleware,
  requireRole(UserRoleType.ADMIN),
  controller.assignRole.bind(controller)
);

router.get(
  "/users",
  authMiddleware,
  requireRole(UserRoleType.ADMIN, UserRoleType.COMMERCIAL),
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