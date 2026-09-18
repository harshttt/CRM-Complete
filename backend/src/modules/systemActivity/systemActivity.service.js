import SystemActivity from "./systemActivity.model.js";

class SystemActivityService {
  /**
   * Log any activity in system
   */
  static async log({
    user,
    session,
    category,
    action,
    description,
    ip,
    userAgent,
    platform,
    path,
    method,
    metadata,
    success = true,
    statusCode
  }) {
    try {
      await SystemActivity.create({
        user,
        session,
        category,
        action,
        description,
        ip,
        userAgent,
        platform,
        path,
        method,
        metadata,
        success,
        statusCode
      });
    } catch (err) {
      console.error("SystemActivity log failed:", err);
    }
  }

  /**
   * Shortcut for Auth activities
   */
  static async auth({ user, session, action, description, ip, userAgent, platform, success = true }) {
    return this.log({
      user,
      session,
      category: "auth",
      action,
      description,
      ip,
      userAgent,
      platform,
      success
    });
  }

  /**
   * Shortcut for APIs
   */
  static async api({ user, action, path, method, ip, userAgent, metadata, statusCode, success = true }) {
    return this.log({
      user,
      category: "api",
      action,
      path,
      method,
      ip,
      userAgent,
      metadata,
      statusCode,
      success
    });
  }

  /**
   * Shortcut for UI actions
   */
  static async ui({ user, action, description, metadata }) {
    return this.log({
      user,
      category: "ui",
      action,
      description,
      metadata
    });
  }

  /**
   * Shortcut for socket events
   */
  static async socket({ user, action, description, metadata }) {
    return this.log({
      user,
      category: "socket",
      action,
      description,
      metadata
    });
  }

  /**
   * Shortcut for security events
   */
  static async security({ user, action, description, ip, userAgent }) {
    return this.log({
      user,
      category: "security",
      action,
      description,
      ip,
      userAgent
    });
  }
}

export default SystemActivityService;
