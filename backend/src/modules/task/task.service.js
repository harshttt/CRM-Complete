import mongoose from "mongoose";
import createError from "http-errors";
import Activity from "../activity/activity.model.js";
import { LeadService } from "../lead/lead.service.js";
import { UserService } from "../user/user.service.js";
import Task from "./task.model.js";
import Lead from "../lead/lead.model.js";
import { deepTransform } from "../../utils/transform.js";
import { cacheDel, cacheScanDel } from "../../utils/cache.js";
import {notifyTaskCreated,notifyTaskUpdated,notifyTaskCompleted,} from "../notification/notification.helper.js";
import { buildTaskVisibilityFilter, canDeleteTask } from "./task.permission.js";
import { LeadAssignmentService } from "../lead/services/lead.assignment.service.js";

class TaskService {
  static logActivity(leadId, userId, type, description, metadata = {}) {
    return Activity.create({
      lead: leadId,
      user: userId,
      type,
      description,
      metadata,
    });
  }

  static _transform(doc) {
    return deepTransform(doc);
  }

  // CREATE TASK
  static async create(payload, requester) {
    // const { lead, assignedTo, title } = payload;

    const { lead, title } = payload;
    let { assignedTo } = payload;

    const role = requester.role?.roleLevel;
    const isSales = role === 4;

    if (isSales && !assignedTo) {
      assignedTo = requester._id;
    }

    if (isSales) {
      if (String(assignedTo) !== String(requester._id)) {
        throw createError(403, "Sales can only assign tasks to themselves");
      }
    } else {
      const canAssign = await LeadAssignmentService.canAssign(requester,assignedTo);
      if (!canAssign) {
        throw createError(403, "You cannot assign task to this user");
      }
    }


    const task = await Task.create({
      ...payload,
      assignedTo,
      createdBy: requester._id,
    });

    await notifyTaskCreated(task, requester);

    await this.logActivity(
      lead,
      requester._id,
      "task_created",
      `Task "${title}" created`,
      {
        taskId: task._id,
        assignedTo,
        dueDate: payload.dueDate,
        type: payload.type,
      }
    );

    await cacheScanDel("tasks:list");
    return TaskService._transform(task.toObject());
    // return task;
  }

  // UPDATE TASK
  static async update(taskId, payload, requester) {
    const task = await Task.findById(taskId);
    if (!task) throw createError(404, "Task not found");

    const role = requester.role?.roleLevel;

    if (
      ![1, 2].includes(role) &&
      String(task.createdBy) !== String(requester._id)
    ) {
      throw createError(403, "You cannot update this task");
    }


    //Track old assignee
    const oldAssignedTo = task.assignedTo?.toString();

    //Reassignment validation (TASK rules, not LEAD rules)
    if (payload.assignedTo && String(payload.assignedTo) !== oldAssignedTo) {
      const canAssign = await LeadAssignmentService.canAssign(
        requester,
        payload.assignedTo
      );

      if (!canAssign) {
        throw createError(403, "You cannot reassign this task");
      }
    }

    Object.assign(task, payload);
    task.updatedBy = requester._id;
    await task.save();
    await this.logActivity(
      task.lead,
      requester._id,
      "task_updated",
      `Task "${task.title}" updated`,
      {
        taskId: task._id,
        updatedFields: Object.keys(payload),
      }
    );

    await notifyTaskUpdated(task, requester);

    // Reassignment notification (ONLY when assignee changed)
    if (payload.assignedTo && String(payload.assignedTo) !== oldAssignedTo) {
      await notifyTaskCreated(task, requester);
    }

    await cacheDel(`task:${taskId}`);
    await cacheScanDel("tasks:list");
    return TaskService._transform(task.toObject());
    // return task;
  }

