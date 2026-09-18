import mongoose from "mongoose";
import { UserService } from "../../user/user.service.js";

export class LeadVisibilityService {

  
  /* =========================
   * BUILD VISIBILITY FILTER
   * ========================= */
  static async buildVisibilityFilter(requester) {
    if (!requester) {
      return { status: { $nin: ["auto_removed", "archived"] } };
    }

    const role = requester.role?.roleLevel;
    const userId = requester._id;


        /**
     * ROLE LEVEL MEANING
     * 1 = Super Admin
     * 2 = Admin
     * 3 = Manager / TL
     * 4 = Sales / BDM
     */

    if (role === 1) return {};


    if (role === 2) {
      const members = await UserService.getTeamMemberIds(userId);
      const allUsers = [...members, userId];

      return {
        // status: { $ne: "auto_removed" },
        $or: [
          { assignedTo: { $in: allUsers } },
          { currentOwner: { $in: allUsers } },
          // { createdBy: { $in: allUsers } },
            //SYSTEM / META LEADS (GLOBAL ADMIN VISIBILITY)
          { ownerType: "system" },
          { source: "meta" },
        ],
      };
    }

    if (role === 3) {
      const members = await UserService.getTeamMemberIds(userId);
      const allUsers = [...members, userId];

      return {
        status: { $ne: "auto_removed" },
        $or: [
          { assignedTo: { $in: allUsers } },
          { currentOwner: { $in: allUsers } },
          // { createdBy: { $in: allUsers } },
        ],
      };
    }

    if (role === 4) {
      return {
        assignedTo: userId,
        status: { $ne: "auto_removed" },
      };
    }

    // DEFAULT only own leads
    return {
      assignedTo: userId,
      // status: { $ne: "auto_removed" },
      status: "active",
    };
  }
}
