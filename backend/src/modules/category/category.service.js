import Category from "./category.model.js";
import createError from "http-errors";
import { cacheGet, cacheSet, cacheDel, cacheScanDel } from "../../utils/cache.js";
import { deepTransform } from "../../utils/transform.js";
import mongoose from "mongoose";

export class CategoryService {


 static _transform(doc) {
    return deepTransform(doc);
  }

  static async createCategory(data, createdBy = null) {
    if (!data?.name) throw createError(400, "name required");
    // normalize
    const name = data.name.trim();
    // check existing (case-insensitive)
    const exist = await Category.findOne({ name }).collation({ locale: "en", strength: 2 });
    if (exist) throw createError(409, "Category name already exists");
    const cat = await Category.create({ ...data, name, createdBy });

      const plain = cat.toObject();
   
    // invalidate caches
    await cacheScanDel("categories:paginated:");
    await cacheScanDel("categories:dropdown:");
       return this._transform(plain);
    
  }

  static async getCategoryById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw createError(400, "Invalid category id");
    const key = `category:${id}`;
    const cached = await cacheGet(key);
    if (cached) return cached;
    const cat = await Category.findById(id).lean();
    if (!cat) return null;
    const transformed = this._transform(cat);
    await cacheSet(key, transformed, 300);
    return transformed;
  }

  static async updateCategory(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw createError(400, "Invalid category id");
    const update = {};
    if (data.name !== undefined) update.name = data.name.trim();
    if (data.description !== undefined) update.description = data.description;
    // check name conflict
    if (update.name) {
      const conflict = await Category.findOne({ name: update.name, _id: { $ne: id } }).collation({ locale: "en", strength: 2 });
      if (conflict) throw createError(409, "Category name already exists");
    }
    const updated = await Category.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) throw createError(404, "Category not found");
    await cacheDel(`category:${id}`);
    await cacheScanDel("categories:paginated:");
    await cacheScanDel("categories:dropdown:");
    return this._transform(updated);
  }


  static async deleteCategory(id) {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw createError(400, "Invalid category id");

  const cat = await Category.findById(id);
  if (!cat) throw createError(404, "Category not found");

  cat.isDeleted = true;
  cat.deletedAt = new Date();
  await cat.save();

  await cacheDel(`category:${id}`);
  await cacheScanDel("categories:paginated:");
  await cacheScanDel("categories:dropdown:");

  return true;
}


  static async restoreCategory(id) {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw createError(400, "Invalid category id");
  const cat = await Category.findOne({ _id: id })
    .setOptions({ ignoreDeleted: true });

  if (!cat) throw createError(404, "Category not found");

  cat.isDeleted = false;
  cat.deletedAt = null;
  await cat.save();

  await cacheDel(`category:${id}`);
  await cacheScanDel("categories:paginated:");
  await cacheScanDel("categories:dropdown:");

  return this._transform(cat.toObject());
}


  static async getCategoriesPaginated({ page = 1, limit = 20, q = "", sort = { createdAt: -1 }, includeDeleted = false }) {
    const key = `categories:paginated:${page}:${limit}:${q}:${JSON.stringify(sort)}:${includeDeleted}`;
    const cached = await cacheGet(key);
    if (cached) return cached;

    const filter = {};
    if (q) filter.name = { $regex: q, $options: "i" };
    if (!includeDeleted) filter.isDeleted = false;

    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      Category.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Category.countDocuments(filter),
    ]);

    const data = rows.map((r) => this._transform(r));
    const result = { data, page, totalPages: Math.max(1, Math.ceil(total / limit)), total };

    await cacheSet(key, result, 300);
    return result;
  }

  static async getCategoryByName(name) {
    if (!name) return null;
    return Category.findOne({ name }).collation({ locale: "en", strength: 2 }).lean();
  }

  // Helper used by lead.service: find or create a category by name
  static async getOrCreateByName(name, createdBy = null) {
    if (!name) return null;
    const normalized = name.trim();
    const existing = await Category.findOne({ name: normalized }).collation({ locale: "en", strength: 2 });
    if (existing) return existing;
    const cat = await Category.create({ name: normalized, createdBy });
    await cacheScanDel("categories:paginated:");
    await cacheScanDel("categories:dropdown:");
    return cat;
  }

  static async getDropdown({ page = 1, limit = 50, q = "" }) {
    const key = `categories:dropdown:${page}:${limit}:${q}`;
    const cached = await cacheGet(key);
    if (cached) return cached;
    const filter = { isDeleted: false };
    if (q) filter.name = { $regex: q, $options: "i" };
    const skip = (page - 1) * limit;
    const data = await Category.find(filter).select("name").sort({ name: 1 }).skip(skip).limit(limit).lean();
    const fixed = data.map(d => ({ id: String(d._id), name: d.name }));
    const total = await Category.countDocuments(filter);
    const result = { data: fixed, page, totalPages: Math.max(1, Math.ceil(total / limit)), total };
    await cacheSet(key, result, 300);
    return result;
  }


  static async toggleActive(id, isActive) {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw createError(400, "Invalid category id");

  const cat = await Category.findOne({ _id: id })
    .setOptions({ ignoreDeleted: true });

  if (!cat) throw createError(404, "Category not found");
  cat.isDeleted = !cat.isDeleted;
  cat.deletedAt = cat.isDeleted ? new Date() : null;
  await cat.save();

  await cacheDel(`category:${id}`);
  await cacheScanDel("categories:paginated:");
  await cacheScanDel("categories:dropdown:");

  return this._transform(cat.toObject());
}

}
