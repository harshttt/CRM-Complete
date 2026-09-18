
import {ApiResponse} from "../../utils/apiResponse.js";
import { PermissionService } from "../permission/permission.service.js";
import logger from "../../utils/logger.js";
import MetaRawData from "../facebook/metaRawData.model.js";
import Lead from "./lead.model.js";
import { AppError } from "../../utils/appError.js";
import { LeadService } from "./lead.service.js";
import { LEAD_ENUMS } from "../../constants/lead.constants.js";
import { checkDuplicate } from "../../utils/facebookNormalizer.js";


export class LeadController {


  static async getLeadConstants(req, res) {
    return res.json(ApiResponse.success(LEAD_ENUMS, "Lead constants fetched successfully"));
  }

  static async create(req, res, next) {
    try {
      const lead = await LeadService.saveLead({
        payload: req.body,
        userId: req.user._id,
      });

      return res.json(ApiResponse.success(lead, "Lead created"));
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const lead = await LeadService.saveLead({
        id: req.params.id,
        payload: req.body,
        userId: req.user._id,
      });

      return res.json(ApiResponse.success(lead, "Lead updated"));
    } catch (err) {
      next(err);
    }
  }

static async list(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder || "desc";
    const skip = (page - 1) * limit;

    const {
      q,
      stage,
      assignedTo,
      owner,
      everAssignedTo,
      commentedBy,
      branch,
      source,
      commentedDateFrom,
      commentedDateTo,
      createdDateFrom,
      createdDateTo,
      tags,
      assignedFirst,
      category,
      status,
      hasDuplicates
    } = req.query;

    const filterOptions = {
      q,
      stage,
      assignedTo,
      owner,
      everAssignedTo,
      commentedBy,
      branch,
      source,
      commentedDateFrom,
      commentedDateTo,
      createdDateFrom,
      createdDateTo,
      tags,
      assignedFirst,
      category,
      status,
      hasDuplicates
    };

    const result = await LeadService.listLeads({
      page,
      limit,
      skip,
      filters: filterOptions,
      requester: req.user,
      sortBy,
      sortOrder
    });

    const paginatedResponse =
      ApiResponse.paginated(result, "Leads fetched successfully");
    return res.status(200).json(paginatedResponse);

  } catch (err) {
    next(err);
  }
}

static async getAssignmentHistory(req, res, next) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await LeadService.getAssignmentHistory(id, {
      page: Number(page),
      limit: Number(limit),
    });

    return res.json(ApiResponse.success(result));
  } catch (err) {
    next(err);
  }
}

