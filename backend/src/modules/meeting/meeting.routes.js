import express from "express";
import { MeetingController } from "./meeting.controller.js";
import { permit } from "../../middlewares/permission.middleware.js";

const router = express.Router();

router.post("/", permit("meeting:create"), MeetingController.create);
router.patch("/:meetingId/cancel", permit("meeting:update"), MeetingController.cancel);
router.put("/:meetingId", permit("meeting:update"), MeetingController.update);
router.get("/upcoming", permit("meeting:read"), MeetingController.listUpcoming);

export default router;