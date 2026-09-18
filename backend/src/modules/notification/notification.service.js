import Notification from "./notification.model.js";
import { buildRedirectUrl } from "./notification.helper.js";
import { NotificationDeliveryService } from "../../sockets/delivery/notification.delivery.js";

export class NotificationService {

  static async create(data) {
    const {
      user,
      type,
      channelId,
      entityId = null,
      title,
      message,
      scheduledFor = null,
      allowResend = false,
      maxRetries = 3,
      metadata = {},
      dedupeKey = null
    } = data;

    if (dedupeKey) {
      const exists = await Notification.findOne({ dedupeKey, user });
      if (exists) return exists;
    }

    const notification = await Notification.create({
      user,
      type,
      channelId,
      entityId,
      title,
      message,
      redirectUrl: buildRedirectUrl(channelId, entityId),
      scheduledFor,
      allowResend,
      maxRetries,
      metadata,
      dedupeKey
    });
    if (!scheduledFor) {
      NotificationDeliveryService.send(notification);
    }

    return notification;
  }

  static async createForUsers(userIds = [], data) {
    if (!Array.isArray(userIds) || userIds.length === 0) return [];

    const {
      type,
      channelId,
      entityId = null,
      title,
      message,
      scheduledFor = null,
      allowResend = false,
      maxRetries = 3,
      metadata = {},
      dedupeKeyPrefix = null
    } = data;

    const notifications = [];

    for (const userId of userIds) {
      const dedupeKey = dedupeKeyPrefix
        ? `${dedupeKeyPrefix}:${userId}`
        : null;

      if (dedupeKey) {
        const exists = await Notification.findOne({
          dedupeKey,
          user: userId
        });
        if (exists) continue;
      }

      notifications.push({
        user: userId,
        type,
        channelId,
        entityId,
        title,
        message,
        redirectUrl: buildRedirectUrl(channelId, entityId),
        scheduledFor,
        allowResend,
        maxRetries,
        metadata,
        dedupeKey
      });
    }

    if (notifications.length === 0) return [];

    const created = await Notification.insertMany(notifications);
    for (const notification of created) {
      if (!notification.scheduledFor) {
        NotificationDeliveryService.send(notification);
      }
    }

    return created;
  }
  static async list(userId, { unreadOnly = false } = {}) {
    const filter = { user: userId };
    if (unreadOnly) filter.isRead = false;

    return Notification.find(filter)
      .sort({ createdAt: -1 })
      .lean();
  }

  static async unreadCount(userId) {
    return Notification.countDocuments({
      user: userId,
      isRead: false
    });
  }

  static async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true, status: "read" },
      { new: true }
    );
  }

  static async dismiss(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isDismissed: true, status: "dismissed" },
      { new: true }
    );
  }
}