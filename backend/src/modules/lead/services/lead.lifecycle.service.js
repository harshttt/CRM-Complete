import Lead from "../lead.model.js";
import {cacheDel,cacheScanDel} from "../../../utils/cache.js";
import Activity from "../../activity/activity.model.js";


export class LeadLifecycleService {

  
  /* =========================
   * AUTO REMOVE
   * ========================= */
  static async autoRemove(lead, rule, byUser) {
    if (!lead || lead.status !== "active") return lead;

    lead.status = "auto_removed";
    lead.archived = true;
    lead.archivedAt = new Date();
    lead.archivedBy = byUser;
    lead.archiveReason = rule;

    await lead.save();

    await Activity.create({
      lead: lead._id,
      user: byUser,
      type: "auto_removed",
      description: `Auto removed by rule: ${rule}`,
    });

    await cacheDel(`lead:${lead._id}`);
    await cacheScanDel("leads:list");

    return lead;
  }
}
