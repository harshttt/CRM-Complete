
import { ApiResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/appError.js";
import { validatePassword } from "../../utils/passwordValidator.js";
import { UserService } from "./user.service.js";
import { RoleService } from "../role/role.service.js";
import { PermissionService } from "../permission/permission.service.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import userModel from "./user.model.js";

export class UserController {
    static async createUser(req, res, next) {
        try {
            const {
                fullName,
                email,
                phone,
                password,
                role,
                branch,
                region,
                overridePermissions,
                parentUser
            } = req.body;

            if (!fullName || !email || !phone || !password) {
                throw AppError.badRequest("Missing required fields: fullName/email/phone/password");
            }
            let finalParentUser = parentUser ? parentUser : req.user?._id;
            if (finalParentUser && !mongoose.Types.ObjectId.isValid(finalParentUser)) {
                throw AppError.badRequest("Invalid parentUser id format");
            }
            if (!validatePassword(password)) {
            throw AppError.badRequest(
                "Password must be minimum 8 characters and include uppercase, lowercase, number & special character"
            );
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const userPayload = {
                fullName,
                email,
                phone,
                password: hashedPassword,
                role,
                branch,
                region,
                overridePermissions,
                parentUser: finalParentUser
            };
            const user = await UserService.createUser(userPayload);
            await PermissionService.invalidateUserCache(user.id);
            return res.json(ApiResponse.success(user, "User created successfully"));
        } catch (err) {
            next(err);
        }
    }
    static async getUser(req, res, next) {
        try {
            const { id } = req.params;
              if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest("Invalid user id");
    }
            const user = await UserService.getUser(id);
            if (!user) throw AppError.notFound("User not found");
            return res.json(ApiResponse.success(user));
        } catch (err) {
            next(err);
        }
    }


    static async searchUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, q = "" } = req.query;

    const filter = q
      ? {
          $or: [
            { fullName: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { phone: { $regex: q, $options: "i" } }
          ]
        }
      : {};

    const result = await UserService.getUsersList({
      page: Number(page),
      limit: Number(limit),
      filter,
      sort: { createdAt: -1 },
      myLevel: req.user.role.roleLevel,
      myId: req.user._id,
      includeDeleted: false,
      reqUser: req.user
    });

    return res.json(
      ApiResponse.paginated(result, "Users searched successfully")
    );
  } catch (err) {
    next(err);
  }
}

    static async listUsers(req, res, next) {
        try {
            const {
                page = 1,
                limit = 10,
                sort = "-createdAt",
                branch,
                region,
                q,
                includeDeleted = "false",
                roleLevel,
                userId
            } = req.query;
            const filter = { _id: { $ne: req.user._id } };
            if (branch && branch !== "" && branch !== "all") filter.branch = branch;
            if (region && region !== "" && region !== "all") filter.region = region;
            if (q) filter.$text = { $search: q };
            if (roleLevel && !isNaN(roleLevel)) filter.roleLevel = Number(roleLevel);
            const sortObj =
                typeof sort === "string" && sort.startsWith("-")
                    ? { [sort.slice(1)]: -1 }
                    : { createdAt: -1 };
            const includeDeletedBool =
                String(includeDeleted).toLowerCase() === "true" ||
                includeDeleted === "1";
            let actorUser = req.user;
            if (userId && userId !== String(req.user._id)) {
                actorUser = await userModel.findById(userId)
                    .populate("role")
                    .lean();
                if (!actorUser) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid userId"
                    });
                }
            }
            const result = await UserService.getUsersList({
                page: Number(page),
                limit: Number(limit),
                filter,
                sort: sortObj,
                myLevel: actorUser.role.roleLevel,
                myId: actorUser._id,
                includeDeleted: includeDeletedBool,
                reqUser: actorUser
            });
            return res.json(ApiResponse.paginated(result));
        } catch (err) {
            next(err);
        }
    }
    static async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const {
                fullName,
                email,
                phone,
                role,
                branch,
                region,
                password,
                overridePermissions,
                parentUser
            } = req.body;
            if (role) {
                const roleDoc = await RoleService.getRoleById(role);
                if (!roleDoc) throw AppError.badRequest("Invalid role");
            }
            if (parentUser && !mongoose.Types.ObjectId.isValid(parentUser)) {
                throw AppError.badRequest("Invalid parentUser id format");
            }
            const updatePayload = {
                fullName,
                email,
                phone,
                role,
                branch,
                region,
                password,
                overridePermissions,
                parentUser
            };
            const updated = await UserService.updateUser(id, updatePayload);
            if (!updated) throw AppError.notFound("User not found");
            await PermissionService.invalidateUserCache(id);
            return res.json(ApiResponse.success(updated, "User updated successfully"));
        } catch (err) {
            next(err);
        }
    }
    static async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            const loginUserId = req.user._id;
            const deleted = await UserService.softDeleteUser(id, loginUserId);
            if (!deleted) throw AppError.notFound("User not found");
            await PermissionService.invalidateUserCache(id);
            return res.json(ApiResponse.success(null, "User deleted successfully"));
        } catch (err) {
            next(err);
        }
    }
    static async deleteUserWthTransfer(req, res, next) {
        try {
            const userId = req.params.id;
            const result = await UserService.deleteUserAndTransferSubtree(userId, req.user);
            return res.json(ApiResponse.success(result, "User deleted and subtree transferred"));
        } catch (err) {
            next(err);
        }
    }

    static async changePassword(req, res, next) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;
            if (!newPassword) throw AppError.badRequest("newPassword is required");
            if (!validatePassword(newPassword)) {
                throw AppError.badRequest(
                    "Password must be minimum 8 characters and include uppercase, lowercase, number & special character"
                );
            }
            const hashed = await bcrypt.hash(newPassword, 10);
            const user = await UserService.changePassword(id, hashed);
            if (!user) throw AppError.notFound("User not found");
            return res.json(ApiResponse.success(null, "Password changed successfully"));
        } catch (err) {
            next(err);
        }
    }

