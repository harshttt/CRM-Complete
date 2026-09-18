import Legal from "./legal.model.js";
import { cacheGet, cacheSet, cacheDel, cacheScanDel } from "../../utils/cache.js";
import { AppError } from "../../utils/appError.js";

export class LegalService {
  /* ---------------- CREATE ---------------- */
  static async createLegal(data, userId) {
    const doc = await Legal.create({
      ...data,
      createdBy: userId,
      updatedBy: userId
    });

    await cacheScanDel("legal:paginated:");
    await cacheScanDel("legal:public:");

    const created = await Legal.findById(doc._id).lean();

    return {
      ...created,
      id: String(created._id)
    };
  }

  /* ---------------- UPDATE OR PUBLISH ---------------- */
  static async updateLegal(id, data, userId) {
    const doc = await Legal.findOne({ _id: id, isDeleted: false });
    if (!doc) return null;

    /* ---- If publish requested ---- */
    if (data.status === "PUBLISHED") {
      if (doc.status !== "PUBLISHED") {
        // unpublish previous
        await Legal.updateMany(
          { type: doc.type, status: "PUBLISHED" },
          { status: "DRAFT" }
        );

        doc.status = "PUBLISHED";
        doc.publishedAt = new Date();
      }
    }

    /* ---- Normal updates ---- */
    if (data.title !== undefined) doc.title = data.title;
    if (data.content !== undefined) doc.content = data.content;
    if (data.version !== undefined) doc.version = data.version;

    doc.updatedBy = userId;

    await doc.save();

    await cacheDel(`legal:${id}`);
    await cacheScanDel("legal:paginated:");
    await cacheScanDel("legal:public:");

    return {
      ...doc.toObject(),
      id: String(doc._id)
    };
  }

  /* ---------------- GET BY ID ---------------- */
  static async getLegalById(id) {
    const key = `legal:${id}`;
    const cached = await cacheGet(key);
    if (cached) return cached;

    const doc = await Legal.findOne({ _id: id, isDeleted: false }).lean();
    if (!doc) return null;

    const result = { ...doc, id: String(doc._id) };

    await cacheSet(key, result, 300);
    return result;
  }

  /* ---------------- PUBLIC FETCH ---------------- */
  static async getPublishedByType(type) {
    const key = `legal:public:${type}`;
    const cached = await cacheGet(key);
    if (cached) return cached;

    const doc = await Legal.findOne({
      type,
      status: "PUBLISHED",
      isDeleted: false
    })
      .select("type title content version publishedAt")
      .lean();

    if (!doc) return null;

    const result = {
      type: doc.type,
      title: doc.title,
      content: doc.content,
      version: doc.version,
      publishedAt: doc.publishedAt
    };

    await cacheSet(key, result, 600);
    return result;
  }

  /* ---------------- PAGINATED ---------------- */
  static async getLegalPaginated({ page, limit, filter, sort }) {
    const key = `legal:paginated:${page}:${limit}:${JSON.stringify(filter)}:${JSON.stringify(sort)}`;
    const cached = await cacheGet(key);
    if (cached) return cached;

    const result = await Legal.paginate({
      page,
      limit,
      filter: { ...filter, isDeleted: false },
      sort
    });

    const ids = result.data.map(d => d._id);

    const docs = await Legal.find({ _id: { $in: ids } })
      .select("type title version status publishedAt createdAt updatedAt")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const fixed = docs.map(d => ({
      id: String(d._id),
      type: d.type,
      title: d.title,
      version: d.version,
      status: d.status,
      publishedAt: d.publishedAt,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt
    }));

    const final = {
      data: fixed,
      page: result.page,
      totalPages: result.totalPages,
      total: result.total
    };

    await cacheSet(key, final, 300);
    return final;
  }
}