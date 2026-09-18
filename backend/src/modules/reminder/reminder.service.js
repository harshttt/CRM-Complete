import Reminder from "./reminder.model.js";
import Notification from "../notification/notification.model.js";
import Activity from "../activity/activity.model.js";
import mongoose from "mongoose";
import {cacheGet,cacheSet,cacheDel,cacheScanDel,} from "../../utils/cache.js";
import { NotificationService } from "../notification/notification.service.js";
import { AppError } from "../../utils/appError.js";
import logger from "../../utils/logger.js";
import { parseToUtc } from "../../utils/date.util.js";

const UPCOMING_OFFSET_MS = 2 * 60 * 60 * 1000; // 2 hours
const BEFORE_5_MIN_MS = 5 * 60 * 1000;        // 5 minutes

export class ReminderService {

  /* ================= CREATE ================= */

  static async create(userId, data) {
    if (!data.title) {
      throw new AppError("title is required", 400);
    }

    if (!data.remindAt) {
      throw new AppError(
        "remindAt is required (DD/MM/YYYY hh:mm:ss AM/PM)",
        400
      );
    }

    const remindAtUtc = parseToUtc(data.remindAt);

    logger.info(
      `[REMINDER] Creating reminder user=${userId} remindAt(UTC)=${remindAtUtc.toISOString()}`
    );

    const reminder = await Reminder.create({
      user: userId,
      title: data.title,
      description: data.description,
      entityType: data.entityType,
      entityId: data.entityId || null,
      remindAt: remindAtUtc
    });

    await this._createNotifications(reminder);
    return reminder;
  }

  /* ================= UPDATE ================= */

  static async update(reminderId, userId, data) {
    if (data.remindAt) {
      data.remindAt = parseToUtc(data.remindAt);
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: reminderId, user: userId },
      data,
      { new: true }
    );

    if (!reminder) {
      throw new AppError("Reminder not found", 404);
    }

    logger.info(
      `[REMINDER] Updating reminder=${reminderId}, rescheduling notifications`
    );

    await Notification.deleteMany({
      user: userId,
      entityId: reminder._id,
      status: "pending"
    });

    await this._createNotifications(reminder);
    return reminder;
  }

  /* ================= DELETE ================= */

  static async delete(reminderId, userId) {
    const reminder = await Reminder.findOneAndDelete({
      _id: reminderId,
      user: userId
    });

    if (!reminder) {
      throw new AppError("Reminder not found", 404);
    }

    await Notification.deleteMany({
      user: userId,
      entityId: reminderId,
      status: "pending"
    });

    logger.info(`[REMINDER] Deleted reminder=${reminderId}`);
    return reminder;
  }

  /* ================= GET ================= */

  static async getById(reminderId, userId) {
    const reminder = await Reminder.findOne({
      _id: reminderId,
      user: userId
    });

    if (!reminder) {
      throw new AppError("Reminder not found", 404);
    }

    return reminder;
  }

  /* ================= LIST ================= */

  // static async list(userId, { upcomingOnly = false } = {}) {
  //   const filter = { user: userId };

  //   if (upcomingOnly) {
  //     filter.remindAt = { $gte: new Date() };
  //     filter.isCompleted = false;
  //   }

  //   return Reminder.find(filter)
  //     .sort({ remindAt: 1 })
  //     .lean();
  // }

  static async list({
  userId,
  page = 1,
  limit = 10,
  sort = "remindAt",
  upcomingOnly = false
}) {
  if (!userId) {
    throw new Error("Invalid userId");
  }

  const filter = { user: userId };

  if (upcomingOnly) {
    filter.remindAt = { $gte: new Date() };
    filter.isCompleted = false;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Reminder.find(filter)
      .sort({ [sort]: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Reminder.countDocuments(filter)
  ]);

  return {
    items,
    page,
    limit,
    total
  };
}


  /* ================= COMPLETE ================= */

  static async markCompleted(reminderId, userId) {
    logger.info(`[REMINDER] Manually completed reminder=${reminderId}`);

    return Reminder.findOneAndUpdate(
      { _id: reminderId, user: userId },
      { isCompleted: true },
      { new: true }
    );
  }

  /* ================= PRIVATE ================= */

  static async _createNotifications(reminder) {
    if (reminder.isCompleted) return;

    const now = new Date();
    const remindAt = new Date(reminder.remindAt);

    const upcomingAt = new Date(remindAt.getTime() - UPCOMING_OFFSET_MS);
    const before5At = new Date(remindAt.getTime() - BEFORE_5_MIN_MS);

    if (upcomingAt > now) {
      logger.info(
        `[REMINDER] Scheduling UPCOMING at ${upcomingAt.toISOString()}`
      );

      await NotificationService.create({
        user: reminder.user,
        type: "reminder",
        channelId: "REMINDER_DETAIL",
        entityId: reminder._id,
        title: reminder.title,
        message: "Upcoming reminder",
        scheduledFor: upcomingAt,
        dedupeKey: `reminder:${reminder._id}:upcoming`,
        metadata: { stage: "UPCOMING" }
      });
    }

    if (before5At > now) {
      logger.info(
        `[REMINDER] Scheduling BEFORE_5_MIN at ${before5At.toISOString()}`
      );

      await NotificationService.create({
        user: reminder.user,
        type: "reminder",
        channelId: "REMINDER_DETAIL",
        entityId: reminder._id,
        title: reminder.title,
        message: "Reminder in 5 minutes",
        scheduledFor: before5At,
        dedupeKey: `reminder:${reminder._id}:before5`,
        metadata: { stage: "BEFORE_5_MIN" }
      });
    }
  }
}