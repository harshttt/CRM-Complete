import logger from "../utils/logger.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AppError } from "../utils/appError.js";

export const globalErrorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    meta: err.meta || null
  });

  const status = err.statusCode || 500;

  return res.status(status).json(
    ApiResponse.error(
      err.message || "Internal Server Error",
      err.meta || null
    )
  );
};
