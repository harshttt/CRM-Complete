import FollowUp from "./followUp.model.js";
import { AppError } from "../../utils/appError.js";
import { deepTransform } from "../../utils/transform.js";
import mongoose from "mongoose";

export class FollowUpService {
  static _transform(doc) {
    return deepTransform(doc);
  }

  // ============ CREATE ============
  static async create(payload, user) {
    // Rule 8: Due date cannot be in the past
    const dueDate = new Date(payload.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      throw AppError.badRequest("Follow-up due date cannot be in the past");
    }

    const followUp = await FollowUp.create({
      meetingId: payload.meetingId,
      customerId: payload.customerId,
      title: payload.title,
      description: payload.description || "",
      ownerId: payload.ownerId,
      dueDate,
      status: "PENDING",
      createdBy: user._id,
      updatedBy: user._id,
    });

    return FollowUpService._transform(followUp.toObject());
  }

  // ============ UPDATE ============
  static async update(id, payload, user) {
    const followUp = await FollowUp.findById(id);
    if (!followUp) throw AppError.notFound("Follow-up not found");

    // Ownership check for employees
    const roleLevel = user.role?.roleLevel ?? 99;
    if (roleLevel > 3 && followUp.ownerId.toString() !== user._id.toString()) {
      throw AppError.forbidden("You can only update your own follow-ups");
    }

    if (payload.dueDate) {
      const dueDate = new Date(payload.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        throw AppError.badRequest("Follow-up due date cannot be in the past");
      }
      followUp.dueDate = dueDate;
    }

    if (payload.title !== undefined) followUp.title = payload.title;
    if (payload.description !== undefined) followUp.description = payload.description;
    if (payload.status !== undefined) followUp.status = payload.status;
    followUp.updatedBy = user._id;

    await followUp.save();
    return FollowUpService._transform(followUp.toObject());
  }

  // ============ COMPLETE ============
  static async complete(id, user) {
    const followUp = await FollowUp.findById(id);
    if (!followUp) throw AppError.notFound("Follow-up not found");

    const roleLevel = user.role?.roleLevel ?? 99;
    if (roleLevel > 3 && followUp.ownerId.toString() !== user._id.toString()) {
      throw AppError.forbidden("You can only complete your own follow-ups");
    }

    if (followUp.status === "COMPLETED") {
      throw AppError.badRequest("Follow-up is already completed");
    }
    if (followUp.status === "CANCELLED") {
      throw AppError.badRequest("Cannot complete a cancelled follow-up");
    }

    followUp.status = "COMPLETED";
    followUp.updatedBy = user._id;
    await followUp.save();

    return FollowUpService._transform(followUp.toObject());
  }

  // ============ GET BY ID ============
  static async getById(id, user) {
    const followUp = await FollowUp.findById(id)
      .populate("meetingId", "purpose scheduledStart scheduledEnd status")
      .populate("customerId", "name companyName")
      .populate("ownerId", "fullName email")
      .lean();

    if (!followUp) throw AppError.notFound("Follow-up not found");

    const roleLevel = user.role?.roleLevel ?? 99;
    if (roleLevel > 3 && followUp.ownerId?._id?.toString() !== user._id.toString()) {
      throw AppError.forbidden("You can only access your own follow-ups");
    }

    return FollowUpService._transform(followUp);
  }

  // ============ LIST ============
  static async list({ page = 1, limit = 20, status, user }) {
    const roleLevel = user.role?.roleLevel ?? 99;
    let filter = { isDeleted: false };

    if (roleLevel <= 2) {
      // Admin: all
    } else if (roleLevel === 3) {
      const User = mongoose.model("User");
      const teamUserIds = await User.find({
        ancestorIds: user._id,
        isDeleted: false,
      }).distinct("_id");
      filter.ownerId = { $in: [user._id, ...teamUserIds] };
    } else {
      filter.ownerId = user._id;
    }

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      FollowUp.find(filter)
        .populate("meetingId", "purpose scheduledStart status")
        .populate("customerId", "name companyName")
        .populate("ownerId", "fullName email")
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FollowUp.countDocuments(filter),
    ]);

    return {
      data: rows.map((r) => FollowUpService._transform(r)),
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  }

  // ============ SOFT DELETE ============
  static async remove(id, user) {
    const followUp = await FollowUp.findById(id);
    if (!followUp) throw AppError.notFound("Follow-up not found");

    const roleLevel = user.role?.roleLevel ?? 99;
    if (roleLevel > 3 && followUp.ownerId.toString() !== user._id.toString()) {
      throw AppError.forbidden("You can only delete your own follow-ups");
    }

    followUp.updatedBy = user._id;
    await followUp.softDelete();
    return { id };
  }
}
