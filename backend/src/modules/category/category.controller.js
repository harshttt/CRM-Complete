import { ApiResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/appError.js";
import { CategoryService } from "./category.service.js";
import { createCategorySchema, updateCategorySchema } from "./category.validation.js";
import mongoose from "mongoose";

export class CategoryController {
  static async create(req, res, next) {
    try {
      const { error, value } = createCategorySchema.validate(req.body);
      if (error) throw AppError.badRequest(error.message);
      const created = await CategoryService.createCategory(value, req.user ? req.user._id : null);
      return res.json(ApiResponse.success(created, "Category created"));
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest("Invalid category id");
      const { error, value } = updateCategorySchema.validate(req.body);
      if (error) throw AppError.badRequest(error.message);
      const updated = await CategoryService.updateCategory(id, value);
      return res.json(ApiResponse.success(updated, "Category updated"));
    } catch (err) {
      next(err);
    }
  }

  static async get(req, res, next) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest("Invalid category id");
      const category = await CategoryService.getCategoryById(id);
      if (!category) throw AppError.notFound("Category not found");
      return res.json(ApiResponse.success(category));
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const q = req.query.q || "";
      const result = await CategoryService.getCategoriesPaginated({ page, limit, q });
      return res.json(ApiResponse.paginated(result, "Categories fetched"));
    } catch (err) {
      next(err);
    }
  }

  static async del(req, res, next) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest("Invalid category id");
      await CategoryService.deleteCategory(id);
      return res.json(ApiResponse.success(null, "Category deleted"));
    } catch (err) {
      next(err);
    }
  }

  static async restore(req, res, next) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest("Invalid category id");
      const restored = await CategoryService.restoreCategory(id);
      return res.json(ApiResponse.success(restored, "Category restored"));
    } catch (err) {
      next(err);
    }
  }

  static async dropdown(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const q = req.query.q || "";
      const result = await CategoryService.getDropdown({ page, limit, q });
      return res.json(ApiResponse.paginated(result));
    } catch (err) {
      next(err);
    }
  }

  static async toggle(req, res, next) {
  try {
    const { id } = req.params;
 

     if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id",
      });
    }

    const result = await CategoryService.toggleActive(id);
  if (!result) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

     const status = result.isDeleted ? "deactivated" : "activated";

    return res.json(ApiResponse.success(result, `Category ${status} successfully`));
  } catch (err) {
    next(err);
  }
}

}
