import Session from "./session.model.js";
import crypto from "crypto";

export class SessionService {
  static hashRefreshToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

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

  static async saveRefreshToken(sessionId, refreshToken, expiresAt) {
    return Session.findByIdAndUpdate(sessionId, {
      refreshTokenHash: this.hashRefreshToken(refreshToken),
      refreshTokenExpiresAt: expiresAt,
      lastUsedAt: new Date(),
    });
  }

  static async rotateRefreshToken(sessionId, previousHash, refreshToken, expiresAt) {
    return Session.findOneAndUpdate(
      {
        _id: sessionId,
        isActive: true,
        refreshTokenHash: previousHash,
        $or: [
          { refreshTokenExpiresAt: null },
          { refreshTokenExpiresAt: { $gt: new Date() } },
        ],
      },
      {
        refreshTokenHash: this.hashRefreshToken(refreshToken),
        refreshTokenExpiresAt: expiresAt,
        lastUsedAt: new Date(),
      },
      { new: true }
    );
  }

  static async getSessionForRefresh(sessionId) {
    return Session.findOne({ _id: sessionId, isActive: true })
      .select("+refreshTokenHash");
  }

  static async deactivateAllSessions(userId) {
    return Session.updateMany({ user: userId }, { isActive: false });
  }
  static async getActiveSessionForUser(userId) {
    return Session.findOne({ user: userId, isActive: true }).sort({ lastUsedAt: -1 });
  }

}