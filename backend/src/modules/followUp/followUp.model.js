import mongoose from "mongoose";
import BaseModel from "../../models/base.model.js";

const FOLLOW_UP_STATUSES = ["PENDING", "COMPLETED", "CANCELLED"];

const followUpSchema = BaseModel({
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SalesMeeting",
    required: true,
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: "",
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: FOLLOW_UP_STATUSES,
    default: "PENDING",
  },
});

followUpSchema.index({ ownerId: 1, status: 1 });
followUpSchema.index({ dueDate: 1 });

export { FOLLOW_UP_STATUSES };
export default mongoose.model("FollowUp", followUpSchema);
