import mongoose from "mongoose";
import Lead from "../lead/lead.model.js";
import LeadComment from "./comment.model.js";
import createError from "http-errors";
import Activity from "../activity/activity.model.js";
import { isNIComment } from "../../utils/autoRules.js";
import { LeadLifecycleService } from "../lead/services/lead.lifecycle.service.js";
import { deepTransform } from "../../utils/transform.js";
import { cacheDel, cacheScanDel, cacheGet, cacheSet } from "../../utils/cache.js";
import { notifyLeadCommentAdded } from "../notification/notification.helper.js";
import { LeadScoringService } from "../lead/services/lead.scoring.service.js";
const LIST_CACHE_TTL = 60;

export class CommentService {

  /* ================= ADD COMMENT ================= */
  static async addComment({
    leadId,
    userId,
    comment,
    conversationType,
    commentType,
    stage,
  }) {
    if (!mongoose.Types.ObjectId.isValid(leadId))
      throw new Error("Invalid lead id");
    const lead = await Lead.findById(leadId);
    if (!lead) throw new Error("Lead not found");
    const oldStage = lead.stage;
    let stageChanged = false;
    if (stage && stage !== lead.stage) {
      lead.stage = stage;
      stageChanged = true;
      lead.stageHistory.push({
        from: oldStage,
        to: stage,
        changedAt: new Date(),
        changedBy: userId,
      });
      const spsDelta = LeadScoringService.calculateSPS(oldStage, stage);
      lead.scoreBreakdown.sps = (lead.scoreBreakdown.sps || 0) + spsDelta;
      if (!lead.firstContactedAt && stage !== "fresh") {
        lead.firstContactedAt = new Date();
        lead.timeToFirstContactMinutes = Math.round(
          (lead.firstContactedAt - lead.createdAt) / 60000
        );
      }
    }
    if (commentType) {
      const cesDelta = LeadScoringService.calculateCES(commentType);
      lead.scoreBreakdown.ces = (lead.scoreBreakdown.ces || 0) + cesDelta;
    }
    const newComment = await LeadComment.create({
      leadId,
      comment,
      conversationType,
      stage: stage || lead.stage,
      commentType,
      createdBy: userId,
    });
    if (isNIComment(comment)) {
      await LeadLifecycleService.autoRemove(lead, "NI-comment", userId);
    }
    lead.lastActivityAt = new Date();
    lead.updatedBy = userId;
    if (!lead.firstContactedAt && lead.lastAssignedAt) {
      lead.firstContactedAt = new Date();
      lead.timeToFirstContactMinutes = Math.round(
        (lead.firstContactedAt - lead.lastAssignedAt) / 60000
      );
    }
    await notifyLeadCommentAdded(lead, userId);
    await lead.save();
    if (stageChanged) {
      await Activity.create({
        lead: leadId,
        user: userId,
        type: "stage_changed",
        description: `Stage changed from ${oldStage} → ${stage}`,
        metadata: { from: oldStage, to: stage },
      });
    }
    await Activity.create({
      lead: leadId,
      user: userId,
      type: "comment_added",
      description: "Comment added",
    });
    await cacheDel(`lead:${leadId}`);
    await cacheScanDel(`leadComments:${leadId}`);
    await cacheScanDel("leads:list");
    return deepTransform(newComment.toObject());
  }
  /* ================= UPDATE COMMENT ================= */
  static async updateComment(id, userId, payload) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw createError(400, "Invalid comment id");
    const commentDoc = await LeadComment.findById(id);
    if (!commentDoc) throw createError(404, "Comment not found");
    const lead = await Lead.findById(commentDoc.leadId);
    if (!lead) throw createError(404, "Lead not found");
    const oldStage = lead.stage;
    if (
      payload.stage !== undefined &&
      payload.stage !== null &&
      payload.stage !== lead.stage
    ) {
      lead.stage = payload.stage;
      lead.stageHistory.push({
        from: oldStage,
        to: payload.stage,
        changedAt: new Date(),
        changedBy: userId,
      });
      if (!lead.firstContactedAt && payload.stage !== "fresh") {
        lead.firstContactedAt = new Date();
        lead.timeToFirstContactMinutes = Math.round(
          (lead.firstContactedAt - lead.createdAt) / 60000
        );
      }
    }
    if (payload.comment) commentDoc.comment = payload.comment;
    if (payload.conversationType)
      commentDoc.conversationType = payload.conversationType;
    if (payload.commentType) commentDoc.commentType = payload.commentType;
    commentDoc.stage = payload.stage || lead.stage;
    await commentDoc.save();
    lead.lastActivityAt = new Date();
    lead.updatedBy = userId;
    await lead.save();
    await Activity.create({
      lead: commentDoc.leadId,
      user: userId,
      type: "comment_updated",
      description: "Comment updated",
    });
    await cacheDel(`lead:${commentDoc.leadId}`);
    await cacheScanDel(`leadComments:${commentDoc.leadId}`);
    await cacheScanDel("leads:list");
    return deepTransform(commentDoc.toObject());
  }
  /* ================= LIST COMMENTS (CACHED) ================= */
  static async listComments({
    leadId,
    page = 1,
    limit = 20,
    commentType,
    conversationType,
  }) {
    if (!mongoose.Types.ObjectId.isValid(leadId))
      throw createError(400, "Invalid lead id");
    const cacheKey =
      `leadComments:${leadId}:p${page}:l${limit}:ct${commentType || "all"}:conv${conversationType || "all"}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;
    const skip = (page - 1) * limit;
    const match = { leadId: new mongoose.Types.ObjectId(leadId) };
    if (commentType) match.commentType = commentType;
    if (conversationType) match.conversationType = conversationType;
    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          let: { uid: "$createdBy" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$uid"] } } },
            {
              $project: {
                password: 0,
                devices: 0,
                refreshTokens: 0,
                overridePermissions: 0,
                __v: 0,
              },
            },
          ],
          as: "createdBy",
        },
      },
      { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "roles",
          let: { roleId: "$createdBy.role" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$roleId"] } } },
            { $project: { name: 1, slug: 1 } },
          ],
          as: "createdBy.role",
        },
      },
      { $unwind: { path: "$createdBy.role", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "createdBy.parentUser",
          foreignField: "_id",
          pipeline: [{ $project: { fullName: 1, email: 1, role: 1 } }],
          as: "createdBy.parentUser",
        },
      },
      { $unwind: { path: "$createdBy.parentUser", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "roles",
          localField: "createdBy.parentUser.role",
          foreignField: "_id",
          pipeline: [{ $project: { name: 1 } }],
          as: "parentUserRole",
        },
      },
      {
        $addFields: {
          "createdBy.parentUser.role": { $arrayElemAt: ["$parentUserRole", 0] },
        },
      },
      { $project: { parentUserRole: 0 } },
      {
        $project: {
          _id: 1,
          leadId: 1,
          comment: 1,
          commentType: 1,
          conversationType: 1,
          stage: 1,
          reminderAt: 1,
          createdAt: 1,
          updatedAt: 1,
          createdBy: {
            _id: "$createdBy._id",
            fullName: "$createdBy.fullName",
            email: "$createdBy.email",
            role: { name: "$createdBy.role.name" },
            parentUser: {
              fullName: "$createdBy.parentUser.fullName",
              email: "$createdBy.parentUser.email",
              role: { name: "$createdBy.parentUser.role.name" },
            },
            ancestorIds: "$createdBy.ancestorIds",
          },
        },
      },
    ];
    const [comments, total] = await Promise.all([
      LeadComment.aggregate(pipeline).allowDiskUse(true),
      LeadComment.countDocuments(match),
    ]);
    const response = {
      items: comments.map((c) => deepTransform(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    await cacheSet(cacheKey, response, LIST_CACHE_TTL);
    return response;
  }
}