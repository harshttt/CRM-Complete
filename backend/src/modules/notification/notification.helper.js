import { NotificationService } from "./notification.service.js";
import { formatIst } from "../../utils/date.util.js";
import { NOTIFICATION_CHANNELS, NOTIFICATION_TYPES} from "./notification.constants.js";

/* ================= REDIRECT URL ================= */

export function buildRedirectUrl(channelId, entityId) {
  switch (channelId) {
    case "TASK_DETAIL":
      return `/app/tasks/${entityId}`;
    case "MEETING_DETAIL":
      return `/app/meetings/${entityId}`;
    case "LEAD_DETAIL":
      return `/app/leads/${entityId}`;
    case "TASK_LIST":
      return `/app/tasks`;
    case "MEETING_LIST":
      return `/app/meetings`;
    case "LEAD_LIST":
      return `/app/leads`;
    default:
      return `/app`;
  }
}

/* ================= HELPERS ================= */

function getMeetingUserIds(meeting) {
  const ids = new Set();

  if (meeting.assignedTo) {
    ids.add(meeting.assignedTo.toString());
  }

  if (Array.isArray(meeting.participants)) {
    meeting.participants.forEach(p => {
      if (p.type === "user" && p.user) {
        ids.add(p.user.toString());
      }
    });
  }

  return Array.from(ids);
}

function buildMeetingMeetMetadata(meeting) {
  if (
    meeting.status === "scheduled" ||
    meeting.status === "checked_in"
  ) {
    return {
      meetingId: meeting._id,
      meetLink: meeting.calendar?.meetLink ?? null,
      scheduledAt: meeting.scheduledAt
        ? formatIst(meeting.scheduledAt)
        : null   
       };
  }
  return null;
}

/* ================= NOTIFIERS ================= */

export async function notifyMeetingCreated(meeting) {
  const userIds = getMeetingUserIds(meeting);
  if (userIds.length === 0) return;

  await NotificationService.createForUsers(userIds, {
    type: NOTIFICATION_TYPES.MEETING,
    channelId: NOTIFICATION_CHANNELS.MEETING_DETAIL,
    entityId: meeting._id,
    title: "Meeting Scheduled",
    message: `Meeting "${meeting.title}" scheduled at ${formatIst(
      meeting.scheduledAt
    )}`,
    metadata: {
      meet: buildMeetingMeetMetadata(meeting)
    },
    dedupeKeyPrefix: `meeting_created:${meeting._id}`
  });
}

export async function notifyMeetingUpdated(meeting, user) {
  const userIds = getMeetingUserIds(meeting);
  if (userIds.length === 0) return;

  await NotificationService.createForUsers(userIds, {
    type: NOTIFICATION_TYPES.MEETING,
    channelId: NOTIFICATION_CHANNELS.MEETING_DETAIL,
    entityId: meeting._id,
    title: "Meeting Updated",
    message: `Meeting "${meeting.title}" has been updated`,
    metadata: {
      action: "UPDATED",
      updatedBy: user._id,
      meet: buildMeetingMeetMetadata(meeting)
    },
    dedupeKeyPrefix: `meeting_updated:${meeting._id}`
  });
}

export async function notifyMeetingCancelled(meeting, user) {
  const userIds = getMeetingUserIds(meeting);
  if (userIds.length === 0) return;

  await NotificationService.createForUsers(userIds, {
    type: NOTIFICATION_TYPES.MEETING,
    channelId: NOTIFICATION_CHANNELS.MEETING_DETAIL,
    entityId: meeting._id,
    title: "Meeting Cancelled",
    message: `Meeting "${meeting.title}" has been cancelled`,
    metadata: {
      meet: null,
      cancelledBy: user._id
    },
    dedupeKeyPrefix: `meeting_cancelled:${meeting._id}`
  });
}


// Task Notifications
// function getTaskUserIds(task) {

//   const ids = new Set();

//   if (task.assignedTo) {
//     ids.add(task.assignedTo.toString());
//   }

//   return Array.from(ids);
// }

export function getTaskUserIds(task) {
  const ids = new Set();

  if (task?.assignedTo) {
    const assignedUserId =
      typeof task.assignedTo === "object"
        ? task.assignedTo._id
        : task.assignedTo;

    if (assignedUserId) {
      ids.add(assignedUserId.toString());
    }
  }

  return Array.from(ids);
}



// Task Created
export async function notifyTaskCreated(task, user) {

   if (["missed", "completed"].includes(task.status)) return;
  const userIds = getTaskUserIds(task);
  if (userIds.length === 0) return;

  await NotificationService.createForUsers(userIds, {
    type: NOTIFICATION_TYPES.TASK,
    channelId: NOTIFICATION_CHANNELS.TASK_DETAIL,
    entityId: task._id,
    title: "New Task Assigned",
    message: `Task "${task.title}" assigned, due ${formatIst(task.dueDate)}`,
    metadata: {
      taskId: task._id,
      assignedBy: user._id,
      dueDate: task.dueDate
    },
    dedupeKeyPrefix: `task_created:${task._id}`
  });

  console.log("Notification sent for task:", task._id);

}


