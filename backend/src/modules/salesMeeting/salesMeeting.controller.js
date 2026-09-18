import { ApiResponse } from "../../utils/apiResponse.js";
import { SalesMeetingService } from "./salesMeeting.service.js";

export class SalesMeetingController {
  static async create(req, res, next) {
    try {
      const meeting = await SalesMeetingService.create(req.body, req.user);
      return res.status(201).json(ApiResponse.success(meeting, "Meeting created"));
    } catch (e) {
      next(e);
    }
  }

  static async update(req, res, next) {
    try {
      const meeting = await SalesMeetingService.update(req.params.id, req.body, req.user);
      return res.json(ApiResponse.success(meeting, "Meeting updated"));
    } catch (e) {
      next(e);
    }
  }

  static async getById(req, res, next) {
    try {
      const meeting = await SalesMeetingService.getById(req.params.id, req.user);
      return res.json(ApiResponse.success(meeting));
    } catch (e) {
      next(e);
    }
  }

  static async list(req, res, next) {
    try {
      const { page = 1, limit = 20, status, search } = req.query;
      const result = await SalesMeetingService.list({
        page: Number(page),
        limit: Number(limit),
        status,
        search,
        user: req.user,
      });
      return res.json(ApiResponse.paginated(result));
    } catch (e) {
      next(e);
    }
  }

  static async confirm(req, res, next) {
    try {
      const meeting = await SalesMeetingService.confirm(req.params.id, req.user);
      return res.json(ApiResponse.success(meeting, "Meeting confirmed"));
    } catch (e) {
      next(e);
    }
  }

  static async checkIn(req, res, next) {
    try {
      const meeting = await SalesMeetingService.checkIn(req.params.id, req.body, req.user);
      return res.json(ApiResponse.success(meeting, "Checked in successfully"));
    } catch (e) {
      next(e);
    }
  }

  static async start(req, res, next) {
    try {
      const meeting = await SalesMeetingService.start(req.params.id, req.user);
      return res.json(ApiResponse.success(meeting, "Meeting started"));
    } catch (e) {
      next(e);
    }
  }

  static async checkOut(req, res, next) {
    try {
      const meeting = await SalesMeetingService.checkOut(req.params.id, req.body, req.user);
      return res.json(ApiResponse.success(meeting, "Checked out successfully"));
    } catch (e) {
      next(e);
    }
  }

  static async complete(req, res, next) {
    try {
      const meeting = await SalesMeetingService.complete(req.params.id, req.body, req.user);
      return res.json(ApiResponse.success(meeting, "Meeting completed"));
    } catch (e) {
      next(e);
    }
  }

  static async cancel(req, res, next) {
    try {
      const meeting = await SalesMeetingService.cancel(req.params.id, req.body, req.user);
      return res.json(ApiResponse.success(meeting, "Meeting cancelled"));
    } catch (e) {
      next(e);
    }
  }

  static async reopen(req, res, next) {
    try {
      const meeting = await SalesMeetingService.reopen(req.params.id, req.user);
      return res.json(ApiResponse.success(meeting, "Meeting reopened"));
    } catch (e) {
      next(e);
    }
  }

  static async stats(req, res, next) {
    try {
      const stats = await SalesMeetingService.getStats(req.user);
      return res.json(ApiResponse.success(stats));
    } catch (e) {
      next(e);
    }
  }

  static async assignableEmployees(req, res, next) {
    try {
      const { page = 1, limit = 50, q = "" } = req.query;
      const result = await SalesMeetingService.getAssignableEmployees(req.user, {
        page: Number(page),
        limit: Number(limit),
        q,
      });
      return res.json(ApiResponse.paginated(result));
    } catch (e) {
      next(e);
    }
  }
}
