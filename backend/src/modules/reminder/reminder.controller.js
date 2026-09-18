import { ApiResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/appError.js";
import { ReminderService } from "./reminder.service.js";
import {
  createReminderSchema,
  updateReminderSchema
} from "./reminder.validation.js";

export class ReminderController {

  static async create(req, res, next) {
    try {
      const { error, value } = createReminderSchema.validate(req.body);
      if (error) throw AppError.badRequest(error.message);

      await ReminderService.create(req.user._id, value);

      return res.json(
        ApiResponse.success(null, "Reminder created")
      );
    } catch (e) {
      next(e);
    }
  }

  static async update(req, res, next) {
    try {
      const { error, value } = updateReminderSchema.validate(req.body);
      if (error) throw AppError.badRequest(error.message);

      await ReminderService.update(
        req.params.id,
        req.user._id,
        value
      );

      return res.json(
        ApiResponse.success(null, "Reminder updated")
      );
    } catch (e) {
      next(e);
    }
  }

  static async remove(req, res, next) {
    try {
      await ReminderService.delete(
        req.params.id,
        req.user._id
      );
      return res.json(
        ApiResponse.success(null, "Reminder deleted")
      );
    } catch (e) {
      next(e);
    }
  }

  static async get(req, res, next) {
    try {
      const reminder = await ReminderService.getById(
        req.params.id,
        req.user._id
      );
      return res.json(ApiResponse.success(reminder));
    } catch (e) {
      next(e);
    }
  }

  static async list(req, res, next) {
    try {
      const { page = 1, limit = 10, sort = "remindAt", upcoming } = req.query;

      const result = await ReminderService.list({
        userId: req.user._id,
        page: Number(page),
        limit: Number(limit),
        sort,
        upcomingOnly: upcoming === "true"
      });

      return res.json(ApiResponse.paginated(result));
    } catch (e) {
      next(e);
    }
  }

  static async markCompleted(req, res, next) {
    try {
      await ReminderService.markCompleted(
        req.params.id,
        req.user._id
      );
      return res.json(
        ApiResponse.success(null, "Reminder marked as completed")
      );
    } catch (e) {
      next(e);
    }
  }
}
