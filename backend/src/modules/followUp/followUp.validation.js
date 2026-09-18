import Joi from "joi";

const objectId = Joi.string().regex(/^[a-fA-F0-9]{24}$/);

export const createFollowUpSchema = Joi.object({
  meetingId: objectId.required(),
  customerId: objectId.required(),
  title: Joi.string().trim().max(300).required(),
  description: Joi.string().trim().max(2000).allow("").optional(),
  ownerId: objectId.required(),
  dueDate: Joi.date().iso().required(),
});

export const updateFollowUpSchema = Joi.object({
  title: Joi.string().trim().max(300).optional(),
  description: Joi.string().trim().max(2000).allow("").optional(),
  dueDate: Joi.date().iso().optional(),
  status: Joi.string().valid("PENDING", "COMPLETED", "CANCELLED").optional(),
}).min(1);
