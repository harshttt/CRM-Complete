import express from "express";
import { PermissionController } from "./permission.controller.js";
import { permit } from "../../middlewares/permission.middleware.js";

const router = express.Router();

router.get("/fetch-all", permit("permission:read"), PermissionController.getAll);
router.put("/:id", permit("permission:update"), PermissionController.updateDescription);

export default router;
