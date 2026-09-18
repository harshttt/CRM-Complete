
import Lead from "../lead.model.js";
import { cacheDel, cacheScanDel }  from "../../../utils/cache.js";
import Activity from "../../activity/activity.model.js";


const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID || null;

export class LeadAutoArchiveService {

  /* =========================
   * ARCHIVE BY RULE
   * ========================= */
  static async archiveByRule(leadId, rule, byUser = SYSTEM_USER_ID) {
    const lead = await Lead.findById(leadId);
    if (!lead) return null;
    if (lead.status !== "active") return lead;

    lead.status = "auto_removed";
    lead.archivedAt = new Date();
    lead.archivedBy = byUser;
    lead.archiveReason = rule;

    await lead.save();

    await Activity.create({
      lead: leadId,
      user: byUser,
      type: "auto_removed",
      description: `Auto removed by rule: ${rule}`,
    });

    await cacheDel(`lead:${leadId}`);
    await cacheScanDel("leads:list");

    return lead;
  }

  /* =========================
   * FIND NI LEADS
   * ========================= */
  static async findNiLeads() {
    return Lead.find({
      status: "active",
      $or: [
        { stage: "invalid" },
        {
          tags: {
            $in: [
              "NI",
              "ni",
              "not-interested",
              "no interest",
              "don't call",
              "no thanks",
            ],
          },
        },
      ],
    })
      .select("_id")
      .lean();
  }

  /* =========================
   * UNANSWERED > 24h
   * ========================= */
  static async findUnanswered24h() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return Lead.find({
      status: "active",
      createdAt: { $lte: cutoff },
      $or: [
        { firstContactedAt: null },
        { firstContactedAt: { $exists: false } },
      ],
      stage: { $in: ["fresh", "contacted"] },
    })
      .select("_id")
      .lean();
  }

  /* =========================
   * FOLLOW-UP EXPIRED (>3 days)
   * ========================= */
  static async findFollowupExpired() {
    const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    return Lead.find({
      status: "active",
      nextFollowUp: { $lte: cutoff },
    })
      .select("_id")
      .lean();
  }

  /* =========================
   * MAIN JOB RUNNER
   * ========================= */
  static async runAutoArchiveJobs(opts = {}) {
    const byUser = opts.systemUserId || SYSTEM_USER_ID;

    const ni = await this.findNiLeads();
    for (const l of ni) {
      await this.archiveByRule(l._id, "NI", byUser);
    }

    const unanswered = await this.findUnanswered24h();
    for (const l of unanswered) {
      await this.archiveByRule(l._id, "unanswered-24h", byUser);
    }

    const followup = await this.findFollowupExpired();
    for (const l of followup) {
      await this.archiveByRule(l._id, "followup-expired", byUser);
    }

    return {
      ni: ni.length,
      unanswered: unanswered.length,
      followup: followup.length,
    };
  }


}
