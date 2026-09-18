import Task from "./task.model.js";
import Activity from "../activity/activity.model.js";
import  {sendNotification}  from "../../utils/autoRules.js";
// import { sendFCM } from "../../utils/fcm.js";
// import User from "../user/user.model.js";




class TaskReminderService {

  //Find due reminders
  static async findDueReminders(now = new Date()) {
    return Task.find({
      reminderAt: { $lte: now },
      reminderSent: false,
      status: { $in: ["pending", "in-progress"] },
      isDeleted: { $ne: true }
    }).lean();
  }

  //Send reminder for one task
  static async sendReminder(task) {


  // const user = await User.findById(task.assignedTo);
  // if (!user?.fcmToken) return;

    //Push / In-app / Email (future)
    await sendNotification({
      userId: task.assignedTo,
      // token: user.fcmToken,
      title: "Task Reminder",
      message: `Reminder: ${task.title}`,
      data: {
        taskId: task._id,
        leadId: task.lead
      }
    });

    //Activity log
    await Activity.create({
      lead: task.lead,
      user: task.assignedTo,
      type: "task_reminder_sent",
      description: `Reminder sent for task "${task.title}"`,
      metadata: { taskId: task._id }
    });

    //Mark reminder sent
    await Task.updateOne(
      { _id: task._id },
      {
        reminderSent: true,
        // reminderSentAt: new Date()
      }
    );
  }

  //Process all reminders
  static async processReminders() {
    const tasks = await this.findDueReminders();

    for (const task of tasks) {
      try {
        await this.sendReminder(task);
      } catch (err) {
        console.error("Reminder failed for task:", task._id, err);
      }
    }

    return { processed: tasks.length };
  }
}

export default TaskReminderService;
