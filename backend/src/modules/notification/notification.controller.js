import { NotificationService } from "./notification.service.js";
import { AppError } from "../../utils/appError.js";

export class NotificationController {
  static async list(req, res, next) {
    try {
      const unreadOnly = req.query.unread === "true";
      const notifications = await NotificationService.list(
        req.user._id,
        { unreadOnly }
      );
      res.json({ success: true, data: notifications });
    } catch (err) {
      next(err);
    }
  }

  static async unreadCount(req, res, next) {
    try {
      const count = await NotificationService.unreadCount(req.user._id);
      res.json({ success: true, data: { count } });
    } catch (err) {
      next(err);
    }
  }

  static async markRead(req, res, next) {
    try {
      const notification = await NotificationService.markAsRead(
        req.params.id,
        req.user._id
      );
      if (!notification) throw new AppError("Notification not found", 404);
      res.json({ success: true, data: notification });
    } catch (err) {
      next(err);
    }
  }

  static async dismiss(req, res, next) {
    try {
      const notification = await NotificationService.dismiss(
        req.params.id,
        req.user._id
      );
      if (!notification) throw new AppError("Notification not found", 404);
      res.json({ success: true, data: notification });
    } catch (err) {
      next(err);
    }
  }
}
