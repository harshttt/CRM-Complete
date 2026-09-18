import mongoose from "mongoose";
import Lead from "../lead.model.js";
import { LeadVisibilityService } from "./lead.visibility.service.js";
import { cacheGet, cacheSet } from "../../../utils/cache.js";
import { stageSummaryPipeline } from "./lead.pipeline.js";

export class LeadSummaryService {
  static async getSummary({ filters = {}, requester }) {
    /* ===== VISIBILITY ===== */
    const visibilityFilter =
      await LeadVisibilityService.buildVisibilityFilter(requester);

    const finalFilter = { ...visibilityFilter };

    if (![4].includes(requester.role?.roleLevel)) {
      delete finalFilter.assignedTo;
      delete finalFilter.currentOwner;
    }

    /* ===== BASIC FILTERS ===== */
    if (filters.stage) finalFilter.stage = filters.stage;
    if (filters.source) finalFilter.source = filters.source;
    if (filters.branch) finalFilter.branch = filters.branch;
    if (!filters.includeDuplicates) finalFilter.isDuplicate = false;
    if (!filters.includeArchived) finalFilter.archived = false;

    if (filters.q && filters.q.trim().length >= 3) {
      finalFilter.$text = { $search: filters.q.trim() };
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        finalFilter.status = { $in: filters.status };
      } else {
        const statuses = filters.status.split(",").map((s) => s.trim());
        finalFilter.status =
          statuses.length > 1 ? { $in: statuses } : statuses[0];
      }
    }

    if (filters.tags) {
      finalFilter.tags = Array.isArray(filters.tags)
        ? { $all: filters.tags }
        : filters.tags;
    }

    if (filters.hasDuplicates)
      finalFilter.hasDuplicates = filters.hasDuplicates === "true";

    /* ===== DATE ===== */
    if (filters.createdDateFrom || filters.createdDateTo) {
      finalFilter.createdAt = {};
      if (filters.createdDateFrom)
        finalFilter.createdAt.$gte = new Date(`${filters.createdDateFrom}T00:00:00.000Z`);
      if (filters.createdDateTo)
        finalFilter.createdAt.$lte = new Date(`${filters.createdDateTo}T23:59:59.999Z`);
    }

    const toObjectId = (v) =>
      mongoose.Types.ObjectId.isValid(v) ? new mongoose.Types.ObjectId(v) : null;

    if (filters.assignedTo) {
      const id = toObjectId(filters.assignedTo);
      if (id) finalFilter.assignedTo = id;
    }

    if (filters.owner) {
      const id = toObjectId(filters.owner);
      if (id) finalFilter.currentOwner = id;
    }

    if (filters.everAssignedTo) {
      const id = toObjectId(filters.everAssignedTo);
      if (id) finalFilter["historicalOwners.user"] = id;
    }

    if (filters.category) {
      const id = toObjectId(filters.category);
      if (!id) return { won: 0, lost: 0, inProgress: 0 };
      finalFilter.category = id;
    }

    /* ===== CACHE ===== */
    const cacheKey = `leads:summary:${requester._id}:${JSON.stringify(finalFilter)}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    /* ===== AGGREGATION ===== */
    const [summary] = await Lead.aggregate(stageSummaryPipeline(finalFilter));

    const response = {
      won: summary?.won ?? 0,
      lost: summary?.lost ?? 0,
      inProgress: summary?.inProgress ?? 0,
    };

    await cacheSet(cacheKey, response, 300);
    return response;
  }
}