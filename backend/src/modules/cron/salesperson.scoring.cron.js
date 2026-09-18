

import cron from "node-cron";
import User from "../user/user.model.js";
import logger from "../../utils/logger.js";
import { SalespersonScoringService } from "../salesperson/salesperson.scoring.service.js";

export function startSalespersonPerformanceCron() {
  // cron.schedule("20 0 * * *", async () => {

  cron.schedule("* * * * *", async () => {

    
    // logger.info("[SALESPERSON-PERFORMANCE] Started");

     const salesUsers = await User.find({
      "role.roleLevel": 4,
      isDeleted: { $ne: true }
    }).select("_id");

    for (const u of salesUsers) {
      await SalespersonScoringService.calculateDailyScore(u._id, new Date());
    }

    logger.info("[SALESPERSON-PERFORMANCE] Completed");
  });
}

