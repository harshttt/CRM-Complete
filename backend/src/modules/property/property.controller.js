import { PropertyService } from "./property.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { PROPERTY_ENUMS } from "../../constants/property.constants.js";

export class PropertyController {

    static async getPropertyConstants(req, res) {
            return res.json(ApiResponse.success(PROPERTY_ENUMS, "Property constants fetched successfully"));
    }

  static async create(req, res, next) {
    try {
      const property = await PropertyService.create(req.body, req.user._id);
      res.json(ApiResponse.success(property, "Property created"));
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const property = await PropertyService.update(
        req.params.id,
        req.body,
        req.user._id
      );
      res.json(ApiResponse.success(property, "Property updated"));
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const property = await PropertyService.getById(req.params.id);
      res.json(ApiResponse.success(property));
    } catch (err) {
      next(err);
    }
  }

  // static async list(req, res, next) {
  //   try {
  //     const page = Number(req.query.page) || 1;
  //     const limit = Number(req.query.limit) || 20;
  //     const skip = (page - 1) * limit;

  //     const filters = {
  //       q: req.query.q,
  //       type: req.query.type,
  //       city: req.query.city,
  //       category: req.query.category,
  //       status: req.query.status,
  //       minBudget: req.query.minBudget,
  //       maxBudget: req.query.maxBudget,
  //     };

  //     //const result = await PropertyService.list(req.query);

  //     const result = await PropertyService.list({
  //       page,
  //       limit,
  //       skip,
  //       filters,
  //     });
  //     res.json(ApiResponse.paginated(result));
  //   } catch (err) {
  //     next(err);
  //   }
  // }


  static async list(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await PropertyService.list({
      page,
      limit,
      q: req.query.q,
      type: req.query.type,
      city: req.query.city,
      category: req.query.category,
      status: req.query.status || "active",
      possessionStatus: req.query.possessionStatus,
      minBudget: req.query.minBudget,
      maxBudget: req.query.maxBudget,
    });

    res.json(ApiResponse.paginated(result));
  } catch (err) {
    next(err);
  }
}


  static async softDelete(req, res, next) {
    try {
      const result = await PropertyService.softDelete(
        req.params.id,
        req.user._id
      );
      return res.json(ApiResponse.success(result, "Property archived"));
    } catch (e) {
      next(e);
    }
  }

  static async toggle(req, res, next) {
    try {
      const result = await PropertyService.toggleStatus(
        req.params.id,
        req.user._id
      );
      return res.json(ApiResponse.success(result, "Property status toggled"));
    } catch (e) {
      next(e);
    }
  }

  static async remove(req, res, next) {
    try {
      await PropertyService.remove(req.params.id);
      res.json(ApiResponse.success(true, "Property deleted"));
    } catch (err) {
      next(err);
    }
  }
}
