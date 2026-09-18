import express from "express";
import { NotificationController } from "./notification.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", NotificationController.list);
router.get("/unread-count", NotificationController.unreadCount);
router.patch("/:id/read", NotificationController.markRead);
router.patch("/:id/dismiss", NotificationController.dismiss);

export default router;
