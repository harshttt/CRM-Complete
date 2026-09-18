import { ApiResponse } from "../../utils/apiResponse.js";
import { MeetingService } from "./meeting.service.js";

export class MeetingController {

  static async create(req, res, next) {
    try {
      const meeting = await MeetingService.create(req.body, req.user);
      return res.json(
        ApiResponse.success(meeting, "Meeting scheduled")
      );
    } catch (e) {
      next(e);
    }
  }
  static async update(req, res, next) {
    try {
      const data = await MeetingService.update(
        req.params.meetingId,
        req.body,
        req.user
      );
      return res.json(
        ApiResponse.success(data, "Meeting updated")
      );
    } catch (e) {
      next(e);
    }
  }
  static async cancel(req, res, next) {
    try {
      const data = await MeetingService.cancel(
        req.params.meetingId,
        req.user
      );
      return res.json(
        ApiResponse.success(data, "Meeting cancelled")
      );
    } catch (e) {
      next(e);
    }
  }
  static async listUpcoming(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "scheduledAt",
      q
    } = req.query;

    const result = await MeetingService.getUpcomingMeetings({
      page: Number(page),
      limit: Number(limit),
      sort,
      q,
      user: req.user
    });

    return res.json(ApiResponse.paginated(result));
  } catch (err) {
    next(err);
  }
}

}