  import Meeting from "./meeting.model.js";
  import { AppError } from "../../utils/appError.js";
  import { MeetingCalendarService } from "./meeting.calendar.service.js";
  import { formatIst, parseToUtc } from "../../utils/date.util.js";
  import { cacheScanDel } from "../../utils/cache.js";
  import Activity from "../activity/activity.model.js";

  import mongoose from "mongoose";
  import {
    notifyMeetingCancelled,
    notifyMeetingCreated,
    notifyMeetingUpdated,
  } from "../notification/notification.helper.js";
  import { deepTransform } from "../../utils/transform.js";

  export class MeetingService {
    static _transform(doc) {
      return deepTransform(doc);
    }

    static async create(payload, user) {
      if (!payload.title) {
        throw new AppError("title is required", 400);
      }
      if (!payload.scheduledAt) {
        throw new AppError(
          "scheduledAt is required (DD/MM/YYYY hh:mm:ss AM/PM)",
          400
        );
      }
      const scheduledAt = parseToUtc(payload.scheduledAt);
      const leadId = payload.leadId || null;
      const taskId = payload.taskId || null;
      if (leadId && taskId) {
        throw new AppError(
          "Meeting can be linked to either lead or task, not both",
          400
        );
      }
      if (leadId && !mongoose.Types.ObjectId.isValid(leadId)) {
        throw new AppError("Invalid leadId", 400);
      }
      if (taskId && !mongoose.Types.ObjectId.isValid(taskId)) {
        throw new AppError("Invalid taskId", 400);
      }
      if (Array.isArray(payload.participants)) {
        payload.participants.forEach((p) => {
          if (p.type === "external" && !p.email) {
            throw new AppError("External participant must have email", 400);
          }
          if (p.type === "user" && !p.user) {
            throw new AppError("User participant must have user id", 400);
          }
        });
      }
      const meeting = await Meeting.create({
        title: payload.title,
        notes: payload.notes,
        scheduledAt,
        durationMinutes: payload.durationMinutes,
        type: payload.type,
        participants: payload.participants,
        assignedTo: payload.assignedTo,
        lead: leadId,
        task: taskId,
        status: "scheduled",
        createdBy: user._id,
        updatedBy: user._id,
      });
      try {
        const calendar = await MeetingCalendarService.createEvent(meeting);
        meeting.calendar = {
          provider: "google",
          eventId: calendar.eventId,
          meetLink: calendar.meetLink,
        };
        await meeting.save();
        await notifyMeetingCreated(meeting);
        await Activity.create({
              meeting: leadId,
              user: user._id,
              type: "meeting_created",
              description: "meeting created",
            });

      } catch (err) {
        console.error("Calendar create failed:", err.message);
      }

      await cacheScanDel("leads:list");
      return MeetingService._transform(meeting.toObject());
      // return meeting;
    }
    static async update(meetingId, payload, user) {
      // console.log("data payload", payload);
      // console.log("meetingId payload ", meetingId);
      const meeting = await Meeting.findById(meetingId);
        if (!meeting) throw new AppError("Meeting not found", 404);

      // console.log("meeting found", meeting);

      if (meeting.status === "cancelled") {
        throw new AppError(
          "Cancelled meeting cannot be updated. Please create a new meeting.",
          400
        );
      }

    

      if (payload.title !== undefined) {
        meeting.title = payload.title;
      }
      if (payload.scheduledAt) {
        meeting.scheduledAt = parseToUtc(payload.scheduledAt);
      }
      if (payload.durationMinutes) {
        meeting.durationMinutes = payload.durationMinutes;
      }
      if (payload.participants) {
        payload.participants.forEach((p) => {
          if (p.type === "external" && !p.email) {
            throw new AppError("External participant must have email", 400);
          }
        });
        meeting.participants = payload.participants;
      }
      if (payload.notes !== undefined) {
        meeting.notes = payload.notes;
      }
      if (payload.leadId || payload.taskId) {
        if (payload.leadId && payload.taskId) {
          throw new AppError(
            "Meeting can be linked to either lead or task, not both",
            400
          );
        }
        if (payload.leadId) {
          if (!mongoose.Types.ObjectId.isValid(payload.leadId)) {
            throw new AppError("Invalid leadId", 400);
          }
          meeting.lead = payload.leadId;
          meeting.task = null;
        }
        if (payload.taskId) {
          if (!mongoose.Types.ObjectId.isValid(payload.taskId)) {
            throw new AppError("Invalid taskId", 400);
          }
          meeting.task = payload.taskId;
          meeting.lead = null;
        }
      }
      meeting.updatedBy = user._id;
      await meeting.save();
      try {
        await MeetingCalendarService.updateEvent(
          meeting.calendar?.eventId,
          meeting
        );
      } catch (err) {
        console.error("Calendar update failed:", err.message);
      }
      await notifyMeetingUpdated(meeting, user);
      await Activity.create({
              // meeting: leadId,
              meeting: meeting._id,
              user: user._id,
              type: "meeting_updated",
              description: "meeting updated",
            });
      // return meeting;
      await cacheScanDel("leads:list");
      await cacheScanDel("meetings:upcoming");

      return MeetingService._transform(meeting.toObject());
    }
    static async cancel(meetingId, user) {
      const meeting = await Meeting.findById(meetingId);
      if (!meeting) throw new AppError("Meeting not found", 404);

      if (meeting.status === "cancelled") {
        throw new AppError(
          "Cancelled meeting cannot be updated. Please create a new meeting.",
          400
        );
      }

      if (meeting.calendar?.eventId) {
        try {
          await MeetingCalendarService.cancelEvent(meeting.calendar.eventId);
        } catch (err) {
          console.error("Calendar cancel failed:", err.message);
          throw new AppError(
            "Unable to cancel meeting on calendar, try again",
            502
          );
        }
      }

      meeting.status = "cancelled";
      meeting.updatedBy = user._id;
      await meeting.save();
      await notifyMeetingCancelled(meeting, user);
      // try {
      //   await MeetingCalendarService.cancelEvent(meeting.calendar?.eventId);
      // } catch (err) {
      //   console.error("Calendar cancel failed:", err.message);
      // }
      // return meeting;

      await cacheScanDel("leads:list");
      return MeetingService._transform(meeting.toObject());
    }
    static async getLastMeetingByLeadIds(leadIds = []) {
      if (!Array.isArray(leadIds) || leadIds.length === 0) {
        return {};
      }
      const objectIds = leadIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      const rows = await Meeting.aggregate([
        // { $match: { lead: { $in: objectIds } } },
        {
          $match: {
            lead: { $in: objectIds },
            status: { $ne: "cancelled" },
          },
        },
        { $sort: { scheduledAt: -1 } },
        {
          $group: {
            _id: "$lead",
            meeting: { $first: "$$ROOT" },
          },
        },

        {
          $addFields: {
            "meeting.assignedToObj": {
              $cond: [
                { $eq: [{ $type: "$meeting.assignedTo" }, "string"] },
                { $toObjectId: "$meeting.assignedTo" },
                "$meeting.assignedTo",
              ],
            },
          },
        },

        {
        $lookup: {
          from: "users",
          localField: "meeting.assignedToObj",
          foreignField: "_id",
          as: "assignedUser",
        },
      },

        // {
        //   $lookup: {
        //     from: "users",
        //     localField: "meeting.assignedTo",
        //     foreignField: "_id",
        //     as: "assignedUser",
        //   },
        // },

        {
          $lookup: {
            from: "users",
            localField: "meeting.createdBy",
            foreignField: "_id",
            as: "createdUser",
          },
        },

        {
          $project: {
            _id: 1,
            meeting: {
              _id: "$meeting._id",
              status: "$meeting.status",
              title: "$meeting.title",
              notes: "$meeting.notes",
              scheduledAt: "$meeting.scheduledAt",
              meetLink: "$meeting.calendar.meetLink",
              durationMinutes: "$meeting.durationMinutes",
              participants: "$meeting.participants",
              assignedTo: {
                _id: { $arrayElemAt: ["$assignedUser._id", 0] },
                fullName: { $arrayElemAt: ["$assignedUser.fullName", 0] },
              },
              scheduledBy: {
                _id: { $arrayElemAt: ["$createdUser._id", 0] },
                fullName: { $arrayElemAt: ["$createdUser.fullName", 0] },
              },
            },
          },
        },
      ]);

      // console.log(" RAW MEETING AGG ROWS:", JSON.stringify(rows, null, 2));

      const result = {};
      for (const row of rows) {
        const m = row.meeting;
        let flag = false;
        if (m.status === "completed") flag = true;
        else if (m.status === "cancelled") flag = null;
        result[row._id.toString()] = {
          flag,
          meeting: {
            // _id: m._id,
            // status: m.status,
            ...m,
            scheduledAt: m.scheduledAt ? formatIst(m.scheduledAt) : null,
            // meetLink: m.calendar?.meetLink ?? null
          },
        };
      }

      return deepTransform(result);
      // return result;
    }
    static async getUpcomingMeetings({
      page,
      limit,
      sort,
      q,
      user
    }) {
      const now = new Date();

      // const filter = {
      //   scheduledAt: { $gte: now },
      //   status: { $in: ["scheduled", "checked_in", "completed", "cancelled", "checked_out"] },
      //   $or: [
      //     { assignedTo: user._id },
      //     { "participants.user": user._id }
      //   ]
      // };

    const filter = {
      $or: [
        { assignedTo: user._id },
        { "participants.user": user._id }
      ]
    };

      if (q) {
        filter.$text = { $search: q };
      }

      const sortObj =
        sort?.startsWith("-")
        ? { [sort.slice(1)]: -1 }
        : { [sort || "scheduledAt"]: -1 };
        // sort.startsWith("-")
        //   ? { [sort.slice(1)]: -1 }
        //   : { [sort]: 1 };

      const skip = (page - 1) * limit;

      const [rows, total] = await Promise.all([
        Meeting.find(filter)
          .populate("assignedTo", "fullName email")
          .populate("participants.user", "fullName email")
          .populate("lead", "name")
          .populate("task", "title")
          .sort(sortObj)
          .skip(skip)
          .limit(limit)
          .lean(),

        Meeting.countDocuments(filter)
      ]);

      const data = rows.map(m => ({
        id: String(m._id),
        title: m.title,
        notes: m.notes ?? "",
        status: m.status,
        type: m.type,
        scheduledAt: m.scheduledAt
        ? formatIst(m.scheduledAt)
        : null,      durationMinutes: m.durationMinutes,
        meetLink: m.calendar?.meetLink ?? null,

        assignedTo: m.assignedTo
          ? {
              id: String(m.assignedTo._id),
              name: m.assignedTo.fullName,
              email: m.assignedTo.email
            }
          : null,

        participants: m.participants.map(p => ({
          type: p.type,
          user: p.user
            ? {
                id: String(p.user._id),
                name: p.user.fullName,
                email: p.user.email
              }
            : null,
          email: p.email || null,
          name: p.name || null
        })),

        lead: m.lead
          ? { id: String(m.lead._id), name: m.lead.name }
          : null,

        task: m.task
          ? { id: String(m.task._id), title: m.task.title }
          : null
      }));

      return {
        data,
        page,
        totalPages: Math.ceil(total / limit),
        total
      };
    }
  }
