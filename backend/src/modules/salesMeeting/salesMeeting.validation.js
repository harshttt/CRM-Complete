import Joi from "joi";

const objectId = Joi.string().regex(/^[a-fA-F0-9]{24}$/);

export const createMeetingSchema = Joi.object({
  customerId: objectId.required(),
  purpose: Joi.string().trim().max(500).required(),
  scheduledStart: Joi.date().iso().required(),
  scheduledEnd: Joi.date().iso().greater(Joi.ref("scheduledStart")).required()
    .messages({ "date.greater": "scheduledEnd must be after scheduledStart" }),
  location: Joi.string().trim().max(500).allow("").optional(),
  assignedEmployeeId: objectId.required(),
  notes: Joi.string().max(2000).allow("").optional(),
});

export const updateMeetingSchema = Joi.object({
  purpose: Joi.string().trim().max(500).optional(),
  scheduledStart: Joi.date().iso().optional(),
  scheduledEnd: Joi.date().iso().optional(),
  location: Joi.string().trim().max(500).allow("").optional(),
  notes: Joi.string().max(2000).allow("").optional(),
  customerId: objectId.optional(),
  assignedEmployeeId: objectId.optional(),
}).min(1);

export const checkInSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

export const checkOutSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

export const completeSchema = Joi.object({
  outcome: Joi.string()
    .trim()
    .valid(
      "INTERESTED",
      "FOLLOW_UP_REQUIRED",
      "PROPOSAL_REQUESTED",
      "NOT_INTERESTED",
      "UNABLE_TO_MEET"
    )
    .required()
    .messages({
      "any.only":
        "Outcome must be one of: INTERESTED, FOLLOW_UP_REQUIRED, PROPOSAL_REQUESTED, NOT_INTERESTED, UNABLE_TO_MEET",
    }),
  followUp: Joi.object({
    title: Joi.string().trim().max(300).required(),
    description: Joi.string().trim().max(2000).allow("").optional(),
    ownerId: objectId.optional(),
    dueDate: Joi.date().iso().required(),
  }).optional(),
});

export const cancelSchema = Joi.object({
  reason: Joi.string().trim().max(500).allow("").optional(),
});
