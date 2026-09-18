import { AppError } from "../utils/appError.js";

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map((err) => err.message);
      return next(AppError.badRequest("Validation failed", { details }));
    }
    next();
  };
};
