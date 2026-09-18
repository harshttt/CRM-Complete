import Lead from "./lead.model.js";
import { Transform } from "stream";
import Activity from "../activity/activity.model.js";
import createError from "http-errors";
import mongoose from "mongoose";
import {cacheGet,cacheSet,cacheDel,cacheScanDel,} from "../../utils/cache.js";
import { UserService } from "../user/user.service.js";
import LeadComment from "../comment/comment.model.js";
import { deepTransform } from "../../utils/transform.js";
import MetaRawData from "../facebook/metaRawData.model.js";

//lead services
import { LeadVisibilityService } from "./services/lead.visibility.service.js";
import { LeadAssignmentService } from "./services/lead.assignment.service.js";
import { LeadLifecycleService } from "./services/lead.lifecycle.service.js";
import { CommentService } from "../comment/comment.service.js";
import { LeadExportService } from "./services/lead.export.service.js";
import { LeadLockService } from "./services/lead.lock.service.js";
import { LeadListService } from "./services/lead.list.service.js";
import { LeadAutoArchiveService } from "./services/lead.autoArchive.service.js";
import { LeadSaveService } from "./services/lead.save.service.js";
import { LeadScoringService } from "./services/lead.scoring.service.js";
import { LeadSummaryService } from "./services/lead.summary.service.js";





export class LeadService {
  static async getAllMetaLeads() {
    const data = await MetaRawData
      .find({ source: "meta" })
      .sort({ date: -1 })
      .lean();

    return data;
  }

  // Activity Logger
  static logActivity(leadId, userId, type, description, metadata = {}) {
    return Activity.create({
      lead: leadId,
      user: userId,
      type,
      description,
      metadata,
    });
  }

  // Transform lead document to desired format
  static _transform(doc) {
    return deepTransform(doc);
  }

  // Build visibility filter
  static buildVisibilityFilter(req) {
    return LeadVisibilityService.buildVisibilityFilter(req);
  }

  static async buildLeadFilters({ filters, requester }) {
    const visibilityFilter = await this.buildVisibilityFilter(requester);
    const finalFilter = { ...visibilityFilter };

    delete finalFilter.assignedTo;
    delete finalFilter.currentOwner;

    if (filters.stage) finalFilter.stage = filters.stage;
    if (filters.source) finalFilter.source = filters.source;
    if (filters.branch) finalFilter.branch = filters.branch;
    if (filters.q) finalFilter.$text = { $search: filters.q };

    // Date filter
    if (filters.createdDateFrom || filters.createdDateTo) {
      finalFilter.createdAt = {};
      if (filters.createdDateFrom) {
        finalFilter.createdAt.$gte = new Date(
          `${filters.createdDateFrom}T00:00:00.000Z`
        );
      }
      if (filters.createdDateTo) {
        finalFilter.createdAt.$lte = new Date(
          `${filters.createdDateTo}T23:59:59.999Z`
        );
      }
    }

    // Assignment filters (same as your code)
    if (
      filters.assignedTo &&
      mongoose.Types.ObjectId.isValid(filters.assignedTo)
    ) {
      finalFilter.assignedTo = new mongoose.Types.ObjectId(filters.assignedTo);
    }
    return finalFilter;
  }

 // get lead by id
  static async getLeadById(id, requester = null) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw createError(400, "Invalid lead id");


    const key = `lead:${id}`;
    const cached = await cacheGet(key);
    if (cached) {
      if (
        cached.status === "auto_removed" &&
        ![1, 2].includes(requester?.role?.roleLevel)
      ) {
        throw createError(404, "Lead not found");
      }
      return cached;
    }


    const lead = await Lead.findById(id)
      .populate("assignedTo", "fullName email phone")
      .populate("currentOwner", "fullName email phone")
      .populate("category", "name description")
      // .populate("property", "name")
      .lean();

    if (!lead) throw createError(404, "Lead not found");

    // Perform visibility check using hierarchy logic
    const visibilityFilter = await this.buildVisibilityFilter(requester);

    const allowed = await Lead.exists({
      _id: id,
      ...visibilityFilter,
    });

    if (!allowed) { 
      throw createError(403, "You are not allowed to view this lead");
    }
    // Fetch comments
    const comments = await LeadComment.find({ leadId: id })
      .sort({ createdAt: -1 })
      .lean();
    lead.comments = comments;
    const transformed = LeadService._transform(lead);
    await cacheSet(key, transformed, 300);
    return transformed;
  }

  // duplicate lead
