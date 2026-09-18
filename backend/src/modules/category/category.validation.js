import Joi from "joi";

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().allow("", null),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().allow("", null),
});

export function validateBody(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) return next(error);
    next();
  };
}

