import Joi from "joi";
import mongoose from "mongoose";

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
});
export const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().allow("", null),
  permissions: Joi.array().items(objectId).default([]),
  roleLevel: Joi.number().integer().min(1).optional().allow(null),
  isSystem: Joi.boolean().default(false)
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  description: Joi.string().allow("", null),
  permissions: Joi.array().items(objectId),
  roleLevel: Joi.number().integer().min(1).optional().allow(null),
  isSystem: Joi.boolean()
});