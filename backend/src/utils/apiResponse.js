export class ApiResponse {
  static success(data = null, message = "Success") {
    return {
      success: true,
      message,
      data,
    };
  }

  static paginated(result, message = "Success") {
    const { items = [], data = [], page = 1, limit = 20, total = 0 } = result;

    const list = items.length ? items : data; // auto-detect

    return {
      success: true,
      message,
      page,
      total,
      limit,
      totalPages: Math.ceil(total / limit),
      data: list,
    };
  }

  static error(message = "Error", meta = null) {
    return {
      success: false,
      message,
      meta,
    };
  }
}
