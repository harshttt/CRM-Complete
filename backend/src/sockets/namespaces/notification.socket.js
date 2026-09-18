import logger from "../../utils/logger.js";
import socketAuth from "../../middlewares/socketAuth.middleware.js";
import {
  registerSocket,
  unregisterSocket
} from "../utils/socketUserMap.js";
import Notification from "../../modules/notification/notification.model.js";
import { NotificationDeliveryService } from "../delivery/notification.delivery.js";

export default function registerNotificationNamespace(io) {
  const nsp = io.of("/notifications");
  nsp.use(socketAuth);
  logger.info("[Socket] Notification namespace registered");
  nsp.on("connection", async socket => {
    const userId = socket.user._id.toString();
    const token = socket.token;
    registerSocket(io, userId, token, socket.id);
    logger.info(`[Socket] User ${userId} connected to /notifications`);
    try {
      const unreadNotifications = await Notification.find({
        user: userId,
        isRead: false,
        isDismissed: false,
        scheduledFor: null
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
      for (const notification of unreadNotifications) {
        NotificationDeliveryService.send(notification);
      }
    } catch (err) {
      logger.error(
        `[Socket] Failed to send unread notifications for user=${userId}`,
        err
      );
    }
    socket.on("disconnect", () => {
      unregisterSocket(userId, socket.id);
      logger.info(`[Socket] User ${userId} disconnected`);
    });
  });
}