//Task Updated
export async function notifyTaskUpdated(task, user) {
   if (["missed", "completed"].includes(task.status)) return;
  const userIds = getTaskUserIds(task);
  if (userIds.length === 0) return;

  await NotificationService.createForUsers(userIds, {
    type: NOTIFICATION_TYPES.TASK,
    channelId: NOTIFICATION_CHANNELS.TASK_DETAIL,
    entityId: task._id,
    title: "Task Updated",
    message: `Task "${task.title}" has been updated`,
    metadata: {
      action: "UPDATED",
      taskId: task._id,
      updatedBy: user._id
    },
    dedupeKeyPrefix: `task_updated:${task._id}`
  });
}


// Task Completed
export async function notifyTaskCompleted(task, user) {
  const userIds = getTaskUserIds(task);
  if (userIds.length === 0) return;

  await NotificationService.createForUsers(userIds, {
    type: NOTIFICATION_TYPES.TASK,
    channelId: NOTIFICATION_CHANNELS.TASK_DETAIL,
    entityId: task._id,
    title: "Task Completed",
    message: `Task "${task.title}" completed`,
    metadata: {
      action: "COMPLETED",
      taskId: task._id,
      completedBy: user._id
    },
    dedupeKeyPrefix: `task_completed:${task._id}`
  });
}


//Task Deleted 
export async function notifyTaskDeleted(task, user) {
  const userIds = getTaskUserIds(task);
  if (userIds.length === 0) return;

  await NotificationService.createForUsers(userIds, {
    type: NOTIFICATION_TYPES.TASK,
    channelId: NOTIFICATION_CHANNELS.TASK_LIST,
    entityId: task._id,
    title: "Task Deleted",
    message: `Task "${task.title}" has been deleted`,
    metadata: {
      action: "DELETED",
      taskId: task._id,
      deletedBy: user._id
    },
    dedupeKeyPrefix: `task_deleted:${task._id}`
  });
}


//Lead Notifications
function getLeadUserIds(lead) {
  const ids = new Set();

  if (lead.assignedTo) {
    ids.add(lead.assignedTo.toString());
  }

  if (lead.currentOwner) {
    ids.add(lead.currentOwner.toString());
  }

  return Array.from(ids);
}

// Lead Created
export async function notifyLeadCreated(lead, user) {
  const userIds = getLeadUserIds(lead);
  if (!userIds.length) return;

  await NotificationService.createForUsers(userIds, {
    type: NOTIFICATION_TYPES.LEAD,
    channelId: NOTIFICATION_CHANNELS.LEAD_DETAIL,
    entityId: lead._id,
    title: "New Lead Created",
    message: `Lead "${lead.fullName}" has been created`,
    metadata: {
      leadId: lead._id,
      createdBy: user._id,
    },
    dedupeKeyPrefix: `lead_created:${lead._id}`,
  });
}

// Lead Assigned
export async function notifyLeadAssigned(lead, oldAssignee, user) {
  const userIds = getLeadUserIds(lead);
  if (!userIds.length) return;

  await NotificationService.createForUsers(userIds, {
    type: NOTIFICATION_TYPES.LEAD,
    channelId: NOTIFICATION_CHANNELS.LEAD_DETAIL,
    entityId: lead._id,
    title: "Lead Assigned",
    message: `Lead "${lead.fullName}" has been assigned to you`,
    metadata: {
      leadId: lead._id,
      oldAssignee,
      assignedBy: user._id,
    },
    dedupeKeyPrefix: `lead_assigned:${lead._id}`,
  });
}


// Lead Stage Updated
export async function notifyLeadStageChanged(lead, oldStage, user) {
  const userIds = getLeadUserIds(lead);
  if (!userIds.length) return;

  await NotificationService.createForUsers(userIds, {
    type: NOTIFICATION_TYPES.LEAD,
    channelId: NOTIFICATION_CHANNELS.LEAD_DETAIL,
    entityId: lead._id,
    title: "Lead Stage Updated",
    message: `Lead moved from ${oldStage} → ${lead.stage}`,
    metadata: {
      leadId: lead._id,
      oldStage,
      newStage: lead.stage,
      updatedBy: user._id,
    },
    dedupeKeyPrefix: `lead_stage:${lead._id}`,
  });
}

// Lead Comment Added
export async function notifyLeadCommentAdded(lead, user) {
  const userIds = getLeadUserIds(lead);
  if (!userIds.length) return;

  await NotificationService.createForUsers(userIds, {
    type: NOTIFICATION_TYPES.LEAD,
    channelId: NOTIFICATION_CHANNELS.LEAD_DETAIL,
    entityId: lead._id,
    title: "New Comment on Lead",
    message: `A new comment was added on "${lead.fullName}"`,
    metadata: {
      leadId: lead._id,
      commentedBy: user._id,
    },
    dedupeKeyPrefix: `lead_comment:${lead._id}`,
  });
}



// Lead Archived / Removed
// export async function notifyLeadArchived(lead, user, reason) {
//   const userIds = getLeadUserIds(lead);
//   if (!userIds.length) return;

//   await NotificationService.createForUsers(userIds, {
//     type: NOTIFICATION_TYPES.LEAD,
//     channelId: NOTIFICATION_CHANNELS.LEAD_LIST,
//     entityId: lead._id,
//     title: "Lead Archived",
//     message: `Lead "${lead.fullName}" archived (${reason})`,
//     metadata: {
//       leadId: lead._id,
//       reason,
//       archivedBy: user,
//     },
//     dedupeKeyPrefix: `lead_archived:${lead._id}`,
//   });
// }