//     static async changePassword(req, res, next) {
//   try {
//     const { id } = req.params;
//     const { oldPassword, newPassword } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       throw AppError.badRequest("Invalid user id");
//     }

//     if (!newPassword) {
//       throw AppError.badRequest("newPassword is required");
//     }

//     if (!validatePassword(newPassword)) {
//       throw AppError.badRequest(
//         "Password must be minimum 8 characters and include uppercase, lowercase, number & special character"
//       );
//     }

//     const targetUser = await userModel.findById(id);
//     if (!targetUser) throw AppError.notFound("User not found");

//     const isSelf = String(req.user._id) === String(id);
//     // const roleLevel = req.user.role?.roleLevel;

//      const hasPermission = await PermissionService.userHasPermission(
//         req.user,
//         "user:change_password"
//       );

//     /* ===============================
//        SELF PASSWORD CHANGE
//     =============================== */
//     if (isSelf) {
//       if (!oldPassword) {
//         throw AppError.badRequest("oldPassword is required");
//       }

//       const isMatch = await bcrypt.compare(oldPassword, targetUser.password);
//       if (!isMatch) {
//         throw AppError.badRequest("Old password is incorrect");
//       }

//       const isSame = await bcrypt.compare(newPassword, targetUser.password);
//       if (isSame) {
//         throw AppError.badRequest("New password cannot be same as old password");
//       }
//     }

//     /* ===============================
//        ADMIN PASSWORD RESET
//     =============================== */
//     else {
//     //   if (![1, 2].includes(roleLevel)) {
//     //     throw AppError.forbidden("You are not allowed to change this user's password");
//     //   }
//     if (!hasPermission) {
//         throw AppError.forbidden("You are not allowed to change this user's password");
//       }
//     }

//     const hashed = await bcrypt.hash(newPassword, 12);

//     await UserService.changePassword(id, hashed);

//     return res.json(ApiResponse.success(null, "Password changed successfully"));
//   } catch (err) {
//     next(err);
//   }
// }

    static async getUserPermissions(req, res, next) {
        try {
            const { id } = req.params;
            const user = await UserService.getUser(id);
            const finalPermissions = await PermissionService.getUserFinalPermissions(user);
            return res.json(ApiResponse.success(finalPermissions, "Fetched user permissions"));
        } catch (err) {
            next(err);
        }
    }
    static async restoreUser(req, res, next) {
        try {
            const restored = await UserService.restoreUser(req.params.id);
            if (!restored) throw AppError.notFound("User not found");
            return res.json(
                ApiResponse.success(restored, "User restored successfully")
            );
        } catch (err) {
            next(err);
        }
    }
    static async getUserTree(req, res, next) {
        try {
            let myId;
            if (req.params.id) {
                myId = req.params.id;
            }
            else {
                myId = req.user._id;
            }
            const myLevel = req.user.role.roleLevel;
            const tree = await UserService.buildUserTree(myId, myLevel);
            return res.json(ApiResponse.success(tree, "User hierarchy fetched successfully"));
        } catch (err) {
            next(err);
        }
    }
    static async changeParentUser(req, res, next) {
        try {
            const { userId, newParentId } = req.body;
            if (!userId || !newParentId) {
                throw AppError.badRequest("userId and newParentId are required");
            }
            const result = await UserService.changeParent(userId, newParentId, req.user);
            return res.json(ApiResponse.success(result, "Parent updated successfully"));
        } catch (err) {
            next(err);
        }
    }
    static async moveSubtree(req, res, next) {
        try {
            const { userId, newParentId } = req.body;
            if (!userId || !newParentId) {
                throw AppError.badRequest("userId and newParentId required");
            }
            const result = await UserService.moveUserSubtree(userId, newParentId, req.user);
            return res.json(ApiResponse.success(result, "Subtree reassigned successfully"));
        } catch (err) {
            next(err);
        }
    }
static async getParentUserDropdown(req, res, next) {
  try {
    const { page = 1, limit = 20, q = "" } = req.query;
    const result = await UserService.getParentUserDropdownPaginated(req.user, {
      page: Number(page),
      limit: Number(limit),
      q
    });
    return res.json(
      ApiResponse.paginated(result, "Parent user dropdown fetched successfully")
    );
  } catch (err) {
    next(err);
  }
}
}