static async getDuplicateLeads(leadId, { page = 1, limit = 10 } = {}) {

  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw createError(400, "Invalid lead id");
  }

  const lead = await Lead.findById(leadId).lean();
  if (!lead) throw createError(404, "Lead not found");

  const rootLeadId =
    lead.isDuplicate && lead.duplicateOf
      ? lead.duplicateOf
      : lead._id;

  const rootLead = await Lead.findById(rootLeadId).lean();

  if (!rootLead) throw createError(404, "Root lead not found");
  const skip = (page - 1) * limit;
  const [duplicates, total] = await Promise.all([
    Lead.find({duplicateOf: rootLeadId,isDuplicate: true})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Lead.countDocuments({duplicateOf: rootLeadId,isDuplicate: true}),
  ]);

  return {
    rootLead :LeadService._transform(rootLead),
    duplicates: duplicates.map(LeadService._transform),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
  }

  // list leads
  static async listLeads({
    page = 1,
    limit = 20,
    skip = 0,
    filters = {},
    requester,
    sortBy,
    sortOrder,
  }) {
    return LeadListService.listLeads({
      page,
      limit,
      skip,
      filters,
      requester,
      sortBy,
      sortOrder,
      transform: this._transform,
    });
  }

  static async getAssignmentHistory(leadId, { page = 1, limit = 20 }) {
  if (!mongoose.Types.ObjectId.isValid(leadId))
    throw createError(400, "Invalid lead id");

  const skip = (page - 1) * limit;

  const cacheKey = `lead:assignmentHistory:${leadId}:${page}:${limit}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const lead = await Lead.findById(
    leadId,
    {
      currentOwnerRole: 1,
      assignmentHistory: { $slice: [skip, limit] },
    }
  )
    .populate({
      path: "assignmentHistory.changedBy",
      select: "fullName role",
      populate: {
        path: "role",
        select: "name",
      },
    })
    .lean();

  if (!lead) throw createError(404, "Lead not found");

  const totalDoc = await Lead.findById(leadId)
    .select("assignmentHistory")
    .lean();

  const total = totalDoc?.assignmentHistory?.length || 0;

  const response = {
    currentRole: lead.currentOwnerRole || null,
    history: lead.assignmentHistory || [],
    page,
    limit,
    total,
  };

  await cacheSet(cacheKey, response, 300);
  return response;
}


static async getStageHistory(leadId, { page = 1, limit = 20 }) {
  if (!mongoose.Types.ObjectId.isValid(leadId))
    throw createError(400, "Invalid lead id");

  const skip = (page - 1) * limit;

  const cacheKey = `lead:stageHistory:${leadId}:${page}:${limit}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const lead = await Lead.findById(
    leadId,
    {
      stage: 1,
      stageHistory: { $slice: [skip, limit] },
    }
  )
    .populate({
      path: "stageHistory.changedBy",
      select: "fullName role",
      populate: {
        path: "role",
        select: "name",
      },
    })
    .lean();

  if (!lead) throw createError(404, "Lead not found");

  const totalDoc = await Lead.findById(leadId)
    .select("stageHistory")
    .lean();

  const total = totalDoc?.stageHistory?.length || 0;

  const response = {
    currentStage: lead.stage || null,
    history: lead.stageHistory || [],
    page,
    limit,
    total,
  };

  await cacheSet(cacheKey, response, 300);
  return response;
}

  static async getSummary({ filters = {}, requester }) {
  return LeadSummaryService.getSummary({
    filters,
    requester,
  });
}

  
  // list comments
  static listComments(args) {
    return CommentService.listComments(args);
  }

  // update comment
  static async updateComment(id, userId, payload) {
    return CommentService.updateComment(id, userId, payload);
  }

  // create or update lead
  static async saveLead({ payload, id = null, userId }) {
  return LeadSaveService.saveLead({ payload, id, userId });
  }

  // add comment
  static addComment(args) {
    return CommentService.addComment(args);
  }

  // Bulk stage change
  static async bulkStageChange(leadIds, newStage, doneBy) {
    if (!Array.isArray(leadIds))
      throw createError(400, "leadIds must be array");

    const validIds = leadIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    let modified = 0;
    for (const id of validIds) {
      try {
        await this.updateStage(id, newStage, doneBy);
        modified++;
      } catch (err) {
        console.log(err);
      }
    }

    await this.logActivity(
      null,
      doneBy,
      "bulk_stage_change",
      `Bulk stage changed to ${newStage}`,
      { count: modified }
    );

    await cacheScanDel("leads:list");
    return { modifiedCount: modified };
  }

  // Assign lead
  static async assignLead(leadId, assignedTo, doneBy, reason = null) {
    if (
      !mongoose.Types.ObjectId.isValid(leadId) ||
      !mongoose.Types.ObjectId.isValid(assignedTo)
    )
      throw createError(400, "Invalid id");

    const requester = await UserService.getUser(doneBy);
    // Check assign permission

    const allowed = await LeadAssignmentService.canAssign(requester, assignedTo);
    // const allowed = await this.canAssignLead(requester, assignedTo);
    if (!allowed) {
      throw createError(403, "You are not allowed to assign this lead");
    }

    const lead = await Lead.findById(leadId);
    if (!lead) throw createError(404, "Lead not found");

    // Prevent useless re-assign
    if (String(lead.assignedTo) === String(assignedTo)) {
      throw createError(400, "Lead already assigned to this user");
    }

    const targetUser = await UserService.getUser(assignedTo);
    if (!targetUser) throw createError(400, "Assigned user not found");

    const newRole = targetUser.role?.name?.toLowerCase() || null;
    const oldAssignee = lead.assignedTo ? String(lead.assignedTo) : null;
    const oldRole = lead.currentOwnerRole || null;

    //assignment history
    lead.assignmentHistory.push({
      from: oldAssignee,
      to: assignedTo,
      roleFrom: oldRole,
      roleTo: newRole,
      changedAt: new Date(),
      reason,
      changedBy: doneBy,
    });

    //ownership update
    lead.assignedTo = assignedTo;
    lead.currentOwner = assignedTo;
    lead.currentOwnerRole = newRole;
    lead.lastAssignedAt = new Date();
    lead.lastActivityAt = new Date();
    lead.updatedBy = doneBy;


      if ([4].includes(targetUser.role?.roleLevel)) {
      lead.currentOwner = assignedTo;
      lead.currentOwnerRole = targetUser.role?.name?.toLowerCase();
      lead.createdBy = assignedTo;
    }

    await lead.save();
    await this.logActivity(leadId, doneBy, "assigned_to", "Lead assigned", {
      oldAssignee,
      newAssignee: assignedTo,
      reason,
    });

    await cacheDel(`lead:${leadId}`);
    await cacheScanDel("leads:list");
    await cacheScanDel(`lead:assignmentHistory:${leadId}:`);
    const populatedLead = await Lead.findById(leadId)
      .populate("assignedTo", "fullName email phone")
      .populate("currentOwner", "fullName email phone")
      .populate("category", "name description")
      .lean();

    return LeadService._transform(populatedLead);
    // return lead;
  }

  // update lead stage
  static async updateStage(leadId, newStage, doneBy) {
    if (!mongoose.Types.ObjectId.isValid(leadId))
      throw createError(400, "Invalid lead id");

    const lead = await Lead.findById(leadId);
    if (!lead) throw createError(404, "Lead not found");

    const oldStage = lead.stage;
    lead.stage = newStage;

    lead.stageHistory.push({
      from: oldStage,
      to: newStage,
      changedAt: new Date(),
      changedBy: doneBy,
    });

       const delta =
  LeadScoringService.calculateSPS(oldStage, newStage);

lead.scoreBreakdown.sps =
    (lead.scoreBreakdown.sps || 0) + delta;

    if (!lead.firstContactedAt && newStage !== "fresh") {
      lead.firstContactedAt = new Date();
      lead.timeToFirstContactMinutes = Math.round(
        (lead.firstContactedAt - lead.createdAt) / 60000
      );

        // APPLY CRTS HERE
  lead.scoreBreakdown.crts =
    LeadScoringService.calculateCRTS(
      lead.timeToFirstContactMinutes
    );
    }

    lead.lastActivityAt = new Date();
    lead.updatedBy = doneBy;

    //REAL-TIME AUTO REMOVE ON "UNQUALIFIED" STAGE
    if (newStage === "invalid" || newStage === "unqualified") {
      // console.log("AUTO REMOVE TRIGGERED BY STAGE CHANGE → unqualified");


      await LeadLifecycleService.autoRemove(lead, "invalid", doneBy);


      // Clear cache
      await cacheDel(`lead:${leadId}`);
      await cacheScanDel("leads:list");
      await cacheScanDel(`lead:stageHistory:${leadId}:`);

      // Log
      await this.logActivity(
        leadId,
        doneBy,
        "stage_changed_auto_removed",
        `Stage changed to unqualified → Auto removed by rule NI-stage`
      );

      // Return archived lead (reloaded fresh)
      const updatedLead = await Lead.findById(leadId).lean();
      return updatedLead;
    }
    await lead.save();

    await this.logActivity(
      leadId,
      doneBy,
      "stage_changed",
      `Stage changed from ${oldStage} to ${newStage}`
    );

    await cacheDel(`lead:${leadId}`);
    await cacheScanDel("leads:list");
    return lead;
  }

  // update lead info
  static async updateLeadInfo(leadId, data, doneBy) {
    if (!mongoose.Types.ObjectId.isValid(leadId))
      throw createError(400, "Invalid lead id");

    const lead = await Lead.findById(leadId);
    if (!lead) throw createError(404, "Lead not found");

    Object.assign(lead, data);
    lead.lastActivityAt = new Date();
    lead.updatedBy = doneBy;
    await lead.save();
    await this.logActivity(
      leadId,
      doneBy,
      "lead_updated",
      "Lead info updated",
      { data }
    );

    await cacheDel(`lead:${leadId}`);
    await cacheScanDel("leads:list");

    return lead;
  }

  // soft delete
  static async softDeleteLead(leadId, doneBy) {
    if (!mongoose.Types.ObjectId.isValid(leadId))
      throw createError(400, "Invalid lead id");

    const lead = await Lead.findById(leadId);
    if (!lead) throw createError(404, "Lead not found");

    // Soft delete flags
    lead.status = "archived"; // correct enum value
    lead.archived = true; // your model has this field also
    lead.archivedAt = new Date();
    lead.archivedBy = doneBy;
    lead.archiveReason = "manual"; // optional but recommended
    lead.lastActivityAt = new Date();
    lead.deletedAt = new Date();

    lead.updatedBy = doneBy;

    await lead.save();

    // Log activity
    await this.logActivity(
      leadId,
      doneBy,
      "lead_archived",
      "Lead soft deleted (archived)"
    );

    await cacheDel(`lead:${leadId}`);
    await cacheScanDel("leads:list");
    await cacheScanDel(`lead:assignmentHistory:${leadId}:`);
    await cacheScanDel(`lead:stageHistory:${leadId}:`);

    return lead;
  }

  // bulk assign
  static async bulkAssign(leadIds, assignedTo, doneBy, reason = null) {
    const requester = await UserService.getUser(doneBy);

    // Permission check once
    const allowed = await LeadAssignmentService.canAssign(requester, assignedTo);
    if (!allowed) {
      throw createError(403, "You are not allowed to assign leads to this user");
    }

    const validIds = leadIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    let modified = 0;

    for (const id of validIds) {
      try {
        const updated = await this.assignLead(id, assignedTo, doneBy, reason);
        if (updated) modified++;
      } catch (e) {}
    }

    await this.logActivity(
      null,
      doneBy,
      "bulk_assign",
      "Bulk assign completed",
      { count: modified, assignedTo, leadIds }
    );

    await cacheScanDel("leads:list");

    return { modifiedCount: modified };
  }

