import mongoose from "mongoose";
import createError from "http-errors";
import Lead from "../lead.model.js";
import Activity from "../../activity/activity.model.js";
import { redisClient } from "../../../config/redis.js";
import { cacheDel } from "../../../utils/cache.js";
import { UserService } from "../../user/user.service.js";

export class LeadLockService {
  /* =====================================================
   * LOCK LEAD
   * ===================================================== */
  static async lockLead(leadId, userId, durationMinutes = 10) {
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      throw createError(400, "Invalid lead id");
    }
    const redisKey = `lock:lead:${leadId}`;
    // Check existing lock in Redis
    const current = await redisClient.get(redisKey);
    if (current && String(current) !== String(userId)) {
      throw createError(409, "Locked by another user");
    }

    // Set redis lock
    await redisClient.set(redisKey, String(userId), "EX", durationMinutes * 60);

    // Update DB
    const lead = await Lead.findById(leadId);
    if (!lead) throw createError(404, "Lead not found");

    lead.isLocked = true;
    lead.lockedBy = userId;
    lead.lockedUntil = new Date(Date.now() + durationMinutes * 60000);
    lead.updatedBy = userId;

    await lead.save();

    // Activity log
    await Activity.create({
      lead: leadId,
      user: userId,
      type: "lead_locked",
      description: "Lead locked",
      metadata: { durationMinutes },
    });

    await cacheDel(`lead:${leadId}`);

    return {
      locked: true,
      lockedBy: userId,
      lockedUntil: lead.lockedUntil,
    };
  }

  /* =====================================================
   * UNLOCK LEAD
   * ===================================================== */
  static async unlockLead(leadId, userId) {
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      throw createError(400, "Invalid lead id");
    }

    const redisKey = `lock:lead:${leadId}`;
    const lead = await Lead.findById(leadId);
    if (!lead) throw createError(404, "Lead not found");

    // Permission check
    if (lead.isLocked && String(lead.lockedBy) !== String(userId)) {
      const user = await UserService.getUser(userId);
      const roleLevel = user.role?.roleLevel;
       if (![1, 2].includes(roleLevel)) {
      throw createError(403, "Not allowed to unlock");
    }
    }

    // Remove redis lock
    await redisClient.del(redisKey);
    // Update DB
    lead.isLocked = false;
    lead.lockedBy = null;
    lead.lockedUntil = null;
    lead.updatedBy = userId;

    await lead.save();

    // Activity log
    await Activity.create({
      lead: leadId,
      user: userId,
      type: "lead_unlocked",
      description: "Lead unlocked",
    });

    await cacheDel(`lead:${leadId}`);

    return { isLocked: false, lockedBy: null, lockedUntil: null };
  }
}
