
import cron from "node-cron";
import logger from "../../../utils/logger.js";
import { LeadService } from "../lead.service.js";

export function initLeadCleanupJobs() {
  // Initial run
  LeadService.runAutoArchiveJobs()
    .then((res) => logger.info("Initial lead auto-archive run", res))
    .catch((err) => logger.error(err));

  //run every hour at minute 5 (avoid exact top-of-hour heavy load)
  cron.schedule(
    "5 * * * *",
    async () => {
      try {
        const res = await LeadService.runAutoArchiveJobs();
        logger.info("Lead auto-archive job result", res);
      } catch (err) {
        logger.error("Lead auto-archive job failed", err);
      }
    },
    { timezone: process.env.TIMEZONE || "UTC" }
  );

  logger.info("Lead cleanup cron scheduled (hourly at minute 5)");
}
