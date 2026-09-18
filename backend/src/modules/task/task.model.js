import mongoose from "mongoose";
import BaseModel from "../../models/base.model.js";
import { TASK_ENUMS } from "../../constants/task.constants.js";

const taskSchema = BaseModel({
  title: { type: String, required: true },
  description: String,
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
    required: false,
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  type: {
    type: String,
    enum: Object.values(TASK_ENUMS.TYPE),
    required: true,
  },

  status: {
    type: String,
    enum: Object.values(TASK_ENUMS.STATUS),
    default: TASK_ENUMS.STATUS.FRESH,
  },

  priority: {
    type: String,
   enum: Object.values(TASK_ENUMS.PRIORITY),
    default: TASK_ENUMS.PRIORITY.MEDIUM,
  },

  
  reminderAt: Date, // new
  reminderSent: {type: Boolean,default: false},
  dueDate: { type: Date, required: true },
  followUpType: String, // new - e.g., "first_followup", "second_followup"

  completedAt: Date,

  tags: [String],

  // System flags
  isSystemGenerated: { type: Boolean, default: false },
});

// -----------------------------------
// INDEXES
// -----------------------------------
taskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });
taskSchema.index({ lead: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ createdAt: -1 , updatedAt: -1});

export default mongoose.model("Task", taskSchema);
