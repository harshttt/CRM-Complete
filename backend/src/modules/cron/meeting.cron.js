import cron from "node-cron";
import Meeting from "../meeting/meeting.model.js";
import logger from "../../utils/logger.js";

export function startMeetingCron() {
  // Runs every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      const result = await Meeting.updateMany(
        {
          status: "scheduled",
          $expr: {
            $lte: [
              {
                $add: [
                  "$scheduledAt",
                  { $multiply: ["$durationMinutes", 60000] }
                ]
              },
              now
            ]
          }
        },
        {
          $set: {
            status: "completed"
          }
        }
      );
      if (result.modifiedCount > 0) {
        logger.info(
          `[MEETING-CRON] Completed ${result.modifiedCount} meeting(s)`
        );
    
      }
    } catch (err) {
      logger.error(`[MEETING-CRON] Failed: ${err.message}`);
    }
  });
}