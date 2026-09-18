import { UserService } from "../user/user.service.js";


 //Build task visibility filter based on requester role & hierarchy
export async function buildTaskVisibilityFilter(requester) {
  const role = requester.role?.roleLevel;
  console.log("role", role);
  const userId = requester._id;

  /**
   * ROLE LEVEL LOGIC
   * 1 = Super Admin
   * 2 = Admin
   * 3 = Manager / Team Lead
   * 4 = Sales / BDM
   */

  if (role === 1) return {};

  if ([2, 3].includes(role)) {
    const members = await UserService.getTeamMemberIds(userId);
    const allUsers = [...members, userId];

    return {
      $or: [
        { assignedTo: { $in: allUsers } },
        { createdBy: { $in: allUsers } },
      ],
    };
  }

  if (role === 4) {
    return { assignedTo: userId };
  }

  // Default fallback
  return { assignedTo: userId };
}


 // Check if requester can delete the task
export function canDeleteTask(task, requester) {
  const role = requester.role?.roleLevel;

  // Admins always allowed
  if ([1, 2].includes(role)) {
    return true;
  }

  // Task creator can delete
  if (String(task.createdBy) === String(requester._id)) {
    return true;
  }

  // Hierarchy: requester is ancestor of task creator
  if (
    Array.isArray(requester.ancestorIds) &&
    requester.ancestorIds.some((id) => String(id) === String(task.createdBy))
  ) {
    return true;
  }

  return false;
}
