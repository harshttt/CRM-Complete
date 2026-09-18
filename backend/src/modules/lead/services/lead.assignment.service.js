import { UserService } from "../../user/user.service.js";

export class LeadAssignmentService {


  
  /* =========================
   * CAN ASSIGN
   * ========================= */
  static async canAssign(requester, targetUserId) {
    if (!requester) return false;
    const role = requester.role?.roleLevel;

     /**
     * ROLE LEVEL LOGIC
     * 1 = Super Admin
     * 2 = Admin
     * 3 = Manager / Team Lead
     * 4 = Sales Executive / BDM
     */

     if (role === 1 || role === 2) return true;
     if (role === 4) return false;


    const targetUser = await UserService.getUser(targetUserId);
    if (!targetUser) return false;

    if (role === 3) {
      if (String(requester._id) === String(targetUserId)) return true;

      return (
        String(targetUser.parentUser) === String(requester._id) ||
        (targetUser.ancestorIds || []).some(
          (id) => String(id) === String(requester._id)
        )
      );
    }

    return false;
  }
}
