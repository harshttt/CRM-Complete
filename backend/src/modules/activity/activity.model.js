import mongoose from "mongoose";
import BaseModel from "../../models/base.model.js";

const activitySchema = BaseModel({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    enum: [
      "lead_created",
      "batch_ingested",
      "stage_changed",
      "meeting_created",
      "meeting_updated",
      "comment_added",
      "auto_hot",
      "lead_updated_bulk",
      "assigned_to",
      "accepted_assignment",
      "auto_removed",
      "followup_updated",
      "stage_changed_auto_removed",
      "declined_assignment",
      "lock_acquired",
      "lock_released",
      "task_created",
      "task_updated",
      "task_deleted",
      "task_completed",
      "task_missed",
      "meeting_created",
      "meeting_updated",
      "note_added",
      "stage_changed",
      "status_changed",
      "site_visit",
      "email_sent",
      "sms",
      "tags_added",
      "tags_removed",
      "auto_reassign_triggered",
      "bulk_assign",
      "bulk_stage_change",
      "bulk_soft_delete",
      "bulk_permanent_delete",
      "lead_deleted_permanent",
      "auto_removed",
      "lead_locked",
      "lead_restored",
      "Lead restored",
      "lead_deleted",
      "stage_changed_auto_removed",
      "Lead updated", 
      "lead_updated",
      "permanent_lead_deleted",
      "lead_unlocked",
      "comment_updated",
      "Today's comment updated",
      "lead_archived",
      "archived",
    ],
    required: true,
  },

  description: String,
  metadata: mongoose.Schema.Types.Mixed,

  // optional telemetry
  ipAddress: String,
  device: String,
});

// Indexes
activitySchema.index({ lead: 1 });
activitySchema.index({ user: 1 });
activitySchema.index({ type: 1 });
activitySchema.index({ createdAt: -1 });

export default mongoose.model("Activity", activitySchema);
