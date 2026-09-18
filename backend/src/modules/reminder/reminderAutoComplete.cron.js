import cron from "node-cron";
import Reminder from "./reminder.model.js";
import logger from "../../utils/logger.js";

export function startReminderAutoCompleteCron() {
  // Runs every 5 minutes (can be even every 10)
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const result = await Reminder.updateMany(
        {
          remindAt: { $lte: now },
          isCompleted: false
        },
        {
          $set: { isCompleted: true }
        }
      );

      if (result.modifiedCount > 0) {
        logger.info(
          `[REMINDER-AUTO-COMPLETE] Completed ${result.modifiedCount} reminder(s)`
        );
      }
    } catch (err) {
      logger.error("[REMINDER-AUTO-COMPLETE] Failed", err);
    }
  });
}
