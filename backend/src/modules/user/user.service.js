import User from "./user.model.js";
import bcrypt from "bcrypt";
import { AppError } from "../../utils/appError.js";
import { cacheSet, cacheDel } from "../../utils/cache.js";
import { PermissionService } from "../permission/permission.service.js";
import { invalidateUserHierarchyCache } from "../../utils/cacheInvalidator.js";

export class UserService {
  static async findByEmailOrPhone(identifier) {
    return User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    }).populate("role");
  }
  static async validateCredentials(emailOrPhone, password) {
    const user = await this.findByEmailOrPhone(emailOrPhone);
    if (!user) throw AppError.notFound("User not found");
    const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) throw AppError.unauthorized("Invalid credentials");
    return user;
  }
  static async onLogin(user) {
    user.lastLoginAt = new Date();
    user.isOnline = true;
    return user.save();
  }
  static async onLogout(userId) {
    return User.findByIdAndUpdate(userId, {
      lastLogoutAt: new Date(),
      isOnline: false
    });
  }
  static async updateSubtreeAncestor(userId) {
    const user = await User.findById(userId).lean();
    if (!user) return;
    const children = await User.find({ parentUser: userId });
    for (const child of children) {
      const newAncestors = [...user.ancestorIds, user._id];
      await User.findByIdAndUpdate(child._id, { ancestorIds: newAncestors });
      await this.updateSubtreeAncestor(child._id);
    }
  }
  static async createUser(payload) {
    const existing = await User.findOne({
      $or: [{ email: payload.email }, { phone: payload.phone }]
    });
    if (existing) throw AppError.badRequest("Email or phone already in use");

    // Build correct hierarchy chain (parent + ancestors)
    if (payload.parentUser) {
      const parent = await User.findById(payload.parentUser).lean();
      if (!parent) throw AppError.badRequest("Invalid parent user");

      payload.ancestorIds = [...(parent.ancestorIds || []), parent._id];
    } else {
      payload.ancestorIds = [];
    }

    // Create user
    const user = await User.create(payload);

    await cacheDel(`user:${user._id}`);
    await cacheDel(`user:finalPermissions:${user._id}`);

    // Build detailed response object
    const fullUser = await User.findById(user._id)
      .populate({
        path: "role",
        populate: {
          path: "permissions",
          model: "Permission",
          select: "name module action"
        }
      })
      .populate("parentUser", "fullName email")
      .populate("ancestorIds", "fullName email")
      .populate("overridePermissions.permission")
      .lean();

    const finalPermissions = await PermissionService.getUserFinalPermissions(fullUser);

    return {
      id: String(fullUser._id),
      fullName: fullUser.fullName,
      email: fullUser.email,
      phone: fullUser.phone,
      role: fullUser.role
        ? {
          id: String(fullUser.role._id),
          name: fullUser.role.name
        }
        : null,
      permissions: finalPermissions,
      parentUser: fullUser.parentUser
        ? {
          id: String(fullUser.parentUser._id),
          name: fullUser.parentUser.fullName
        }
        : null,
      ancestorIds: (fullUser.ancestorIds || []).map(u => ({
        id: String(u._id),
        name: u.fullName
      })),
      branch: fullUser.branch,
      region: fullUser.region,
      createdAt: fullUser.createdAt
    };
  }
  static async getUser(userId) {
    const userFromDb = await User.findById(userId)
      .populate("role")
      .populate("overridePermissions.permission")
      .lean();
    if (!userFromDb) return null;
    await cacheSet(`user:${userId}`, userFromDb, 5);
    return userFromDb;
  }


  static async getTeamMemberIds(rootUserId) {
  const users = await User.find({
    $or: [
      { parentUser: rootUserId },
      { ancestorIds: rootUserId }
    ]
  }).select("_id");

  return users.map(u => u._id);
}

static async getVisibleSalesUserIds(viewer) {
  const roleLevel = viewer.role.roleLevel;
  const viewerId = viewer._id;

  //SALES → only self
  if (roleLevel === 4) {
    return [viewerId];
  }

  //MANAGER → direct sales under him
  if (roleLevel === 3) {
    const users = await User.find({
      parentUser: viewerId,
      isDeleted: { $ne: true }
    })
      .populate("role", "roleLevel")
      .lean();

    return users
      .filter(u => u.role?.roleLevel === 4)
      .map(u => u._id);
  }

  //ADMIN → full subtree sales (manager + sales)
  if (roleLevel === 2) {
    const users = await User.find({
      ancestorIds: viewerId,
      isDeleted: { $ne: true }
    })
      .populate("role", "roleLevel")
      .lean();

    return users
      .filter(u => u.role?.roleLevel === 4)
      .map(u => u._id);
  }

  //SUPER ADMIN → all sales
  if (roleLevel === 1) {
    const users = await User.find({
      isDeleted: { $ne: true }
    })
      .populate("role", "roleLevel")
      .lean();

    return users
      .filter(u => u.role?.roleLevel === 4)
      .map(u => u._id);
  }

  return [];
}



