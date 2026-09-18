import mongoose from "mongoose";
import BaseModel from "../../models/base.model.js";

const meetingSchema = BaseModel({
  // ================= RELATIONS =================
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
    default: null,
    index: true,
  },

  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    default: null,
    index: true,
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  // ================= CORE DATA =================
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },

  notes: {
    type: String,
    maxlength: 2000,
    default: "",
  },

  scheduledAt: {
    type: Date,
    required: true,
    index: true,
  },

  durationMinutes: {
    type: Number,
    default: 30,
    min: 5,
    max: 480,
  },

  type: {
    type: String,
    enum: ["virtual", "in_person"],
    default: "virtual",
  },

  status: {
    type: String,
    enum: ["scheduled", "checked_in", "completed", "cancelled", "checked_out"],
    default: "scheduled",
  },

  // ================= PARTICIPANTS =================
  participants: [
    {
      type: {
        type: String,
        enum: ["user", "external"],
        required: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
      },
      name: {
        type: String,
        trim: true,
      },
    },
  ],

  // ================= CALENDAR =================
  calendar: {
    provider: { type: String },
    eventId: String,
    meetLink: String,
  },
});

// ================= INDEXES =================
meetingSchema.index({ assignedTo: 1, scheduledAt: -1 });
meetingSchema.index({ status: 1, scheduledAt: 1 });
meetingSchema.index({ title: "text" });

export default mongoose.model("Meeting", meetingSchema);
