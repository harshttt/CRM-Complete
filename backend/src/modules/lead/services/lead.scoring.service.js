import Lead from "../lead.model.js";

/**
 * Lead Scoring Service
 * Stateless, event + cron driven
 */
export class LeadScoringService {

  /* =========================
   * CONFIG MAPS
   * ========================= */

  static SOURCE_SCORE = {
    "walk-in": 25,
    "phone_inquiry": 22,
    "referral": 22,
    "broker": 20,
    "exhibition_event": 20,
    "property_portal": 18,
    "website": 15,
    "social_media": 15,
    "online_ads": 14,
    "campaign": 14,
    "email_campaign": 10,
    "cold_call": 8,
    "advertisement": 8
  };

  static STAGE_SCORE = {
    "fresh:contacted": 5,
    "interested:qualified": 12,
    "qualified:negotiation": 15,
    "negotiation:payment": 18,
    "payment:closed_won": 25,
    "any:junk_lead": -40,
    "any:invalid": -40
  };

  static ENGAGEMENT_SCORE = {
    call_attended: 5,
    whatsapp_reply: 5,
    email_reply: 4,
    meeting_attended: 12,
    site_visit: 15,
    document_shared: 10,
    followup_requested: 8,
    payment_initiated: 20,
    meeting_no_show: -10,
    not_interested: -20
  };

  /* =========================
   * Lead Source Intent Score(LSIS)
   * ========================= */
  static calculateLSIS(source) {
    return this.SOURCE_SCORE[source] || 0;
  }

  /* =========================
   * Client Response Time Score(CRTS)
   * ========================= */
  static calculateCRTS(minutes) {
    if (minutes < 30) return 15;
    if (minutes < 120) return 10;
    if (minutes < 360) return 6;
    if (minutes < 1440) return 2;
    if (minutes < 2880) return -5;
    return -10;
  }

  /* =========================
   * Stage Progression ScoreSPS
   * ========================= */
  static calculateSPS(from, to) {
    return (
      this.STAGE_SCORE[`${from}:${to}`] ||
      this.STAGE_SCORE[`any:${to}`] ||
      0
    );
  }

  /* =========================
   * Client Engagement Score(CES)
   * ========================= */
  static calculateCES(action) {
    return this.ENGAGEMENT_SCORE[action] || 0;
  }

  /* =========================
   * TAG MULTIPLIER
   * ========================= */
  static calculateTM(tags = []) {
    if (tags.includes("urgent")) return 1.5;
    if (tags.includes("medium")) return 1.0;
    if (tags.includes("hot")) return 1.2;
    if (tags.includes("low")) return 0.7;
    return 1.0;
  }

  /* =========================
   * FINAL SCORE
   * ========================= */
  static computeFinalScore(lead) {
    const { lsis, crts, sps, ces } = lead.scoreBreakdown;
    const tm = lead.scoreBreakdown.tm || 1;

    const raw = lsis + crts + sps + ces;
    const score = Math.round(raw * tm);

    let status = "cold";
    if (score >= 80) status = "sales_ready";
    else if (score >= 60) status = "high_intent";
    else if (score >= 40) status = "warm";
    else if (score >= 20) status = "cold";
    else status = "dormant";

    return { score, status };
  }

  /* =========================
   * APPLY & SAVE
   * ========================= */
  static async recalculateLead(lead) {
    lead.scoreBreakdown.tm = this.calculateTM(lead.tags || []);

    const { score, status } = this.computeFinalScore(lead);

    lead.score = score;
    lead.scoreStatus = status;
    lead.lastScoredAt = new Date();

    await lead.save();
    return lead;
  }
}
