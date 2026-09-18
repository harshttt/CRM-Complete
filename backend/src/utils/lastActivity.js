// utils/lastActivity.js

export function getLastActivityInfo(lead) {
  if (!lead || !lead.lastActivityAt) return null;

  const lastActivityAt = new Date(lead.lastActivityAt);

  let info = {
    type: "updated",
    text: "Lead updated",
    at: lastActivityAt,
  };

  // Last Comment
  if (lead.lastComment && lead.lastComment.createdAt) {
    if (
      new Date(lead.lastComment.createdAt).getTime() ===
      lastActivityAt.getTime()
    ) {
      return {
        type: "comment",
        text: lead.lastComment.comment || "New comment added",
        at: lastActivityAt,
      };
    }
  }

  //Stage Change
  if (lead.stageHistory && lead.stageHistory.length > 0) {
    const lastStage = lead.stageHistory[lead.stageHistory.length - 1];
    if (
      new Date(lastStage.changedAt).getTime() === lastActivityAt.getTime()
    ) {
      return {
        type: "stage_change",
        text: `Stage changed to ${lead.stage}`,
        at: lastActivityAt,
      };
    }
  }

  //Assignment Change
  if (lead.assignmentHistory && lead.assignmentHistory.length > 0) {
    const lastAssign = lead.assignmentHistory[lead.assignmentHistory.length - 1];
    if (
      new Date(lastAssign.changedAt).getTime() === lastActivityAt.getTime()
    ) {
      return {
        type: "assignment",
        text: `Assigned to ${lead.currentOwnerRole || "user"}`,
        at: lastActivityAt,
      };
    }
  }

  return info;
}
