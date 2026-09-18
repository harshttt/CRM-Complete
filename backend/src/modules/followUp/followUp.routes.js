import express from "express";
import { FollowUpController } from "./followUp.controller.js";
import { permit } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { createFollowUpSchema, updateFollowUpSchema } from "./followUp.validation.js";

const router = express.Router();

router.get("/", permit("followUp:read"), FollowUpController.list);
router.get("/:id", permit("followUp:read"), FollowUpController.getById);
router.post("/", permit("followUp:create"), validate(createFollowUpSchema), FollowUpController.create);
router.put("/:id", permit("followUp:update"), validate(updateFollowUpSchema), FollowUpController.update);
router.delete("/:id", permit("followUp:delete"), FollowUpController.remove);
router.post("/:id/complete", permit("followUp:complete"), FollowUpController.complete);

export default router;
