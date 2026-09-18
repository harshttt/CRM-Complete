import mongoose from "mongoose";
import { COMMENT_ENUMS } from "../../constants/comment.constants.js";

const leadCommentSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    comment: { type: String, default: "" },
    conversationType: {
      type: String,
      enum: Object.values(COMMENT_ENUMS.CONVERSATION_TYPE),
      default: COMMENT_ENUMS.CONVERSATION_TYPE.OTHER,
    },
    commentType: {
      type: String,
      enum: Object.values(COMMENT_ENUMS.COMMENT_TYPE),
      default: COMMENT_ENUMS.COMMENT_TYPE.GENERAL,
    },
    stage: { type: String, default: null }, // FRESH, CONTACTED, etc.

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

// Indexes
leadCommentSchema.index({ leadId: 1, createdAt: -1 });

export default mongoose.model("LeadComment", leadCommentSchema);
