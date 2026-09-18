import { ApiResponse } from "../../utils/apiResponse.js";
import { FollowUpService } from "./followUp.service.js";

export class FollowUpController {
  static async create(req, res, next) {
    try {
      const followUp = await FollowUpService.create(req.body, req.user);
      return res.status(201).json(ApiResponse.success(followUp, "Follow-up created"));
    } catch (e) {
      next(e);
    }
  }

  static async update(req, res, next) {
    try {
      const followUp = await FollowUpService.update(req.params.id, req.body, req.user);
      return res.json(ApiResponse.success(followUp, "Follow-up updated"));
    } catch (e) {
      next(e);
    }
  }

  static async getById(req, res, next) {
    try {
      const followUp = await FollowUpService.getById(req.params.id, req.user);
      return res.json(ApiResponse.success(followUp));
    } catch (e) {
      next(e);
    }
  }

  static async list(req, res, next) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const result = await FollowUpService.list({
        page: Number(page),
        limit: Number(limit),
        status,
        user: req.user,
      });
      return res.json(ApiResponse.paginated(result));
    } catch (e) {
      next(e);
    }
  }

  static async complete(req, res, next) {
    try {
      const followUp = await FollowUpService.complete(req.params.id, req.user);
      return res.json(ApiResponse.success(followUp, "Follow-up completed"));
    } catch (e) {
      next(e);
    }
  }

  static async remove(req, res, next) {
    try {
      const result = await FollowUpService.remove(req.params.id, req.user);
      return res.json(ApiResponse.success(result, "Follow-up deleted"));
    } catch (e) {
      next(e);
    }
  }
}