static async getSalesTeamIdsForManager(managerId) {
  const users = await User.find({
    $or: [
      { parentUser: managerId },
      { ancestorIds: managerId }
    ],
    isDeleted: { $ne: true }
  })
    .populate("role", "roleLevel")
    .lean();

  const salesUsers = users.filter(
    u => u.role?.roleLevel === 4
  );


  return salesUsers.map(u => u._id);
}



  static async getUsersPaginated({
    page,
    limit,
    filter,
    sort,
    myLevel,
    myId,
    includeDeleted = false
  }) {
    const skip = (page - 1) * limit;
    const isSuperAdmin = myLevel === 1;

    const deleteFilter = includeDeleted
      ? {}
      : (isSuperAdmin ? {} : { isDeleted: false });
    const explicitRoleLevel = filter.roleLevel || null;
    if (filter.roleLevel) delete filter.roleLevel;
    const targetRoleLevel = explicitRoleLevel
      ? Number(explicitRoleLevel)
      : (isSuperAdmin ? 2 : myLevel + 1);
    const visibilityFilter = isSuperAdmin
      ? { "role.roleLevel": targetRoleLevel }
      : {
        $and: [
          { "role.roleLevel": targetRoleLevel },
          {
            $or: [
              { parentUser: myId },
              { ancestorIds: myId }
            ]
          }
        ]
      };
    const pipeline = [
      { $match: { ...filter, ...deleteFilter } },
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role"
        }
      },
      { $unwind: "$role" },
      { $match: visibilityFilter },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          fullName: 1,
          email: 1,
          phone: 1,
          branch: 1,
          region: 1,
          role: 1,
          parentUser: 1,
          createdAt: 1,
          isDeleted: 1,
          deletedAt: 1
        }
      }
    ];
    const users = await User.aggregate(pipeline);
    const countPipeline = [
      { $match: { ...filter, ...deleteFilter } },
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role"
        }
      },
      { $unwind: "$role" },
      { $match: visibilityFilter },
      { $count: "total" }
    ];
    const totalRes = await User.aggregate(countPipeline);
    const total = totalRes[0]?.total || 0;
    return {
      data: users,
      page,
      totalPages: Math.ceil(total / limit),
      total
    };
  }
  static async getUsersList({
    page,
    limit,
    filter,
    sort,
    myLevel,
    myId,
    includeDeleted = false,
    reqUser
  }) {
    const paginated = await this.getUsersPaginated({
      page,
      limit,
      filter,
      sort,
      myLevel,
      myId,
      includeDeleted
    });

    const canSeeDeleteFields = await PermissionService.userHasPermission(
      reqUser,
      "user:disable"
    );

    const parentIds = paginated.data.map(u => u.parentUser).filter(Boolean);
    const parentUsersMap = {};

    if (parentIds.length > 0) {
      const parents = await User.find({ _id: { $in: parentIds } })
        .select("_id fullName email")
        .lean();
      parents.forEach(p => {
        parentUsersMap[p._id] = {
          id: String(p._id),
          name: p.fullName,
          email: p.email
        };
      });
    }

    const list = paginated.data.map(u => {
      const base = {
        id: String(u._id),
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        branch: u.branch,
        region: u.region,
        role: {
          id: String(u.role._id),
          name: u.role.name,
          description: u.role.description,
          roleLevel: u.role.roleLevel
        },
        parentUser: u.parentUser
          ? parentUsersMap[u.parentUser] || { id: String(u.parentUser), name: null }
          : null,
        createdAt: u.createdAt
      };

      if (canSeeDeleteFields) {
        base.isDeleted = !!u.isDeleted;
        base.deletedAt = u.deletedAt || null;
      }

      return base;
    });

    return {
      data: list,
      page: paginated.page,
      totalPages: paginated.totalPages,
      total: paginated.total
    };
  }
  static async updateUser(userId, data) {
    // if (data.password) {
    //   throw AppError.badRequest("Use change-password endpoint to update password");
    // }

      if (data.password) {
      //  const strongRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()[\]{}\-_=+]).{8,}$/;
      //   if (!strongRegex.test(data.password)) {
      //   throw AppError.badRequest(
      //     "Password must be minimum 8 characters and include uppercase, lowercase, number & special character"
      //   );
      // }

    const bcrypt = (await import("bcrypt")).default;
    data.password = await bcrypt.hash(data.password, 10);
  }
    let needSubtreeFix = false;
    if (data.parentUser !== undefined) {
      if (data.parentUser) {
        const parent = await User.findById(data.parentUser).lean();
        if (!parent) throw AppError.badRequest("Invalid parent user");
        data.ancestorIds = [...(parent.ancestorIds || []), parent._id];
      } else {
        data.ancestorIds = [];
      }
      needSubtreeFix = true;
    }
    const updated = await User.findByIdAndUpdate(userId, data, { new: true })
      .populate("role")
      .populate("overridePermissions.permission");
    await cacheDel(`user:${userId}`);
    await cacheDel(`user:finalPermissions:${userId}`);
    if (needSubtreeFix) {
      await this.updateSubtreeAncestor(userId);
    }
    return updated ? updated.toObject() : null;
  }
  static async softDeleteUser(userId, currentUserId) {
    const user = await User.findById(userId);
    if (!user) throw AppError.notFound("User not found");
    if (user.isDeleted) throw AppError.badRequest("User already deleted");
    if (String(userId) === String(currentUserId))
      throw AppError.badRequest("You cannot delete yourself");
    await user.softDelete();
    await invalidateUserHierarchyCache(userId);
    return user;
  }

  static async deleteUserAndTransferSubtree(userId, currentUser) {
  const user = await User.findById(userId)
    .populate("role", "name roleLevel")
    .lean();

  if (!user) throw AppError.badRequest("User not found");

  if (String(userId) === String(currentUser._id)) {
    throw AppError.badRequest("You cannot delete yourself");
  }

  if (currentUser.role.roleLevel !== 1) {
    const isInMyTree =
      String(user.parentUser) === String(currentUser._id) ||
      (user.ancestorIds || []).some(
        id => String(id) === String(currentUser._id)
      );

    if (!isInMyTree) throw AppError.forbidden("You cannot delete this user");
  }

  const parentId = user.parentUser || null;

  // 🔹 Fetch parent snapshot (if exists)
  let transferTargetSnapshot = null;

  if (parentId) {
    const parentUser = await User.findById(parentId)
      .populate("role", "name roleLevel")
      .lean();

    if (parentUser) {
      transferTargetSnapshot = {
        id: parentUser._id,
        fullName: parentUser.fullName,
        email: parentUser.email,
        phone: parentUser.phone,
        role: parentUser.role
          ? {
              id: parentUser.role._id,
              name: parentUser.role.name,
              level: parentUser.role.roleLevel
            }
          : null
      };
    }
  }

  // Transfer children
  const children = await User.find({ parentUser: userId }).lean();

  for (const child of children) {
    const newAncestorIds = parentId
      ? [...(user.ancestorIds || []), parentId]
      : [];

    await User.findByIdAndUpdate(child._id, {
      parentUser: parentId,
      ancestorIds: newAncestorIds
    });
  }

  // 🔹 Deleted user snapshot
  const deletedUserSnapshot = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role
      ? {
          id: user.role._id,
          name: user.role.name,
          level: user.role.roleLevel
        }
      : null
  };

  await User.findByIdAndDelete(userId);

  return {
    deletedUser: deletedUserSnapshot,
    transferredTo: transferTargetSnapshot
  };
}
  static async changePassword(userId, hashed) {
    const updated = await User.findByIdAndUpdate(userId, { password: hashed, lastPasswordChangedAt: new Date() }, { new: true });
    await cacheDel(`user:${userId}`);
    await cacheDel(`user:finalPermissions:${userId}`);
    return updated;
  }
  static async restoreUser(userId) {
    const user = await User.findById(userId).setOptions({ ignoreDeleted: true });
    if (!user) throw AppError.notFound("User not found");
    if (user.isDeleted) {
      await user.restore();
    }
    await invalidateUserHierarchyCache(userId);
    const fullUser = await User.findById(userId)
      .populate({
        path: "role",
        populate: {
          path: "permissions",
          model: "Permission",
          select: "name module action description"
        }
      })
      .populate("parentUser", "fullName email")
      .populate("ancestorIds", "fullName email")
      .populate("overridePermissions.permission")
      .lean();

    const finalPermissions = await PermissionService.getUserFinalPermissions(fullUser);

    return {
      id: String(fullUser._id),
      fullName: fullUser.fullName,
      email: fullUser.email,
      phone: fullUser.phone,
      branch: fullUser.branch,
      region: fullUser.region,
      role: fullUser.role
        ? {
          id: String(fullUser.role._id),
          name: fullUser.role.name,
          description: fullUser.role.description
        }
        : null,
      permissions: finalPermissions,
      parentUser: fullUser.parentUser
        ? {
          id: String(fullUser.parentUser._id),
          name: fullUser.parentUser.fullName
        }
        : null,
      ancestorIds: (fullUser.ancestorIds || []).map(u => ({
        id: String(u._id),
        name: u.fullName
      })),
      createdAt: fullUser.createdAt
    };
  }
  static async buildUserTree(myId, myLevel) {
    const isSuperAdmin = myLevel === 1;
    let users;
    if (isSuperAdmin) {
      users = await User.find({})
        .select("_id fullName email parentUser role")
        .populate("role", "name roleLevel")
        .lean();
    } else {
      users = await User.find({
        $or: [
          { parentUser: myId },
          { ancestorIds: myId }
        ]
      })
        .select("_id fullName email parentUser role")
        .populate("role", "name roleLevel")
        .lean();
    }
    const map = {};
    users.forEach(u => {
      map[u._id] = {
        id: String(u._id),
        fullName: u.fullName,
        email: u.email,
        role: {
          name: u.role?.name || null,
          roleLevel: u.role?.roleLevel || null
        },
        children: []
      };
    });
    let rootNodes = [];
    users.forEach(u => {
      if (!u.parentUser || String(u.parentUser) === String(myId)) {
        rootNodes.push(map[u._id]);
      } else if (map[u.parentUser]) {
        map[u.parentUser].children.push(map[u._id]);
      }
    });
    return rootNodes;
  }
  static async changeParent(userId, newParentId, currentUser) {
    const user = await User.findById(userId).lean();
    if (!user) throw AppError.badRequest("User not found");
    const newParent = await User.findById(newParentId).lean();
    if (!newParent) throw AppError.badRequest("New parent not found");
    if (newParent.ancestorIds?.includes(userId)) {
      throw AppError.badRequest("Cannot set child as parent: circular hierarchy");
    }
    if (currentUser.role.roleLevel !== 1) {
      const canManage =
        String(user.parentUser) === String(currentUser._id) ||
        user.ancestorIds?.includes(currentUser._id);
      if (!canManage) throw AppError.forbidden("You cannot reassign this user");
    }
    const updatedAncestorIds = [...(newParent.ancestorIds || []), newParentId];
    const updated = await User.findByIdAndUpdate(
      userId,
      {
        parentUser: newParentId,
        ancestorIds: updatedAncestorIds
      },
      { new: true }
    )
      .select("_id fullName email parentUser ancestorIds")
      .lean();
    return updated;
  }
  static async moveUserSubtree(userId, newParentId, currentUser) {
    const user = await User.findById(userId).lean();
    const newParent = await User.findById(newParentId).lean();
    if (!user) throw AppError.badRequest("User not found");
    if (!newParent) throw AppError.badRequest("New parent not found");
    if (newParent.ancestorIds?.includes(userId)) {
      throw AppError.badRequest("Cannot assign user under its own subtree");
    }
    if (currentUser.role.roleLevel !== 1) {
      const isMine =
        user.parentUser === currentUser._id ||
        user.ancestorIds?.includes(currentUser._id);
      if (!isMine) throw AppError.forbidden("You cannot move this subtree");
    }
    const newAncestorChain = [...(newParent.ancestorIds || []), newParentId];
    await User.findByIdAndUpdate(userId, {
      parentUser: newParentId,
      ancestorIds: newAncestorChain
    });
    const descendants = await User.find({ ancestorIds: userId }).lean();
    for (const d of descendants) {
      const index = d.ancestorIds.indexOf(userId);
      const rest = d.ancestorIds.slice(index);
      const newChain = [...newAncestorChain, ...rest];
      await User.findByIdAndUpdate(d._id, {
        ancestorIds: newChain
      });
    }
    return { moved: userId, newParent: newParentId };
  }
  static async getParentUserDropdownPaginated(reqUser, {
    page = 1,
    limit = 20,
    q = ""
  }) {
    const skip = (page - 1) * limit;
    const myLevel = reqUser.role.roleLevel;
    const myId = reqUser._id;
    const isSuperAdmin = myLevel === 1;
    const searchFilter = q
      ? { fullName: { $regex: q, $options: "i" } }
      : {};
    const roleLevelMatch = isSuperAdmin
      ? { "role.roleLevel": { $gt: 1 } }
      : { "role.roleLevel": { $lt: myLevel } };
    const visibilityFilter = isSuperAdmin
      ? {}
      : {
        $or: [
          { parentUser: myId },
          { ancestorIds: myId }
        ]
      };
    const pipeline = [
      { $match: searchFilter },
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role"
        }
      },
      { $unwind: "$role" },
      { $match: roleLevelMatch },
      { $match: visibilityFilter },
      { $sort: { fullName: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" },
          fullName: 1,
          roleName: "$role.name"
        }
      }
    ];
    const data = await User.aggregate(pipeline);
    const countPipeline = [
      { $match: searchFilter },
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role"
        }
      },
      { $unwind: "$role" },
      { $match: roleLevelMatch },
      { $match: visibilityFilter },
      { $count: "total" }
    ];
    const totalRes = await User.aggregate(countPipeline);
    const total = totalRes[0]?.total || 0;
    return {
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total
    };
  }
}