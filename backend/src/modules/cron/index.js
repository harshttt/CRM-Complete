import { startMeetingCron } from "./meeting.cron.js";
import { startTaskCron } from "./task.cron.js";
import { startNotificationAutoReadCron, startNotificationCron } from "./notification.cron.js";
import logger from "../../utils/logger.js";
import { startReminderAutoCompleteCron } from "../reminder/reminderAutoComplete.cron.js";
import { startLeadScoringCron } from "./lead.scoring.cron.js";
import { startSalespersonPerformanceCron } from "./salesperson.scoring.cron.js";
import { startFacebookLeadCron } from "./meta.facebook.cron.js";



export function startCrons() {
  logger.info("[CRON] Initializing crons...");

  startMeetingCron();
  logger.info("[CRON] Meeting cron started");

  startNotificationCron();
  logger.info("[CRON] Notification cron started");

  startTaskCron();
  logger.info("[CRON] Task cron started");
  startNotificationAutoReadCron();
  logger.info("[CRON] Notification auto-read cron started");
  startReminderAutoCompleteCron();
  logger.info("[CRON] Reminder auto-complete cron started");

  startSalespersonPerformanceCron();
  logger.info("[CRON] Salesperson performance cron started");
   startLeadScoringCron();
  logger.info("[CRON] Lead scoring cron started");

startFacebookLeadCron();
logger.info("[CRON] Facebook lead cron started");
}