//lock lead
  static lockLead(leadId, userId, durationMinutes = 10) {
    return LeadLockService.lockLead(leadId, userId, durationMinutes);
  }

  // unlock lead
  static unlockLead(leadId, userId) {
    return LeadLockService.unlockLead(leadId, userId);
  }

  // restore lead
  static async restoreLead(leadId, restoredBy) {
    if (!mongoose.Types.ObjectId.isValid(leadId))
      throw createError(400, "Invalid lead id");
    const lead = await Lead.findById(leadId);
    if (!lead) throw createError(404, "Lead not found");
    lead.status = "active";
    lead.archivedAt = null;
    lead.deletedAt = null;
    lead.archiveReason = null;
    lead.archivedBy = null;
    lead.updatedBy = restoredBy;
    await lead.save();
    await this.logActivity(
      leadId,
      restoredBy,
      "lead_restored",
      "Lead restored"
    );
    await cacheDel(`lead:${leadId}`);
    await cacheScanDel("leads:list");
    return lead;
  }

  static async exportLeads({ filters , requester }) {

  //     const normalizedFilters = {
  //   ...filters,
  //   createdDateFrom: filters.createdDateFrom || filters.fromDate,
  //   createdDateTo: filters.createdDateTo || filters.toDate,
  // };
  const { items } = await LeadListService.listLeads({
    page: 1,
    limit: 1000000, // ignore pagination for export
    skip: 0,
    filters,
    requester,
    transform: (i) => i,
  });

  return LeadExportService.exportExcel(items);
}

  // bulk import wrapper
  static bulkImport(buffer, fileName, userId) {
    return LeadExportService.bulkImport(buffer, fileName, userId);
  }

  static async runAutoArchiveJobs(opts = {}) {
    return LeadAutoArchiveService.runAutoArchiveJobs(opts);
  }
}
