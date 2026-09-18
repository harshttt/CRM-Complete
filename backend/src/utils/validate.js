
/* middleware factory */
export function validateBody(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    if (error) return next(error);
    next();
  };
}
export function validateQuery(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true,
    });
    if (error) return next(error);
    next();
  };
}







