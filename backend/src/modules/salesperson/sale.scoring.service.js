import SalespersonScore from "./salesperson.score.model.js";
import Activity from "../activity/activity.model.js";
import Task from "../task/task.model.js";
import Lead from "../lead/lead.model.js";



export class SaleScoringService {

  static async calculateDailyScore(userId, date = new Date()) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    
  let score = await SalespersonScore.findOne({ user: userId, date: dayStart });

  if (!score) {
    try {
      await SalespersonScore.create({
        user: userId,
        date: dayStart,
        breakdown: {},
        totalScore: 0
      });
    } catch (err) {
      if (err.code !== 11000) throw err;
    }
  }

  score = await SalespersonScore.findOne({ user: userId, date: dayStart });

    /* =====================
     * AVS / CQS / LPES
     * ===================== */
    const activities = await Activity.find({
      user: userId,
      createdAt: { $gte: dayStart, $lte: dayEnd },
    });

    let avs = 0;
    let cqs = 0;
    let lpes = 0;

    for (const a of activities) {
      // AVS
      if (["comment_added", "note_added", "lead_updated"].includes(a.type))
        avs += 1;
      if (["task_created", "meeting_created", "assigned_to"].includes(a.type))
        avs += 2;
      if (a.type === "followup_updated") avs += 3;
      if (["call_logged", "whatsapp", "email_sent"].includes(a.type)) avs += 2;
      if (a.type === "reminder_set") avs += 2;

      // CQS
      if (a.type === "meeting_created") cqs += 10;
      if (a.type === "meeting_updated") cqs += 5;
      if (a.type === "comment_added") cqs += 4;
      if (a.type === "note_added") cqs += 4;
      if (a.type === "email_sent") cqs += 5;
      if (a.type === "sms") cqs += +1;
      if (a.type === "site_visit") cqs += 12;

      // LPES
      if (a.type === "stage_changed") lpes += 5;
      if (a.type === "meeting_created") lpes += 10;
      if (a.type === "task_completed") lpes += 5;
      if (a.type === "lead_archived") lpes -= 10;
      if (a.type === "auto_removed") lpes -= 20;
      if (a.stage === "qualified") lpes += 15;
      if (a.stage === "closed_won") lpes += 30;
      if (a.stage === "closed_lost") lpes -= 10;
      if (a.stage === "site_visit") lpes += 12;
    }

    score.breakdown.avs = Math.min(40, avs);
    score.breakdown.cqs = cqs;
    score.breakdown.lpes = lpes;

    /* =====================
     * TDS – TASK DISCIPLINE
     * ===================== */
    const tasks = await Task.find({
      assignedTo: userId,
      $or: [
        { completedAt: { $gte: dayStart, $lte: dayEnd } },
        { status: "missed", updatedAt: { $gte: dayStart, $lte: dayEnd } },
      ],
    });

    let tds = 0;

    for (const t of tasks) {
      const isUrgent = t.priority === "urgent" || t.priority === "high";

      if (t.status === "completed" && t.completedAt) {
        // On time
        if (t.completedAt <= t.dueDate) {
          tds += 6;
        }
        // Late
        else {
          tds += 2;
        }

        // Urgent bonus
        if (isUrgent) {
          tds += 10;
        }
      } else if (t.status === "missed") {

      /*MISSED TASKS */
        tds -= 10;
      }
    }

    score.breakdown.tds = tds;

    /* =====================
     * SLS – SPEED TO LEAD
     * ===================== */
    const leads = await Lead.find({
      assignedTo: userId,
      lastAssignedAt: { $gte: dayStart, $lte: dayEnd },
    });

    let sls = 0;

    for (const l of leads) {
      if (!l.firstContactedAt) {
        sls -= 15;
        continue;
      }

      const mins = (l.firstContactedAt - l.lastAssignedAt) / 60000;

      if (mins < 5) sls += 15;
      else if (mins < 15) sls += 10;
      else if (mins < 60) sls += 5;
      else sls -= 5;
    }

    score.breakdown.sls = sls;

    /* =====================
     * FINAL SCORE
     * ===================== */
    const total =
      score.breakdown.avs +
      score.breakdown.tds +
      score.breakdown.sls +
      score.breakdown.lpes +
      score.breakdown.cqs;

    score.totalScore = total;

    if (total >= 90) score.bucket = "rockstar";
    else if (total >= 70) score.bucket = "high_performer";
    else if (total >= 50) score.bucket = "consistent";
    else if (total >= 30) score.bucket = "needs_improvement";
    else score.bucket = "risk_zone";

    await score.save();
    return score;
  }

}
