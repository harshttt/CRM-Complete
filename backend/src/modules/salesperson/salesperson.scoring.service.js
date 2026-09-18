
import SalespersonScore from "./salesperson.score.model.js";
import { SaleScoringService } from "./sale.scoring.service.js";
import User from "../user/user.model.js";
import { UserService } from "../user/user.service.js";



export class SalespersonScoringService {

static async getPerformanceForUser(
  viewer,
  startDate = new Date(),
  endDate = new Date()
) {
  // Normalize dates
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  //Decide visible sales users
  const salesUserIds = await UserService.getVisibleSalesUserIds(viewer);

  if (!salesUserIds.length) return [];

  // DAILY MODE (backward compatible)
  const isSingleDay = start.toDateString() === end.toDateString();

  if (isSingleDay) {
    for (const userId of salesUserIds) {
      const exists = await SalespersonScore.exists({
        user: userId,
        date: start
      });

      if (!exists) {
        await SaleScoringService.calculateDailyScore(userId, start);
      }
    }

    const query =
      viewer.role.roleLevel === 4
        ? { user: viewer._id, date: start }
        : { user: { $in: salesUserIds }, date: start };

    return SalespersonScore.find(query)
      .populate({
        path: "user",
        select: "fullName email branch region parentUser",
        populate: {
          path: "parentUser",
          select: "fullName email role"
        }
      })
      .lean();
  }

  //  RANGE MODE (weekly / monthly / yearly)
  const existingScores = await SalespersonScore.find({
    user: { $in: salesUserIds },
    date: { $gte: start, $lte: end }
  }).select("user date");

  // Build lookup: userId + date
  const existingMap = new Set(
    existingScores.map(
      s => `${s.user.toString()}_${s.date.toISOString()}`
    )
  );

  // Loop through days & users
  for (
    let d = new Date(start);
    d <= end;
    d.setDate(d.getDate() + 1)
  ) {
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);

    for (const userId of salesUserIds) {
      const key = `${userId}_${day.toISOString()}`;
      if (!existingMap.has(key)) {
        await SaleScoringService.calculateDailyScore(userId, day);
      }
    }
  }

  // Fetch final result
  const query =
    viewer.role.roleLevel === 4
      ? {
          user: viewer._id,
          date: { $gte: start, $lte: end }
        }
      : {
          user: { $in: salesUserIds },
          date: { $gte: start, $lte: end }
        };

  return SalespersonScore.find(query)
    .populate({
      path: "user",
      select: "fullName email branch region parentUser",
      populate: {
        path: "parentUser",
        select: "fullName email role"
      }
    })
    .lean();
}



}