static async getStageHistory(req, res, next) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await LeadService.getStageHistory(id, {
      page: Number(page),
      limit: Number(limit),
    });

    return res.json(ApiResponse.success(result));
  } catch (err) {
    next(err);
  }
}
  static async summary(req, res, next) {
  try {
    const {
      q,
      stage,
      assignedTo,
      owner,
      everAssignedTo,
      branch,
      source,
      createdDateFrom,
      createdDateTo,
      tags,
      category,
      status,
      hasDuplicates,
    } = req.query;

    const filterOptions = {
      q,
      stage,
      assignedTo,
      owner,
      everAssignedTo,
      branch,
      source,
      createdDateFrom,
      createdDateTo,
      tags,
      category,
      status,
      hasDuplicates,
    };

    const result = await LeadService.getSummary({
      filters: filterOptions,
      requester: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "Lead summary fetched successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const lead = await LeadService.getLeadById(id, req.user);
      if (!lead) throw AppError.notFound("Lead not found");
      return res.json(ApiResponse.success(lead));
    } catch (err) {
      next(err);
    }
  }

  static async getAllMetaLeads(req, res, next) {
    try {
      const leads = await LeadService.getAllMetaLeads();
      return res.json(ApiResponse.success(leads, "Leads fetched successfully"));
    } catch (err) {
      next(err);
    }
  }

  static async bulkStageChange(req, res, next) {
    try {
      const { leadIds, stage } = req.body;
      if (!leadIds || !Array.isArray(leadIds))
        throw AppError.badRequest("leadIds must be array");
      if (!stage) throw AppError.badRequest("stage is required");
      const result = await LeadService.bulkStageChange(leadIds,stage,req.user._id);
      return res.json(ApiResponse.success(result, "Bulk stage change completed"));
    } catch (err) {
      next(err);
    }
  }

  static async assign(req, res, next) {
    try {
      const { id } = req.params;
      const { assignedTo, reason } = req.body;
      const updated = await LeadService.assignLead(
        id,
        assignedTo,
        req.user._id,
        reason || null
      );
      return res.json(ApiResponse.success(updated, "Lead assigned"));
    } catch (err) {
      next(err);
    }
  }

  static async addComment(req, res, next) {
    try {
      const { id } = req.params;
      const {comment, conversationType, reminderAt, commentType, stage} = req.body;

      const result = await LeadService.addComment({
        leadId: id,
        userId: req.user._id,
        comment,
        conversationType,
        commentType,
        reminderAt,
        stage
      });

      // if (result.autoRemoved) {
      //   return res.json(
      //     ApiResponse.success(
      //       null,
      //       "Comment added. Lead marked as Not Interested and auto-removed."
      //     )
      //   );
      // }

      // const updatedLead = await LeadService.getLeadById(id, req.user);

      return res.json(ApiResponse.success(result, "Comment added & lead refreshed"));
    } catch (err) {
      next(err);
    }
  }

  static async updateComment(req, res, next) {
    try {
      const { id } = req.params;
      const {
        comment,
        conversationType,
        commentType,
        reminderAt,
        stage,
      } = req.body;

      const updated = await LeadService.updateComment(id, req.user._id, {
        comment,
        conversationType,
        commentType,
        reminderAt,
        stage,
      });

      return res.json(
        ApiResponse.success(updated, "Comment updated successfully")
      );
    } catch (err) {
      next(err);
    }
  }

  static async listComments(req, res, next) {
    try {
      const { leadId } = req.params;
      const { page = 1, limit = 20, commentType, conversationType } = req.query;

      const result = await LeadService.listComments({
        leadId,
        page: Number(page),
        limit: Number(limit),
        commentType,
        conversationType,
      });

      const response = ApiResponse.paginated(
        result,
        "Comments fetched successfully"
      );

      return res.status(200).json(response);

      // return res.json(
      //   ApiResponse.success(result, "Comments fetched successfully")
      // );
    } catch (err) {
      next(err);
    }
  }

  static async updateStage(req, res, next) {
    try {
      console.log("Updating stage", req.body);
      const { id } = req.params;
      const { stage } = req.body;
      if (!stage) throw AppError.badRequest("stage is required");
      const updated = await LeadService.updateStage(id, stage, req.user._id);
      return res.json(ApiResponse.success(updated, "Stage updated"));
    } catch (err) {
      next(err);
    }
  }

  static async softDelete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await LeadService.softDeleteLead(id, req.user._id);
      return res.json(ApiResponse.success(deleted, "Lead deleted (soft)"));
    } catch (err) {
      next(err);
    }
  }

  static async bulkAssign(req, res, next) {
    try {
      const { leadIds, assignedTo, reason } = req.body;
      if (!Array.isArray(leadIds) || !assignedTo)
        throw AppError.badRequest("leadIds (array) and assignedTo required");
      const result = await LeadService.bulkAssign(
        leadIds,
        assignedTo,
        req.user._id,
        reason || null
      );
      return res.json(ApiResponse.success(result, "Bulk assign done"));
    } catch (err) {
      next(err);
    }
  }


  static async exportLeads(req, res, next) {
  try {

    const buffer = await LeadService.exportLeads({
      filters: req.query,
      requester: req.user,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="leads_export_${Date.now()}.xlsx"`
    );

    return res.json(ApiResponse.success(buffer, "Lead export fetched successfully"));


    // return res.send(buffer);
  } catch (err) {
    next(err);
  }
  }


  static async bulkImport(req, res, next) {
    try {
      if (!req.file) throw AppError.badRequest("CSV file is required");

      const result = await LeadService.bulkImport(
        req.file.buffer,
        req.file.originalname,
        req.user._id
      );

      return res.json(ApiResponse.success(result, "Bulk import completed successfully"));
    } catch (err) {
      next(err);
    }
  }

  static async lockLead(req, res, next) {
    try {
      const { id } = req.params;
      const { lockDurationMinutes = 10 } = req.body;
      const lock = await LeadService.lockLead(
        id,
        req.user._id,
        lockDurationMinutes
      );
      return res.json(ApiResponse.success(lock, "Lead locked"));
    } catch (err) {
      next(err);
    }
  }

  static async unlockLead(req, res, next) {
    try {
      const { id } = req.params;
      const unlock = await LeadService.unlockLead(id, req.user._id);
      return res.json(ApiResponse.success(unlock, "Lead unlocked"));
    } catch (err) {
      next(err);
    }
  }

  static async restoreRemovedLead(req, res, next) {
    try {
      // if (!["Admin", "Super Admin"].includes(req.user.role.name))
      //   throw AppError.forbidden("Access denied");

       const roleLevel = req.user.role?.roleLevel;
      if (roleLevel !== 1 && roleLevel !== 2) throw AppError.forbidden("Access denied");
      
      const { id } = req.params;
      const lead = await LeadService.restoreLead(id, req.user._id);
      return res.json(ApiResponse.success(lead, "Lead restored"));
    } catch (err) {
      next(err);
    }
  }


  static async ingest(req, res, next) {
  try {
    const secret = req.headers["x-webhook-secret"];
    if (secret !== process.env.CRM_WEBHOOK_SECRET) {
      throw createError(401, "Invalid webhook secret");
    }

    const payload = req.body;

    console.log("Received webhook with payload:", payload);

    logger.info("Received lead ingestion webhook", {
      payload,
    });

    await MetaRawData.create({
     source: "nexthikes",
     data: payload,
    });

      const dup = await checkDuplicate({
      phone: payload.phone,
      email: payload.email,
    });

    logger.info("Received lead ingestion webhook", {
      payload,
    });

    logger.info("Webhook received", {
    headers: {
    "content-type": req.headers["content-type"],
    "user-agent": req.headers["user-agent"],
  },
  payload: req.body,
     });


    const lead = await Lead.create({
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email,
      address: payload.address || null,
      projectName: payload.serviceType || null,
      source: LEAD_ENUMS.SOURCE.NEXTHIKES,
      ownerType: "system",
      stage: LEAD_ENUMS.STAGE.FRESH,


      isDuplicate: !!dup,
      duplicateOf: dup?.rootLead?._id || null,
      duplicateReason: dup?.reason || null,
      hasDuplicates: false,
      duplicateCount: 0,
      status: dup ? "duplicate" : "active",

      message: `Service=${payload.service} | Budget=${payload.projectBudget} | City=${payload.city} | Source=${payload.source} | Page=${payload.pageSlug} | Msg=${payload.message} | Referrer=${payload.referrer}`,
      lastActivityAt: new Date(),
    });

     if (dup?.rootLead?._id) {

      await Lead.updateOne(
        { _id: dup.rootLead._id },
        {
          $inc: { duplicateCount: 1 },
          $set: { hasDuplicates: true },
          $addToSet: { duplicates: lead._id },
        }
      );

      logger.info(
        {
          rootId: dup.rootLead._id,
          duplicateId: lead._id,
        },
        "[WEBHOOK] Root updated with duplicate"
      );
    }

      logger.info("Lead created via webhook", {
        leadId: lead._id,
        isDuplicate: !!dup,
        duplicateOf: dup?.rootLead?._id || null,
        duplicateReason: dup?.reason || null,
        leadData: lead.toObject(),
      });


      return res.json({
      success: true,
      leadId: lead._id,
      duplicate: !!dup,
    });
    
  } catch (err) {
    next(err);
  }
  }


  static async getDuplicateLeads(req, res, next) {
  try {
    const result = await LeadService.getDuplicateLeads(
      req.params.id,
      req.query
    );

    return res.json(
  ApiResponse.success(result, "Duplicate leads fetched")
);


    // return res.json(ApiResponse.paginated(result, "Duplicate leads fetched"));
  } catch (err) {
    next(err);
  }
  }

}
