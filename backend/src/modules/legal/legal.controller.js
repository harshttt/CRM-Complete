import mongoose from "mongoose";
import { ApiResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/appError.js";
import { LegalService } from "./legal.service.js";
import {
  createLegalSchema,
  updateLegalSchema,
} from "./legal.validation.js";

export class LegalController {
  /* -------- CREATE -------- */
  static async createLegal(req, res, next) {
    try {
      const { error, value } = createLegalSchema.validate(req.body);
      if (error) throw AppError.badRequest(error.message);

      const legal = await LegalService.createLegal(value, req.user.id);

      return res.json(
        ApiResponse.success(legal, "Legal draft created successfully")
      );
    } catch (err) {
      next(err);
    }
  }

  /* -------- UPDATE (DRAFT OR PUBLISH) -------- */
  static async upsertLegal(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        throw AppError.badRequest("Invalid legal id");

      const { error, value } = updateLegalSchema.validate(req.body);
      if (error) throw AppError.badRequest(error.message);

      const result = await LegalService.updateLegal(
        id,
        value,
        req.user.id
      );

      if (!result) throw AppError.notFound("Legal document not found");

      const message =
        value.status === "PUBLISHED"
          ? "Legal published successfully"
          : "Legal updated successfully";

      return res.json(ApiResponse.success(result, message));
    } catch (err) {
      next(err);
    }
  }

  /* -------- PUBLIC -------- */
  static async getPublicLegal(req, res, next) {
    try {
      const { type } = req.params;

      const legal = await LegalService.getPublishedByType(type);
      if (!legal) throw AppError.notFound("Legal document not found");

      return res.json(ApiResponse.success(legal));
    } catch (err) {
      next(err);
    }
  }

  /* -------- LIST -------- */
  static async getAllLegal(req, res, next) {
    try {
      const { page = 1, limit = 10, sort = "-createdAt", type } = req.query;

      const filter = {};
      if (type) filter.type = type;

      const sortObj =
        typeof sort === "string" && sort.startsWith("-")
          ? { [sort.slice(1)]: -1 }
          : { createdAt: -1 };

      const paginated = await LegalService.getLegalPaginated({
        page: Number(page),
        limit: Number(limit),
        filter,
        sort: sortObj,
      });

      return res.json(ApiResponse.paginated(paginated));
    } catch (err) {
      next(err);
    }
  }

  /* -------- GET BY ID -------- */
  static async getLegalById(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        throw AppError.badRequest("Invalid legal id");

      const legal = await LegalService.getLegalById(id);
      if (!legal) throw AppError.notFound("Legal not found");

      return res.json(ApiResponse.success(legal));
    } catch (err) {
      next(err);
    }
  }
}