import mongoose from "mongoose";
import createError from "http-errors";
import Property from "./property.model.js";
import {
  cacheGet,
  cacheSet,
  cacheScanDel,
  cacheDel,
} from "../../utils/cache.js";
import { deepTransform } from "../../utils/transform.js";


export class PropertyService {

    static _transform(doc) {
      return deepTransform(doc);
    }

  static async create(payload, userId) {
    if (!payload.name) throw createError(400, "Property name is required");

    const property = await Property.create({
      ...payload,
      createdBy: userId,
    });

    await cacheScanDel("properties:list");
    return PropertyService._transform(property.toObject());
    // return property;
  }

  static async update(id, payload, userId) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw createError(400, "Invalid property id");

    const property = await Property.findById(id);
    if (!property) throw createError(404, "Property not found");

    Object.assign(property, payload);
    property.updatedBy = userId;

    await property.save();
    await cacheDel(`property:${id}`);
    await cacheScanDel("properties:list");

    // return PropertyService._transform(property);
    return PropertyService._transform(property.toObject());

    
    // return property;
  }

  static async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw createError(400, "Invalid property id");

    const property = await Property.findById(id)
      .populate("category", "name")
      .lean();

    if (!property) throw createError(404, "Property not found");
    return PropertyService._transform(property);
    // return property;
  }

  // static async list({
  //   page = 1,
  //   limit = 20,
  //   q,
  //   type,
  //   city,
  //   minBudget,
  //   maxBudget,
  //   category,
  //   status = "active",
  // }) {
  //   const skip = (page - 1) * limit;
  //   const filter = { status };

  //   // SEARCH
  //   if (q) filter.$text = { $search: q };

  //   if (type) filter.type = type;
  //   if (city) filter["location.city"] = city;

  //   // Budget filter
  //   if (minBudget || maxBudget) {
  //     filter.$and = [];
  //     if (minBudget)filter.$and.push({ budgetMin: { $gte: Number(minBudget) } });
  //     if (maxBudget)filter.$and.push({ budgetMax: { $lte: Number(maxBudget) } });
  //   }

  //   //Category
  //   if (category && mongoose.Types.ObjectId.isValid(category)) {
  //     filter.category = category;
  //   }

  //   const cacheKey = `properties:list:${page}:${limit}:${JSON.stringify(filter)}`;
  //   const cached = await cacheGet(cacheKey);
  //   if (cached) return cached;

  //   const pipeline = [
  //     { $match: filter },

  //     // Populate category BUT ONLY NOT DELETED
  //     {
  //       $lookup: {
  //         from: "categories",
  //         localField: "category",
  //         foreignField: "_id",
  //         as: "category",
  //       },
  //     },
  //     { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

  //     {
  //       $match: {
  //         $or: [{ category: null }, { "category.isDeleted": false }],
  //       },
  //     },

  //     { $sort: { createdAt: -1 } },

  //     {
  //       $facet: {
  //         items: [{ $skip: skip }, { $limit: limit }],
  //         totalCount: [{ $count: "count" }],
  //       },
  //     },
  //   ];

  //   const result = await Property.aggregate(pipeline);
  //   const items = result[0].items;
  //   const total = result[0].totalCount[0]?.count || 0;

  //   const response = {
  //     items,
  //     page,
  //     limit,
  //     total,
  //     totalPages: Math.ceil(total / limit),
  //   };

  //   await cacheSet(cacheKey, response, 300);
  //   return response;
  // }


  static async list({
  page = 1,
  limit = 20,
  q,
  type,
  possessionStatus,
  city,
  minBudget,
  maxBudget,
  category,
  status,
}) {
  const skip = (page - 1) * limit;

  const filter = { status };

  //Search
  // if (q) {filter.$text = { $search: q };}
    if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { projectName: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }
  if(possessionStatus) filter.possessionStatus = possessionStatus;
  if(status) filter.status = status;
  if (type) filter.type = type;
  if (city) filter["location.city"] = city;
  if (minBudget || maxBudget) {
    filter.$and = [];
    if (minBudget) filter.$and.push({ budgetMin: { $gte: Number(minBudget) } });
    if (maxBudget) filter.$and.push({ budgetMax: { $lte: Number(maxBudget) } });
  }

 if (category && mongoose.Types.ObjectId.isValid(category)) {
    filter.category = new mongoose.Types.ObjectId(category);
  }

  const cacheKey = `properties:list:${page}:${limit}:${JSON.stringify(filter)}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  //
  const [items, total] = await Promise.all([
    Property.find(filter)
      .populate({
        path: "category",
        select: "name description",
        match: { isDeleted: false },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Property.countDocuments(filter),
  ]);

  const response = {
   items: items.map((i) => PropertyService._transform(i)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  await cacheSet(cacheKey, response, 300);
  return response;
}


  static async softDelete(propertyId, doneBy) {
    if (!mongoose.Types.ObjectId.isValid(propertyId))
      throw createError(400, "Invalid property id");

    const property = await Property.findById(propertyId);
    if (!property) throw createError(404, "Property not found");

    property.status = "archived";
    property.archivedAt = new Date();
    property.archivedBy = doneBy;

    await property.save();

    await cacheDel(`property:${propertyId}`);
    await cacheScanDel("properties:list");

    // return PropertyService._transform(property.toObject());
    return property;
  }

  static async toggleStatus(propertyId, doneBy) {
    if (!mongoose.Types.ObjectId.isValid(propertyId))
      throw createError(400, "Invalid property id");

    const property = await Property.findById(propertyId);
    if (!property) throw createError(404, "Property not found");

    property.status = property.status === "active" ? "inactive" : "active";
    property.updatedBy = doneBy;

    await property.save();
    await cacheDel(`property:${propertyId}`);
    await cacheScanDel("properties:list");

    // return PropertyService._transform(property.toObject());
    return property;
  }

  static async remove(id) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw createError(400, "Invalid property id");

    await Property.deleteOne({ _id: id });
    await cacheDel(`property:${id}`);
    await cacheScanDel("properties:list");

    return true;
  }
}