  // LIST TASKS (WITH VISIBILITY)
  static async list({ page = 1, limit = 20, filters = {}, requester }) {
    const skip = (page - 1) * limit;

    const taskVisibility = await buildTaskVisibilityFilter(requester);

    const match = {
      isDeleted: { $ne: true },
      ...taskVisibility,
    };

    if (filters.status) match.status = filters.status;
    if (filters.priority) match.priority = filters.priority;
    if (filters.type) match.type = filters.type;
    if (filters.assignedTo) match.assignedTo = filters.assignedTo;
    if (filters.lead) match.lead = filters.lead;


    const usePrioritySort = filters.sort === "priority_due";

    let items = [];

    if (usePrioritySort) {
      items = await Task.aggregate([
        { $match: match },
        {
          $addFields: {
            priorityOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ["$priority", "urgent"] }, then: 1 },
                  { case: { $eq: ["$priority", "high"] }, then: 2 },
                  { case: { $eq: ["$priority", "medium"] }, then: 3 },
                  { case: { $eq: ["$priority", "low"] }, then: 4 },
                ],
                default: 5,
              },
            },
          },
        },
        { $sort: { dueDate: 1, priorityOrder: 1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);

      items = await Task.populate(items, [
        { path: "lead", select: "fullName phone stage" },
        { path: "assignedTo", select: "fullName email role" },
        { path: "createdBy", select: "fullName email role" },
        { path: "updatedBy", select: "fullName email role" },
      ]);
    } else {
      items = await Task.find(match)
        .populate("lead", "fullName phone stage")
        .populate("assignedTo", "fullName email role")
        .populate("createdBy", "fullName email role")
        .populate("updatedBy", "fullName email role")
        .sort({ dueDate: 1, priorityOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    }

    const [total, completed, pending, reminderPending] = await Promise.all([
      Task.countDocuments(match),
      Task.countDocuments({ ...match, status: "completed" }),
      Task.countDocuments({ ...match, status: "pending" }),
      Task.countDocuments({
        ...match,
        reminderAt: { $lte: new Date() },
        reminderSent: false,
        status: { $in: ["pending", "in-progress"] },
      }),
    ]);

    return {
      items: items.map((i) => TaskService._transform(i)),
      page,
      limit,
      total,
      completed,
      pending,
      reminderPending,
    };
  }

  // SOFT DELETE
  static async softDelete(taskId, requester) {
    //ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw createError(400, "Invalid task id");
    }

    //Find only non-deleted task
    const task = await Task.findOne({
      _id: taskId,
      isDeleted: { $ne: true },
    });

    if (!task) {
      throw createError(404, "Task not found or already deleted");
    }

    if (!canDeleteTask(task, requester)) {
      throw createError(
        403,
        "You can only delete tasks created by you or your subordinates"
      );
    }

    //Soft delete flags
    task.isDeleted = true;
    task.deletedAt = new Date();
    task.deletedBy = requester._id;
    await task.save();

    // Activity log (INLINE – no missing import)
    await Activity.create({
      lead: task.lead,
      user: requester._id,
      type: "task_deleted",
      description: `Task "${task.title}" deleted`,
      metadata: { taskId: task._id },
    });

    //Cache clear
    await cacheScanDel("tasks:list");

    return { deleted: true };
  }

  // COMPLETE TASK
  static async markCompleted(taskId, requester) {
    const task = await Task.findById(taskId);
    if (!task) throw createError(404, "Task not found");

    if (String(task.assignedTo) !== String(requester._id)) {
      throw createError(403, "Only assigned user can complete task");
    }

    task.status = "completed";
    task.completedAt = new Date();
    await task.save();
    await this.logActivity(
      task.lead,
      requester._id,
      "task_completed",
      `Task "${task.title}" completed`,
      {
        taskId: task._id,
        completedAt: task.completedAt,
      }
    );
    await notifyTaskCompleted(task, requester);
    await cacheScanDel("tasks:list");
    // return task;
    return TaskService._transform(task.toObject());
  }
}

export default TaskService;
