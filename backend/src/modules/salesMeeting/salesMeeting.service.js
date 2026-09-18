import SalesMeeting from "./salesMeeting.model.js";
import FollowUp from "../followUp/followUp.model.js";
import { AppError } from "../../utils/appError.js";
import { deepTransform } from "../../utils/transform.js";
import mongoose from "mongoose";

// ============ Constants ============
const VALID_OUTCOMES = [
  "INTERESTED",
  "FOLLOW_UP_REQUIRED",
  "PROPOSAL_REQUESTED",
  "NOT_INTERESTED",
  "UNABLE_TO_MEET",
];

export const CHECK_IN_WINDOW_MINUTES = 15;

export function getEarliestCheckInTime(scheduledStart) {
  return new Date(
    new Date(scheduledStart).getTime() - CHECK_IN_WINDOW_MINUTES * 60 * 1000
  );
}

export function assertCheckInWindow(now, scheduledStart) {
  const earliestCheckIn = getEarliestCheckInTime(scheduledStart);

  if (now < earliestCheckIn) {
    throw AppError.badRequest(
      `Check-in not allowed yet. Earliest check-in time is ${earliestCheckIn.toISOString()}`
    );
  }
}

// ============ Valid Status Transitions ============
const VALID_TRANSITIONS = {
  SCHEDULED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CHECKED_IN", "CANCELLED"],
  CHECKED_IN: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: ["REOPENED"],
  REOPENED: ["CHECKED_IN"],
};

// ============ Helpers ============
function assertTransition(currentStatus, targetStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw AppError.badRequest(
      `Invalid status transition: ${currentStatus} → ${targetStatus}`
    );
  }
}

function assertActiveUser(user) {
  if (!user.active) {
    throw AppError.forbidden("Inactive users cannot perform meeting actions");
  }
}

function getRoleLevel(user) {
  return user.role?.roleLevel ?? 99;
}

function isAdmin(user) {
  return getRoleLevel(user) <= 2;
}

function isManager(user) {
  return getRoleLevel(user) === 3;
}

function isEmployee(user) {
  return getRoleLevel(user) >= 4;
}

/**
 * Validate that the caller can assign a meeting to the given employee.
 * - Employee (roleLevel >= 4): can only assign to themselves.
 * - Manager (roleLevel 3): can assign to themselves or their team members.
 * - Admin (roleLevel <= 2): can assign to any active user.
 */
async function assertCanAssignTo(user, assignedEmployeeId) {
  const userId = user._id.toString();
  const targetId = assignedEmployeeId.toString();

  // Admin: can assign to anyone
  if (isAdmin(user)) return;

  // Manager: self or team members
  if (isManager(user)) {
    if (targetId === userId) return;

    const User = mongoose.model("User");
    const isTeamMember = await User.exists({
      _id: targetId,
      ancestorIds: user._id,
      isDeleted: false,
      active: true,
    });
    if (!isTeamMember) {
      throw AppError.forbidden(
        "You can only assign meetings to employees in your team"
      );
    }
    return;
  }

  // Employee: self only
  if (targetId !== userId) {
    throw AppError.forbidden(
      "Sales employees can only assign meetings to themselves"
    );
  }
}

/**
 * Assert that the user can perform actions on this meeting.
 * Admin: always allowed.
 * Manager: allowed if meeting is assigned to themselves or their team member.
 * Employee: only if they are the assigned employee.
 */
async function assertCanAccessMeeting(meeting, user) {
  const employeeId =
    meeting.assignedEmployeeId?._id?.toString() ||
    meeting.assignedEmployeeId?.toString();
  const userId = user._id.toString();

  if (isAdmin(user)) return;

  if (isManager(user)) {
    if (employeeId === userId) return;
    const User = mongoose.model("User");
    const isTeamMember = await User.exists({
      _id: employeeId,
      ancestorIds: user._id,
      isDeleted: false,
    });
    if (!isTeamMember) {
      throw AppError.forbidden("You can only access your team's meetings");
    }
    return;
  }

  // Employee: must be assigned
  if (employeeId !== userId) {
    throw AppError.forbidden("You can only access your own meetings");
  }
}

/**
 * Assert that the user is the assigned employee (for check-in/out/start actions).
 */
