import SystemActivityService from "../modules/systemActivity/systemActivity.service.js";
const AUTH_EXCLUDE_PATHS = [
  "/api/auth/login",
  "/api/auth/logout"
];

export function activityLogger(req, res, next) {
  const start = Date.now();
  if (AUTH_EXCLUDE_PATHS.includes(req.path)) {
    return next();
  }
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    const duration = Date.now() - start;
    const userId = req.user?._id || null;
    const sessionId = req.headers["x-session-id"] || null;
    SystemActivityService.api({
      user: userId,
      action: `${req.method} ${req.path}`,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      metadata: {
        body: req.body,
        query: req.query,
        durationMs: duration
      },
      statusCode: res.statusCode,
      success: res.statusCode < 400
    });
    return originalJson(data);
  };
  next();
}