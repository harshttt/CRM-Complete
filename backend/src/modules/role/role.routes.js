import express from "express";
import { RoleController } from "./role.controller.js";
import { permit } from "../../middlewares/permission.middleware.js";

const router = express.Router();

router.post("/create", permit("role:create"), RoleController.createRole);
router.get("/fetch-all", permit("role:read"), RoleController.getAllRoles);
router.get("/:id", permit("role:read"), RoleController.getRole);
router.put("/:id", permit("role:update"), RoleController.updateRole);
router.delete("/:id", permit("role:delete"), RoleController.deleteRole);
router.patch("/:id/restore", permit("role:restore"), RoleController.restoreRole);
router.get("/", permit("role:read"), RoleController.getRoleDropdown);
export default router;