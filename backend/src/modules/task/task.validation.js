import Joi from "joi";
import mongoose from "mongoose";


/* ObjectId validator */
const objectId = Joi.string().custom((val, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(val)) {
    return helpers.error("any.invalid");
  }
  return val;
}, "ObjectId validation");

/* CREATE TASK */
export const createTaskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  lead: objectId.optional(),
  assignedTo: objectId.optional(),
  type: Joi.string().valid("call", "meeting", "follow-up", "email", "document", "site_visit").required(),
  priority: Joi.string().valid("low", "medium", "high", "urgent").default("medium"),
  dueDate: Joi.date().required(),
  reminderAt: Joi.date().optional().allow(null),
  followUpType: Joi.string().optional().allow(""),
  tags: Joi.array().items(Joi.string()).optional(),
});

/* UPDATE TASK */
export const updateTaskSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional().allow(""),
  assignedTo: objectId.optional(),
  type: Joi.string().valid("call", "meeting", "follow-up", "email", "document", "site_visit").optional(),
  status: Joi.string().valid("fresh", "in-progress", "completed", "missed").optional(),
  priority: Joi.string().valid("low", "medium", "high", "urgent").optional(),
  dueDate: Joi.date().optional(),
  reminderAt: Joi.date().optional().allow(null),
  tags: Joi.array().items(Joi.string()).optional(),
});

/* LIST TASKS */
export const listTaskQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.string().optional(),
  priority: Joi.string().optional(),
  type: Joi.string().optional(),
  assignedTo: objectId.optional(),
  lead: objectId.optional(),
});
