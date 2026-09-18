import mongoose from "mongoose";
import BaseModel from "../../models/base.model.js";
import { LEAD_ENUMS } from "../../constants/lead.constants.js";

const schema = BaseModel({
    provider: { type: String, default: "facebook" },
    leadGenId: { type: String, index: true },
    pageId: String,
    formId: String, 

     webhookPayload: { type: Object },

    status: {
      type: String,
      enum: ["pending", "processing", "done", "failed"],
      default: "pending",
    },
    attempts: { type: Number, default: 0 },
    lastError: String,
    lockedAt: Date,  
    receivedAt: Date,
  });

schema.index({ status: 1, createdAt: 1 });

export default mongoose.model("FacebookWebhookEvent", schema);