function assertIsAssignedEmployee(meeting, user) {
  const employeeId = meeting.assignedEmployeeId.toString();
  const userId = user._id.toString();
  if (employeeId !== userId) {
    throw AppError.forbidden(
      "Only the assigned employee can perform this action"
    );
  }
}

export class SalesMeetingService {
  static _transform(doc) {
    return deepTransform(doc);
  }

  // ============ BUILD VISIBILITY FILTER ============
  static async _buildVisibilityFilter(user) {
    const roleLevel = getRoleLevel(user);

    // Admin: see all
    if (roleLevel <= 2) return {};

    // Manager: own + team
    if (roleLevel === 3) {
      const User = mongoose.model("User");
      const teamUserIds = await User.find({
        ancestorIds: user._id,
        isDeleted: false,
      }).distinct("_id");
      return { assignedEmployeeId: { $in: [user._id, ...teamUserIds] } };
    }

    // Employee: own only
    return { assignedEmployeeId: user._id };
  }

  // ============ CREATE ============
  static async create(payload, user) {
    assertActiveUser(user);

    const {
      customerId,
      purpose,
      scheduledStart,
      scheduledEnd,
      location,
      assignedEmployeeId,
      notes,
    } = payload;

    // Determine the actual assigned employee
    let finalAssignedId = assignedEmployeeId;

    // If employee role, force self-assignment regardless of what was sent
    if (isEmployee(user)) {
      finalAssignedId = user._id;
    }

    // Validate assignment permissions
    await assertCanAssignTo(user, finalAssignedId);

    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);

    // Rule: End must be after start
    if (end <= start) {
      throw AppError.badRequest("End time must be after start time");
    }

    // Rule: No overlapping meetings for same employee
    const overlap = await SalesMeeting.findOne({
      assignedEmployeeId: finalAssignedId,
      status: { $nin: ["CANCELLED"] },
      isDeleted: false,
      $or: [
        { scheduledStart: { $lt: end }, scheduledEnd: { $gt: start } },
      ],
    });
    if (overlap) {
      throw AppError.conflict(
        "Employee already has a meeting scheduled during this time"
      );
    }

    const meeting = await SalesMeeting.create({
      customerId,
      purpose,
      scheduledStart: start,
      scheduledEnd: end,
      location: location || "",
      assignedEmployeeId: finalAssignedId,
      notes: notes || "",
      status: "SCHEDULED",
      attendanceSessions: [],
      createdBy: user._id,
      updatedBy: user._id,
    });

