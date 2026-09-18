import mongoose from "mongoose";
import BaseModel from "../../models/base.model.js";
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_TYPES,
} from "./notification.constants.js";

const notificationSchema = BaseModel({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  type: {
    type: String,
    enum: Object.values(NOTIFICATION_TYPES),
    required: true,
  },

  channelId: {
    type: String,
    enum: Object.values(NOTIFICATION_CHANNELS),
    required: true,
    index: true,
  },

  redirectUrl: {
    type: String,
    trim: true,
  },

  title: {
    type: String,
    trim: true,
  },

  message: {
    type: String,
    trim: true,
  },

  status: {
    type: String,
    enum: ["pending", "sent", "read", "dismissed"],
    default: "pending",
    index: true,
  },

  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },

  isDismissed: {
    type: Boolean,
    default: false,
    index: true,
  },

  scheduledFor: {
    type: Date,
    index: true,
  },

  retryCount: {
    type: Number,
    default: 0,
  },

  maxRetries: {
    type: Number,
    default: 3,
  },

  allowResend: {
    type: Boolean,
    default: false,
  },

  lastSentAt: {
    type: Date,
  },

  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  },

  dedupeKey: {
    type: String,
    index: true,
  },

  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, scheduledFor: 1 });
notificationSchema.index({ user: 1, channelId: 1 });
notificationSchema.index({ user: 1, entityId: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
