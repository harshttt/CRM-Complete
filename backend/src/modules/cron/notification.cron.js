import cron from "node-cron";
import Notification from "../notification/notification.model.js";
import { NotificationDeliveryService } from "../../sockets/delivery/notification.delivery.js";
import logger from "../../utils/logger.js";

export function startNotificationCron() {
  // Runs every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const notifications = await Notification.find({
        scheduledFor: { $lte: now },
        status: "pending",
        isDismissed: false,
        $expr: { $lt: ["$retryCount", "$maxRetries"] }
      })
      .populate("taskId", "status")
      .limit(50);
      if (!notifications.length) return;
      for (const notification of notifications) {
        try {
            if (
            notification.taskId &&
            ["completed", "missed"].includes(notification.taskId.status)
          ) {
            notification.status = "cancelled";
            await notification.save();
            continue;
          }
          NotificationDeliveryService.send(notification);
          notification.status = "sent";
          notification.lastSentAt = new Date();
          await notification.save();
        } catch (err) {
          notification.retryCount += 1;
          await notification.save();
          logger.error(
            `[NOTIFICATION-CRON] Failed notification=${notification._id}`,
            err
          );
        }
      }
      logger.info(
        `[NOTIFICATION-CRON] Processed ${notifications.length} notification(s)`
      );
    } catch (err) {
      logger.error(`[NOTIFICATION-CRON] Failed: ${err.message}`);
    }
  });
}
export function startNotificationAutoReadCron() {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      // const cutoff = new Date(now.getTime() - 60 * 1000);// 1 minute ago
      const cutoff = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
      const result = await Notification.updateMany(
        {
          isRead: false,
          isDismissed: false,
          scheduledFor: null,
          lastSentAt: { $lte: cutoff }
        },
        {
          $set: {
            isRead: true,
            status: "read"
          }
        }
      );
      if (result.modifiedCount > 0) {
        logger.info(
          `[NOTIFICATION-AUTO-READ] Marked ${result.modifiedCount} notification(s) as read`
        );
      }
    } catch (err) {
      logger.error(
        `[NOTIFICATION-AUTO-READ] Failed`,
        err
      );
    }
  });
}