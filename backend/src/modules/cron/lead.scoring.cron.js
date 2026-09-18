
import cron from "node-cron";
import Lead from "../lead/lead.model.js";
import logger from "../../utils/logger.js";
import Activity from "../activity/activity.model.js";
import { LeadScoringService } from "../lead/services/lead.scoring.service.js";

/**
 * DAILY LEAD SCORING CRON
 * - Recalculate CRTS
 * - Recalculate Final Score
 * - Auto HOT (score jump >= 20)
 * - Auto Archive (low score dormant)
 *
 * Runs daily at 12:10 AM
 */
export function startLeadScoringCron() {
  cron.schedule("10 0 * * *", async () => {
// cron.schedule("* * * * *", async () => {

    logger.info("[LEAD-SCORING-CRON] Started");

    try {
      const leads = await Lead.find({ status: "active" });

      let hotCount = 0;
      let archivedCount = 0;

      for (const lead of leads) {
        const prevScore = lead.previousScore || 0;

        /* =========================
         * CRTS – Client Response Time
         * ========================= */
        if (typeof lead.timeToFirstContactMinutes === "number") {
          lead.scoreBreakdown.crts =
            LeadScoringService.calculateCRTS(
              lead.timeToFirstContactMinutes
            );
        }

        /* =========================
         * FINAL SCORE RECALCULATION
         * ========================= */
        await LeadScoringService.recalculateLead(lead);

        /* =========================
         * AUTO HOT (Score Spike Rule)
         * ========================= */
        const scoreDelta = lead.score - prevScore;

        if (
          scoreDelta >= 20 &&
          !lead.tags.includes("hot")
        ) {
          lead.tags.push("hot");
          hotCount++;

          await Activity.create({
            lead: lead._id,
            user: null,
            type: "auto_hot",
            description: `Auto HOT applied (score jumped by ${scoreDelta})`,
          });
        }

        /* =========================
         * AUTO ARCHIVE – Dormant
         * ========================= */
        const ageInDays =
          (Date.now() - lead.createdAt.getTime()) / 86400000;

        if (lead.score < 10 && ageInDays >= 15) {
          lead.status = "auto_removed";
          lead.archived = true;
          lead.archivedAt = new Date();
          lead.archiveReason = "low-score-dormant";
          archivedCount++;

          await Activity.create({
            lead: lead._id,
            user: null,
            type: "auto_removed",
            description: "Auto archived due to low score & inactivity",
          });
        }

        /* =========================
         * SNAPSHOT SCORE (IMPORTANT)
         * ========================= */
        lead.previousScore = lead.score;

        await lead.save();
      }

      logger.info(
        `[LEAD-SCORING-CRON] Completed | HOT: ${hotCount}, ARCHIVED: ${archivedCount}`
      );
    } catch (err) {
      logger.error(
        `[LEAD-SCORING-CRON] Failed: ${err.message}`,
        err
      );
    }
  });
}