    return SalesMeetingService._transform(meeting.toObject());
  }

  // ============ UPDATE ============
  static async update(id, payload, user) {
    assertActiveUser(user);

    const meeting = await SalesMeeting.findById(id);
    if (!meeting) throw AppError.notFound("Meeting not found");

    await assertCanAccessMeeting(meeting, user);

    if (meeting.status !== "SCHEDULED") {
      throw AppError.badRequest("Only SCHEDULED meetings can be edited");
    }

    // If assignedEmployeeId is being changed, validate permission
    if (
      payload.assignedEmployeeId &&
      payload.assignedEmployeeId.toString() !==
        meeting.assignedEmployeeId.toString()
    ) {
      await assertCanAssignTo(user, payload.assignedEmployeeId);
    }

    const start = payload.scheduledStart
      ? new Date(payload.scheduledStart)
      : meeting.scheduledStart;
    const end = payload.scheduledEnd
      ? new Date(payload.scheduledEnd)
      : meeting.scheduledEnd;

    if (end <= start) {
      throw AppError.badRequest("End time must be after start time");
    }

    // Check overlap if times or employee changed
    if (
      payload.scheduledStart ||
      payload.scheduledEnd ||
      payload.assignedEmployeeId
    ) {
      const checkEmployeeId =
        payload.assignedEmployeeId || meeting.assignedEmployeeId;
      const overlap = await SalesMeeting.findOne({
        _id: { $ne: meeting._id },
        assignedEmployeeId: checkEmployeeId,
        status: { $nin: ["CANCELLED"] },
        isDeleted: false,
        $or: [
          { scheduledStart: { $lt: end }, scheduledEnd: { $gt: start } },
        ],
      });
      if (overlap) {
        throw AppError.conflict(
          "Employee already has a meeting scheduled during this time"
        );
      }
    }

    if (payload.purpose !== undefined) meeting.purpose = payload.purpose;
    if (payload.scheduledStart) meeting.scheduledStart = start;
    if (payload.scheduledEnd) meeting.scheduledEnd = end;
    if (payload.location !== undefined) meeting.location = payload.location;
    if (payload.notes !== undefined) meeting.notes = payload.notes;
    if (payload.customerId) meeting.customerId = payload.customerId;
    if (payload.assignedEmployeeId)
      meeting.assignedEmployeeId = payload.assignedEmployeeId;
    meeting.updatedBy = user._id;

    await meeting.save();
    return SalesMeetingService._transform(meeting.toObject());
  }

  // ============ CONFIRM ============
  static async confirm(id, user) {
    assertActiveUser(user);

    const meeting = await SalesMeeting.findById(id);
    if (!meeting) throw AppError.notFound("Meeting not found");

    await assertCanAccessMeeting(meeting, user);
    assertTransition(meeting.status, "CONFIRMED");

    meeting.status = "CONFIRMED";
    meeting.updatedBy = user._id;
    await meeting.save();

    return SalesMeetingService._transform(meeting.toObject());
  }

  // ============ CHECK-IN ============
  static async checkIn(id, payload, user) {
    assertActiveUser(user);

    const meeting = await SalesMeeting.findById(id);
    if (!meeting) throw AppError.notFound("Meeting not found");

    // Only the assigned employee can check in
    assertIsAssignedEmployee(meeting, user);

    // Valid transitions: CONFIRMED → CHECKED_IN, REOPENED → CHECKED_IN
    if (meeting.status !== "CONFIRMED" && meeting.status !== "REOPENED") {
      throw AppError.badRequest(
        `Cannot check in from status ${meeting.status}. Meeting must be CONFIRMED or REOPENED.`
      );
    }

    const now = new Date();
    assertCheckInWindow(now, meeting.scheduledStart);

    // Push new attendance session (server timestamp)
    meeting.attendanceSessions.push({
      checkInAt: now,
      checkOutAt: null,
      checkInLocation: {
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
      checkOutLocation: { latitude: null, longitude: null },
    });

    meeting.status = "CHECKED_IN";
    meeting.updatedBy = user._id;
    await meeting.save();

    return SalesMeetingService._transform(meeting.toObject());
  }

  // ============ START ============
  static async start(id, user) {
    assertActiveUser(user);

    const meeting = await SalesMeeting.findById(id);
    if (!meeting) throw AppError.notFound("Meeting not found");

    // Only assigned employee can start
    assertIsAssignedEmployee(meeting, user);
    assertTransition(meeting.status, "IN_PROGRESS");

    meeting.status = "IN_PROGRESS";
    meeting.updatedBy = user._id;
    await meeting.save();

    return SalesMeetingService._transform(meeting.toObject());
  }

  // ============ CHECK-OUT ============
  static async checkOut(id, payload, user) {
    assertActiveUser(user);

    const meeting = await SalesMeeting.findById(id);
    if (!meeting) throw AppError.notFound("Meeting not found");

    // Only assigned employee can check out
    assertIsAssignedEmployee(meeting, user);

    // Must have an open attendance session
    const openSession = meeting.attendanceSessions.find(
      (s) => s.checkInAt && !s.checkOutAt
    );
    if (!openSession) {
      throw AppError.badRequest(
        "No open attendance session found. You must check in before checking out."
      );
    }

    // Server timestamp for check-out
    const now = new Date();
    openSession.checkOutAt = now;
    openSession.checkOutLocation = {
      latitude: payload.latitude,
      longitude: payload.longitude,
    };

    meeting.updatedBy = user._id;
    meeting.markModified("attendanceSessions");
    await meeting.save();

    return SalesMeetingService._transform(meeting.toObject());
  }

  // ============ COMPLETE ============
  static async complete(id, payload, user) {
    assertActiveUser(user);

    const meeting = await SalesMeeting.findById(id);
    if (!meeting) throw AppError.notFound("Meeting not found");

    // Only assigned employee or admin can complete
    if (!isAdmin(user)) {
      assertIsAssignedEmployee(meeting, user);
    }
    assertTransition(meeting.status, "COMPLETED");

    // Outcome required and must be a valid value
    if (!payload.outcome || !payload.outcome.trim()) {
      throw AppError.badRequest("Outcome is required to complete a meeting");
    }

    const outcome = payload.outcome.trim().toUpperCase();
    if (!VALID_OUTCOMES.includes(outcome)) {
      throw AppError.badRequest(
        `Invalid outcome. Must be one of: ${VALID_OUTCOMES.join(", ")}`
      );
    }

    // If outcome is FOLLOW_UP_REQUIRED, follow-up is mandatory
    if (outcome === "FOLLOW_UP_REQUIRED") {
      if (!payload.followUp) {
        throw AppError.badRequest(
          "Follow-up details are required when outcome is FOLLOW_UP_REQUIRED"
        );
      }
      if (!payload.followUp.title || !payload.followUp.title.trim()) {
        throw AppError.badRequest("Follow-up action/title is required");
      }
      if (!payload.followUp.dueDate) {
        throw AppError.badRequest("Follow-up due date is required");
      }

      // Follow-up due date cannot be in the past
      const dueDate = new Date(payload.followUp.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        throw AppError.badRequest("Follow-up due date cannot be in the past");
      }
    }

    meeting.outcome = outcome;
    meeting.status = "COMPLETED";
    meeting.updatedBy = user._id;

    // Close any open attendance session
    const openSession = meeting.attendanceSessions.find(
      (s) => s.checkInAt && !s.checkOutAt
    );
    if (openSession) {
      openSession.checkOutAt = new Date();
      openSession.checkOutLocation = { latitude: null, longitude: null };
      meeting.markModified("attendanceSessions");
    }

    await meeting.save();

    // Create follow-up if required
    if (outcome === "FOLLOW_UP_REQUIRED") {
      const followUpOwnerId =
        payload.followUp.ownerId || meeting.assignedEmployeeId;

      await FollowUp.create({
        meetingId: meeting._id,
        customerId: meeting.customerId,
        title: payload.followUp.title.trim(),
        description: payload.followUp.description || "",
        ownerId: followUpOwnerId,
        dueDate: new Date(payload.followUp.dueDate),
        status: "PENDING",
        createdBy: user._id,
        updatedBy: user._id,
      });
    }

    return SalesMeetingService._transform(meeting.toObject());
  }

  // ============ CANCEL ============
  static async cancel(id, payload, user) {
    assertActiveUser(user);

    const meeting = await SalesMeeting.findById(id);
    if (!meeting) throw AppError.notFound("Meeting not found");

    await assertCanAccessMeeting(meeting, user);

    // Can only cancel from SCHEDULED or CONFIRMED
    if (meeting.status !== "SCHEDULED" && meeting.status !== "CONFIRMED") {
      throw AppError.badRequest(
        `Cannot cancel a meeting with status ${meeting.status}. Only SCHEDULED or CONFIRMED meetings can be cancelled.`
      );
    }

    meeting.status = "CANCELLED";
    meeting.cancelReason = payload?.reason || "";
    meeting.updatedBy = user._id;
    await meeting.save();

    return SalesMeetingService._transform(meeting.toObject());
  }

  // ============ REOPEN ============
  static async reopen(id, user) {
    assertActiveUser(user);

    // Only Manager or Admin can reopen
    if (isEmployee(user)) {
      throw AppError.forbidden("Only Manager or Admin can reopen meetings");
    }

    const meeting = await SalesMeeting.findById(id);
    if (!meeting) throw AppError.notFound("Meeting not found");

    await assertCanAccessMeeting(meeting, user);
    assertTransition(meeting.status, "REOPENED");

    meeting.status = "REOPENED";
    meeting.outcome = null;
    meeting.updatedBy = user._id;
    await meeting.save();

    return SalesMeetingService._transform(meeting.toObject());
  }

  // ============ LIST ============
  static async list({ page = 1, limit = 20, status, search, user }) {
    const roleLevel = getRoleLevel(user);
    let filter = { isDeleted: false };

    // Visibility
    if (roleLevel <= 2) {
      // Admin: all
    } else if (roleLevel === 3) {
      // Manager: own + descendants
      const User = mongoose.model("User");
      const teamUserIds = await User.find({
        ancestorIds: user._id,
        isDeleted: false,
      }).distinct("_id");
      filter.assignedEmployeeId = { $in: [user._id, ...teamUserIds] };
    } else {
      // Employee: own only
      filter.assignedEmployeeId = user._id;
    }

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      SalesMeeting.find(filter)
        .populate("customerId", "name companyName")
        .populate("assignedEmployeeId", "fullName email")
        .sort({ scheduledStart: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SalesMeeting.countDocuments(filter),
    ]);

    const data = rows.map((m) => SalesMeetingService._transform(m));

    return {
      data,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    };
  }

  // ============ GET BY ID ============
  static async getById(id, user) {
    const meeting = await SalesMeeting.findById(id)
      .populate("customerId")
      .populate("assignedEmployeeId", "fullName email phone")
      .populate("createdBy", "fullName email")
      .lean();

    if (!meeting) throw AppError.notFound("Meeting not found");

    await assertCanAccessMeeting(meeting, user);

    // Attach follow-ups
    const followUps = await FollowUp.find({
      meetingId: meeting._id,
      isDeleted: false,
    })
      .populate("ownerId", "fullName email")
      .lean();

    const result = SalesMeetingService._transform(meeting);
    result.followUps = followUps.map((f) =>
      SalesMeetingService._transform(f)
    );

    return result;
  }

  // ============ ASSIGNABLE EMPLOYEES ============
  static async getAssignableEmployees(user, { page = 1, limit = 50, q = "" }) {
    const User = mongoose.model("User");
    const roleLevel = getRoleLevel(user);

    let filter = { isDeleted: false, active: true };

    if (roleLevel <= 2) {
      // Admin: all active users (employees + managers)
    } else if (roleLevel === 3) {
      // Manager: self + team members
      filter.$or = [
        { _id: user._id },
        { ancestorIds: user._id },
      ];
    } else {
      // Employee: only self
      filter._id = user._id;
    }

    if (q) {
      filter.fullName = { $regex: q, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      User.find(filter)
        .populate("role", "name roleLevel")
        .select("fullName email phone role")
        .sort({ fullName: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const data = rows.map((u) => deepTransform(u));

    return {
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  }

  // ============ STATS (for dashboard) ============
  static async getStats(user) {
    const roleLevel = getRoleLevel(user);
    let matchFilter = { isDeleted: false };

    if (roleLevel <= 2) {
      // Admin: all
    } else if (roleLevel === 3) {
      const User = mongoose.model("User");
      const teamUserIds = await User.find({
        ancestorIds: user._id,
        isDeleted: false,
      }).distinct("_id");
      matchFilter.assignedEmployeeId = {
        $in: [user._id, ...teamUserIds],
      };
    } else {
      matchFilter.assignedEmployeeId = user._id;
    }

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const activeMeetingFilter = {
      ...matchFilter,
      status: { $ne: "CANCELLED" },
    };

    const [todayMeetings, completedThisWeek, totalMeetings] =
      await Promise.all([
        SalesMeeting.countDocuments({
          ...activeMeetingFilter,
          scheduledStart: { $gte: startOfDay, $lt: endOfDay },
        }),
        SalesMeeting.countDocuments({
          ...matchFilter,
          status: "COMPLETED",
          updatedAt: { $gte: startOfWeek },
        }),
        SalesMeeting.countDocuments(activeMeetingFilter),
      ]);

    // Follow-up stats
    let followUpFilter = { isDeleted: false };
    if (roleLevel > 2) {
      followUpFilter.ownerId =
        roleLevel === 3
          ? {
              $in: [
                user._id,
                ...(await mongoose
                  .model("User")
                  .find({ ancestorIds: user._id, isDeleted: false })
                  .distinct("_id")),
              ],
            }
          : user._id;
    }

    const [pendingFollowUps, overdueFollowUps] = await Promise.all([
      FollowUp.countDocuments({ ...followUpFilter, status: "PENDING" }),
      FollowUp.countDocuments({
        ...followUpFilter,
        status: "PENDING",
        dueDate: { $lt: now },
      }),
    ]);

    return {
      todayMeetings,
      completedThisWeek,
      totalMeetings,
      pendingFollowUps,
      overdueFollowUps,
    };
  }
}
