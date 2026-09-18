
import { ApiResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/appError.js";
import { SalespersonScoringService } from "./salesperson.scoring.service.js";
import {groupScoresByHierarchy,getDateRange} from "../../utils/groupScoresByHierarchy.js";
import { SaleScoringService } from "./sale.scoring.service.js";
import User from "../user/user.model.js";

export class SalespersonController {
  static async calculateScore(req, res, next) {
    try {
      const { userId, date } = req.body;
      if (!userId) throw AppError.notFound("userId is required");
      const score = await SaleScoringService.calculateDailyScore( userId, date ? new Date(date) : new Date() );
      return res.json(ApiResponse.success(score, "fetch score"));
    } catch (err) {
      next(err);
    }
  }

  static async performance(req, res, next) {
    try {
      const viewer = req.user;
      const range = req.query.range || "daily";
      const date = req.query.date ? new Date(req.query.date) : new Date();

      const { start, end } = getDateRange(range, date);
      const rawScores = await SalespersonScoringService.getPerformanceForUser(viewer,start,end);
      const allUsers = await User.find({})
        .select("_id fullName email role parentUser ancestorIds branch region")
        .populate("role", "roleLevel")
        .lean();

      const userMap = {};
      for (const u of allUsers) {
        userMap[String(u._id)] = u;
      }
      const data = groupScoresByHierarchy(rawScores,viewer.role.roleLevel,userMap);

      res.json({
        success: true,
        role: viewer.role.name,
        scope:
          viewer.role.roleLevel === 4
            ? "self"
            : viewer.role.roleLevel === 3
              ? "team"
              : viewer.role.roleLevel === 2
                ? "hierarchy"
                : "global",
        range,
        period: { start, end },
        data,
        superAdminSummary: data.superAdminSummary || null,
      });
    } catch (err) {
      next(err);
    }
  }

}
