import mongoose from "mongoose";
import Lead from "../lead.model.js";
import { LeadVisibilityService } from "./lead.visibility.service.js";
import { cacheGet, cacheSet } from "../../../utils/cache.js";
import { MeetingService } from "../../meeting/meeting.service.js";
import { LEAD_POPULATE } from "./lead.pipeline.js";
import { LeadScoringService } from "./lead.scoring.service.js";
import crypto from "crypto";

export class LeadListService {
  static async listLeads({
    page = 1,
    limit = 20,
    skip = 0,
    filters = {},
    sortBy,
    sortOrder = "desc",
    requester,
    transform = (i) => i,
  }) {

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
    // if (!filters.includeDuplicates) finalFilter.isDuplicate = false;
    // if (!filters.includeArchived) finalFilter.archived = false;
    // Only apply filter if explicitly requested
    if (filters.includeDuplicates === "false") {
      finalFilter.isDuplicate = false;
    }

    if (filters.includeArchived === "false") {
      finalFilter.archived = false;
    }

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
      if (!id) return { items: [], page, limit, total: 0 };
      finalFilter.category = id;
    }

    /* ===== SORT ===== */
    const allowedSortFields = {
      source: "source",
      stage: "stage",
      assignedTo: "assignedTo",
      created_at: "createdAt",
      updated_at: "updatedAt",
    };

    const sortField = allowedSortFields[sortBy] || "lastActivityAt";
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortObj = { [sortField]: sortDirection };

    /* ===== CACHE KEY ===== */
    const filterHash = crypto
      .createHash("md5")
      .update(JSON.stringify(finalFilter))
      .digest("hex");

    const cacheKey = `leads:list:${requester._id}:${page}:${limit}:${sortField}:${sortDirection}:${filterHash}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    /* ===== PROJECTION (FULL CONTRACT SAFE) ===== */
    const projection = {
      fullName: 1,
      phone: 1,
      email: 1,
      projectName: 1,
      alternatePhones: 1,
      alternateEmails: 1,
      source: 1,
      sourceBatchId: 1,
      tags: 1,
      budgetMin: 1,
      budgetMax: 1,
      stage: 1,
      status: 1,
      assignedTo: 1,
      currentOwner: 1,
      currentOwnerRole: 1,
      ownerType: 1,
      branch: 1,
      isLocked: 1,
      lockedBy: 1,
      lastActivityAt: 1,
      category: 1,
      property_id: 1,
      isDuplicate: 1,
      duplicateOf: 1,
      hasDuplicates: 1,
      duplicates: 1,
      duplicateReason: 1,
      duplicateCount: 1,
      archived: 1,
      archivedBy: 1,
      message: 1,

      // scoring
      score: 1,
      previousScore: 1,
      scoreBreakdown: 1,
      scoreStatus: 1,
      lastScoredAt: 1,

      createdBy: 1,
      updatedBy: 1,
      isDeleted: 1,
      deletedAt: 1,
      historicalOwners: 1,
      // stageHistory: 1,
      assignmentHistory: 1,
      createdAt: 1,
      updatedAt: 1,
      __v: 1,
    };

    /* ===== QUERY ===== */
    const [leads, total] = await Promise.all([
      Lead.find(finalFilter, projection)
        .populate(LEAD_POPULATE)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(finalFilter),
    ]);

    /* ===== MEETING ENRICH ===== */
    const leadIds = leads.map((l) => l._id);
    const meetingMap = await MeetingService.getLastMeetingByLeadIds(leadIds);

    /* ===== ENSURE LSIS EXISTS (NO CONTRACT CHANGE) ===== */
    const items = leads.map((lead) => {
      if (!lead.scoreBreakdown?.lsis) {
        const lsis = LeadScoringService.calculateLSIS(lead.source);

        lead.scoreBreakdown = {
          ...lead.scoreBreakdown,
          lsis,
        };
      }

         const lastAssignment =
         lead.assignmentHistory?.length
        ? lead.assignmentHistory[lead.assignmentHistory.length - 1]
        : null;



       const assignmentHistory = {
        fromRole: lastAssignment?.roleFrom || lead.currentOwnerRole || null,
        toRole: lastAssignment?.roleTo || lead.currentOwnerRole || null,
        changedAt: lastAssignment?.changedAt || null,
        reason: lastAssignment?.reason || null,
        changedBy: lastAssignment?.roleFrom || lead.currentOwnerRole || null,
       };

      //  delete lead.assignmentHistory;




      return {
        ...lead,
        assignmentHistory,
        meetingInfo: meetingMap[lead._id.toString()] ?? {
          flag: null,
          meeting: null,
        },
      };
    });

    const response = {
      items: items.map(transform),
      page,
      limit,
      total,
    };

    await cacheSet(cacheKey, response, 300);
    return response;
  }
}