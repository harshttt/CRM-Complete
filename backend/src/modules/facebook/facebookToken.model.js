import mongoose from "mongoose";
import BaseModel from "../../models/base.model.js";

const schema = BaseModel({
  provider: { type: String, default: "facebook" },
  pageId: String,
  accessToken: String,
  // expiresAt: Date,
});

export default mongoose.model("IntegrationToken", schema);
