import cron from "node-cron";
import TaskReminderService from "../task/task.reminder.service.js";

export function startTaskReminderJob() {

  // Every 1 minute
  cron.schedule("* * * * *", async () => {
    try {
      const result = await TaskReminderService.processReminders();
      if (result.processed > 0) {
        console.log(`[TASK REMINDER] Sent: ${result.processed}`);
      }
    } catch (err) {
      console.error("[TASK REMINDER ERROR]", err);
    }
  });

}
