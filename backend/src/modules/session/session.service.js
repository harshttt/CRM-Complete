import Session from "./session.model.js";

export class SessionService {
  static async createSession(user, deviceInfo, ip, fcmToken) {
    return Session.create({
      user: user._id,
      deviceId: deviceInfo.deviceId,
      platform: deviceInfo.platform,
      userAgent: deviceInfo.userAgent,
      ip,
      fcmToken,
      isActive: true,
      lastUsedAt: new Date()
    });
  }

  static async deactivateSession(sessionId) {
    return Session.findByIdAndUpdate(sessionId, { isActive: false });
  }

  static async deactivateAllSessions(userId) {
    return Session.updateMany({ user: userId }, { isActive: false });
  }
  static async getActiveSessionForUser(userId) {
    return Session.findOne({ user: userId, isActive: true }).sort({ lastUsedAt: -1 });
  }

}