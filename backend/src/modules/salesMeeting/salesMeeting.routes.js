import express from "express";
import { SalesMeetingController } from "./salesMeeting.controller.js";
import { permit } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import {
  createMeetingSchema,
  updateMeetingSchema,
  checkInSchema,
  checkOutSchema,
  completeSchema,
  cancelSchema,
} from "./salesMeeting.validation.js";

const router = express.Router();

// Assignable employees (role-aware dropdown)
router.get("/assignable-employees", permit("salesMeeting:read"), SalesMeetingController.assignableEmployees);

// Stats
router.get("/stats", permit("salesMeeting:read"), SalesMeetingController.stats);

// List & Detail
router.get("/", permit("salesMeeting:read"), SalesMeetingController.list);
router.get("/:id", permit("salesMeeting:read"), SalesMeetingController.getById);

// Create & Update
router.post("/", permit("salesMeeting:create"), validate(createMeetingSchema), SalesMeetingController.create);
router.put("/:id", permit("salesMeeting:update"), validate(updateMeetingSchema), SalesMeetingController.update);

// Lifecycle transitions
router.post("/:id/confirm", permit("salesMeeting:update"), SalesMeetingController.confirm);
router.post("/:id/check-in", permit("salesMeeting:update"), validate(checkInSchema), SalesMeetingController.checkIn);
router.post("/:id/start", permit("salesMeeting:update"), SalesMeetingController.start);
router.post("/:id/check-out", permit("salesMeeting:update"), validate(checkOutSchema), SalesMeetingController.checkOut);
router.post("/:id/complete", permit("salesMeeting:update"), validate(completeSchema), SalesMeetingController.complete);
router.post("/:id/cancel", permit("salesMeeting:update"), validate(cancelSchema), SalesMeetingController.cancel);

// Reopen — Manager/Admin only
router.post("/:id/reopen", permit("salesMeeting:reopen"), requireRole(1, 2, 3), SalesMeetingController.reopen);

export default router;
