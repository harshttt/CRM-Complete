import cron from "node-cron";
import Task from "../task/task.model.js";
import Activity from "../activity/activity.model.js";
import logger from "../../utils/logger.js";

export function startTaskCron() {
  // Runs every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    try {
      const now = new Date();

      const overdueTasks = await Task.find({
        status: { $in: ["fresh", "in-progress"] },
        dueDate: { $lt: now },
        isDeleted: { $ne: true },
      }).select("_id title lead assignedTo");

      if (!overdueTasks.length) return;

      const taskIds = overdueTasks.map(t => t._id);

      
      // Bulk update (FAST & SAFE)
      await Task.updateMany(
        { _id: { $in: taskIds } },
        {
          $set: {
            status: "missed",
            completedAt: now,
          },
        }
      );

      // Activity logs (optional but recommended)
      const activities = overdueTasks.map(task => ({
        lead: task.lead || null,
        user: task.assignedTo,
        type: "task_missed",
        description: `Task "${task.title}" auto-marked as missed`,
        metadata: { taskId: task._id },
      }));

      await Activity.insertMany(activities);


      logger.info(
        `[TASK-CRON] Auto-marked ${taskIds.length} task(s) as missed`
      );
    } catch (err) {
      logger.error(`[TASK-CRON] Failed: ${err.message}`, err);
    }
  });
}
