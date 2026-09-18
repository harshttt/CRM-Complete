import User from "../modules/user/user.model.js";

/**
 * Group salesperson scores based on viewer role
 * Adds manager-wise average score without breaking existing structure
 */

function getBucketByScore(score = 0) {
  if (score >= 90) return "rockstar";
  if (score >= 70) return "high_performer";
  if (score >= 50) return "consistent";
  if (score >= 30) return "needs_improvement";
  return "risk_zone";
}



export async function preloadAdminsIfSuperAdmin(viewer, adminMap) {
  if (viewer.role.roleLevel !== 1) return;

  const admins = await User.find({
    isDeleted: { $ne: true }
  })
    .populate("role", "roleLevel")
    .lean();

  for (const u of admins) {
    if (u.role?.roleLevel === 2) {
      const adminId = u._id.toString();

      if (!adminMap[adminId]) {
        adminMap[adminId] = {
          admin: {
            id: u._id,
            name: u.fullName,
            email: u.email,
          },
          summary: {
            totalManagers: 0,
            totalSalespersons: 0,
            totalScore: 0,
            averageScore: 0,
            bucket: "risk_zone",
          },
          managers: {},
        };
      }
    }
  }
}

function resolveAdminForSales(salesUser, userMap) {
  const ancestors = salesUser.ancestorIds || [];

  // admin = roleLevel 2
  for (const id of ancestors) {
    const u = userMap[String(id)];
    if (u?.role?.roleLevel === 2) {
      return u;
    }
  }
  return null;
}


export function groupScoresByHierarchy(scores, viewerRoleLevel, userMap) {
  const adminMap = {};

  for (const s of scores) {
    const salesUser = userMap?.[String(s.user._id)];
  if (!salesUser) continue;


    const admin = resolveAdminForSales(salesUser, userMap);
    const adminKey = admin ? String(admin._id) : "unassigned";

    if (!adminMap[adminKey]) {
      adminMap[adminKey] = {
        admin: admin
          ? { id: admin._id, name: admin.fullName, email: admin.email }
          : { id: null, name: "Unassigned", email: null },
        managers: [],
        _managerMap: {}
      };
    }

    // MANAGER
    const manager = userMap?.[String(salesUser.parentUser)];
    if (!manager) continue;


    const mgrKey = String(manager._id);
    const adminNode = adminMap[adminKey];

    if (!adminNode._managerMap[mgrKey]) {
      adminNode._managerMap[mgrKey] = {
        manager: {
          id: manager._id,
          name: manager.fullName,
          email: manager.email
        },
        salespersons: [],
        summary: {
          totalSalespersons: 0,
          averageScore: 0
        }
      };
      adminNode.managers.push(adminNode._managerMap[mgrKey]);
    }

    adminNode._managerMap[mgrKey].salespersons.push({
      id: salesUser._id,
      name: salesUser.fullName,
      email: salesUser.email,
      branch: salesUser.branch,
      region: salesUser.region,
      totalScore: s.totalScore,
      bucket: s.bucket,
      breakdown: s.breakdown
    });
  }

  // CALCULATE SUMMARIES
  Object.values(adminMap).forEach(adminNode => {
    let adminScoreSum = 0;
    let adminSalesCount = 0;

    adminNode.managers.forEach(m => {
      const sum = m.salespersons.reduce((a, s) => a + s.totalScore, 0);
      m.summary.totalSalespersons = m.salespersons.length;
      m.summary.averageScore = m.salespersons.length
        ? Number((sum / m.salespersons.length).toFixed(2))
        : 0;
        m.summary.bucket = getBucketByScore(m.summary.averageScore);

      adminScoreSum += sum;
      adminSalesCount += m.salespersons.length;
    });

    adminNode.summary = {
      totalManagers: adminNode.managers.length,
      totalSalespersons: adminSalesCount,
      averageScore: adminSalesCount
        ? Number((adminScoreSum / adminSalesCount).toFixed(2))
        : 0,

       bucket: getBucketByScore(
       adminSalesCount
      ? Number((adminScoreSum / adminSalesCount).toFixed(2))
      : 0
  )
    };

    delete adminNode._managerMap;
  });

    let superAdminSalesCount = 0;
    let superAdminWeightedScoreSum = 0;

  Object.values(adminMap).forEach(adminNode => {
    const salesCount = adminNode.summary.totalSalespersons;
    const avgScore = adminNode.summary.averageScore;

    superAdminSalesCount += salesCount;
    superAdminWeightedScoreSum += salesCount * avgScore;
  });

  const superAdminAverageScore = superAdminSalesCount
    ? Number(
        (superAdminWeightedScoreSum / superAdminSalesCount).toFixed(2)
      )
    : 0;

  // return Object.values(adminMap);
    const result = Object.values(adminMap);

    let superAdminTotalManagers = 0;

  Object.values(adminMap).forEach(adminNode => {
  superAdminTotalManagers += adminNode.managers.length;
});

  // attach summary ONLY for super admin usage
  result.superAdminSummary = {
    totalAdmins: result.length,
     totalManagers: superAdminTotalManagers,
     totalSalespersons: superAdminSalesCount,
     averageScore: superAdminAverageScore,
     bucket: getBucketByScore(superAdminAverageScore)
  };

  return result;
}



export function getDateRange(range = "daily", baseDate = new Date()) {
  const start = new Date(baseDate);
  const end = new Date(baseDate);

  switch (range) {
    case "weekly":
      start.setDate(start.getDate() - start.getDay()); // Sunday
      start.setHours(0, 0, 0, 0);

      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;

    case "monthly":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      end.setMonth(start.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "yearly":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);

      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;

    default: // daily
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}












