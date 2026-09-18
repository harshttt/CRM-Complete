import { getIO } from "../../config/socket.js";
import { getUserSockets } from "../utils/socketUserMap.js";
import logger from "../../utils/logger.js";
import Notification from "../../modules/notification/notification.model.js";
import { sendPushNotification } from "../../utils/fcm.js";
import userModel from "../../modules/user/user.model.js";

export class NotificationDeliveryService {
  static send(notification) {
    try {
      if (!notification?.user) {
        logger.warn("[NotificationDelivery] Missing notification user");
        return;
      }

      const io = getIO();
      const userId = notification.user.toString();

      logger.info(
        `[NotificationDelivery] Attempting delivery notification=${notification._id} user=${userId}`
      );

      const socketIds = getUserSockets(userId);

      if (!socketIds || socketIds.size === 0) {
        logger.info(
          `[NotificationDelivery] No active sockets for user=${userId}`
        );
        sendPushIfOffline(notification);
        return;
      }

      logger.info(
        `[NotificationDelivery] Found ${socketIds.size} socket(s) for user=${userId}`
      );

      for (const socketId of socketIds) {
        io.of("/notifications")
          .to(socketId)
          .emit("notification:new", {
            id: notification._id.toString(),
            type: notification.type,
            channelId: notification.channelId,
            title: notification.title,
            message: notification.message,
            redirectUrl: notification.redirectUrl,
            meet: notification.metadata?.meet ?? null,
            createdAt: notification.createdAt
          });
      }

      logger.info(
        `[NotificationDelivery] Delivery completed notification=${notification._id}`
      );
      Notification.updateOne(
        { _id: notification._id },
        {
          $set: {
            lastSentAt: new Date(),
            status: "sent"
          }
        }
      ).catch(err => {
        logger.error(
          `[NotificationDelivery] Failed to update lastSentAt notification=${notification._id}`,
          err
        );
      });

    } catch (err) {
      logger.error(
        `[NotificationDelivery] FAILED notification=${notification?._id}`,
        err
      );
    }
  }
}

async function sendPushIfOffline(notification) {
  try {
    const userId = notification.user.toString();

    const user = await userModel
      .findById(userId)
      .select("fcmToken")
      .lean();

    if (!user?.fcmToken) {
      logger.info(
        `[NotificationDelivery] No FCM token for offline user=${userId}`
      );
      return;
    }

    await sendPushNotification({
      tokens: [user.fcmToken],
      title: notification.title,
      body: notification.message,
      data: {
        notificationId: notification._id.toString(),
        type: notification.type,
        channelId: notification.channelId
      }
    });

    logger.info(
      `[NotificationDelivery] Push sent for offline user=${userId}`
    );
  } catch (err) {
    logger.error(
      `[NotificationDelivery] Push failed for offline user`,
      err
    );
  }
}

