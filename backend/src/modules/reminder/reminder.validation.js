import Joi from "joi";
import { parseToUtc } from "../../utils/date.util.js";

const futureDate = (value, helpers) => {
  const date = parseToUtc(value);
  if (date <= new Date()) {
    return helpers.message("remindAt must be a future date/time");
  }
  return value;
};

export const createReminderSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().allow("", null),
  entityType: Joi.string().allow(null),
  entityId: Joi.string().allow(null),
  remindAt: Joi.string()
    .required()
    .custom(futureDate)
    .messages({
      "any.required": "remindAt is required (DD/MM/YYYY hh:mm:ss AM/PM)"
    })
});

export const updateReminderSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().allow("", null),
  entityType: Joi.string().allow(null),
  entityId: Joi.string().allow(null),
  remindAt: Joi.string().custom(futureDate)
});
