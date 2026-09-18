import mongoose from "mongoose";
import BaseModel from "../../models/base.model.js";

export const LEGAL_TYPES = {
  PRIVACY: "PRIVACY",
  TERMS: "TERMS",
  COOKIE: "COOKIE",
  REFUND: "REFUND",
  DELETE_ACCOUNT: "DELETE_ACCOUNT"
};

export const LEGAL_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
};

const legalSchema = BaseModel({
  type: {
    type: String,
    enum: Object.values(LEGAL_TYPES),
    required: true,
  },

  title: {
    type: String,
    required: true,
    trim: true,
  },

  content: {
    type: String,
    required: true,
  },

  version: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: Object.values(LEGAL_STATUS),
    default: LEGAL_STATUS.DRAFT,
  },

  publishedAt: {
    type: Date,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

/* Only one published doc per type */
legalSchema.index(
  { type: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "PUBLISHED" } }
);

legalSchema.index({ type: 1, version: 1 });

export default mongoose.model("Legal", legalSchema);