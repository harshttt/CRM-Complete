import mongoose from "mongoose";
import BaseModel from "../../models/base.model.js";
import { REMINDER_ENTITY_TYPES } from "./reminder.constants.js";

const reminderSchema = BaseModel({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  entityType: {
    type: String,
    enum: Object.values(REMINDER_ENTITY_TYPES),
    default: REMINDER_ENTITY_TYPES.OTHER,
    index: true
  },

  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  remindAt: {
    type: Date,
    required: true,
    index: true
  },

  isCompleted: {
    type: Boolean,
    default: false,
    index: true
  }
});

export default mongoose.model("Reminder", reminderSchema);
