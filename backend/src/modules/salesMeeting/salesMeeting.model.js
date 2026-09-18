import mongoose from "mongoose";
import BaseModel from "../../models/base.model.js";

// ============ Attendance Session Sub-schema ============
const attendanceSessionSchema = new mongoose.Schema(
  {
    checkInAt: { type: Date, default: null },
    checkOutAt: { type: Date, default: null },
    checkInLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    checkOutLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
  },
  { _id: true, timestamps: false }
);

// ============ Sales Meeting Schema ============
const MEETING_STATUSES = [
  "SCHEDULED",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_PROGRESS",
  "COMPLETED",
  "REOPENED",
  "CANCELLED",
];

const salesMeetingSchema = BaseModel({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
    index: true,
  },
  purpose: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  scheduledStart: {
    type: Date,
    required: true,
  },
  scheduledEnd: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    trim: true,
    maxlength: 500,
    default: "",
  },
  assignedEmployeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  notes: {
    type: String,
    maxlength: 2000,
    default: "",
  },
  status: {
    type: String,
    enum: MEETING_STATUSES,
    default: "SCHEDULED",
  },
  outcome: {
    type: String,
    trim: true,
    default: null,
  },
  cancelReason: {
    type: String,
    trim: true,
    maxlength: 500,
    default: "",
  },
  attendanceSessions: [attendanceSessionSchema],
});

// ============ Indexes ============
salesMeetingSchema.index({ assignedEmployeeId: 1, status: 1 });
salesMeetingSchema.index({ assignedEmployeeId: 1, scheduledStart: 1, scheduledEnd: 1 });
salesMeetingSchema.index({ customerId: 1 });
salesMeetingSchema.index({ scheduledStart: 1 });
salesMeetingSchema.index({ status: 1 });

export { MEETING_STATUSES };
export default mongoose.model("SalesMeeting", salesMeetingSchema);
