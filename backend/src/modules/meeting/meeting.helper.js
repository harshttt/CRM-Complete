export function computeMeetingStatus(meeting) {
  if (meeting.status === "cancelled") return "cancelled";

  const now = new Date();
  const endTime = new Date(
    new Date(meeting.scheduledAt).getTime() +
    meeting.durationMinutes * 60000
  );

  if (now > endTime) return "completed";
  return "scheduled";
}
