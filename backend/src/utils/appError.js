export class AppError extends Error {
  constructor(message, statusCode = 400, meta = null) {
    super(message);
    this.statusCode = statusCode;
    this.meta = meta;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, meta) {
    return new AppError(message, 400, meta);
  }

  static unauthorized(message = "Unauthorized", meta) {
    return new AppError(message, 401, meta);
  }

  static forbidden(message = "Forbidden", meta) {
    return new AppError(message, 403, meta);
  }

  static notFound(message = "Not Found", meta) {
    return new AppError(message, 404, meta);
  }

  static conflict(message = "Conflict", meta) {
    return new AppError(message, 409, meta);
  }

  static serverError(message = "Internal Server Error", meta) {
    return new AppError(message, 500, meta);
  }
}
