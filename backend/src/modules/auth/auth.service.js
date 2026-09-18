import { AppError } from "../../utils/appError.js";
import { SessionService } from "../session/session.service.js";
import { UserService } from "../user/user.service.js";
import { JwtService } from "../../utils/jwtService.js";
import { PermissionService } from "../permission/permission.service.js";

export class AuthService {
  static async login({ emailOrPhone, password, deviceInfo, ip, fcmToken }) {
    const user = await UserService.validateCredentials(emailOrPhone, password);
    if (user.isDeleted) {
      throw AppError.badRequest("Account Does Not Exist");
    }
    if (!user.active) {
      throw AppError.unauthorized("Account is deactivated. Contact admin.");
    }
    const session = await SessionService.createSession(user, deviceInfo, ip, fcmToken);
    const tokens = await JwtService.generateAccessAndRefreshTokens(user._id, session._id);
    await SessionService.saveRefreshToken(session._id, tokens.refreshToken, refreshExpiryDate());
    await UserService.onLogin(user);
    const finalPermissions = await PermissionService.getUserFinalPermissions(user, true);
    return {
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        role: {
          id: user.role._id,
          name: user.role.name,
          roleLevel: user.role.roleLevel
        },
        permissions: finalPermissions
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId: session._id
    };
  }

  static async refresh(refreshToken) {
    if (!refreshToken) throw AppError.unauthorized("Refresh token is required");

    let payload;
    try {
      payload = JwtService.verifyRefreshToken(refreshToken);
    } catch {
      throw AppError.unauthorized("Invalid or expired refresh token");
    }

    if (payload.type !== "refresh" || !payload.sid) {
      throw AppError.unauthorized("Invalid refresh token");
    }

    const session = await SessionService.getSessionForRefresh(payload.sid);
    if (!session || session.user.toString() !== payload.id.toString()) {
      throw AppError.unauthorized("Refresh session is no longer active");
    }

    const tokenHash = SessionService.hashRefreshToken(refreshToken);
    if (session.refreshTokenHash !== tokenHash ||
        (session.refreshTokenExpiresAt && session.refreshTokenExpiresAt <= new Date())) {
      await SessionService.deactivateSession(session._id);
      throw AppError.unauthorized("Refresh token has been revoked");
    }

    const user = await UserService.getUser(payload.id);
    if (!user || user.isDeleted || !user.active) {
      await SessionService.deactivateSession(session._id);
      throw AppError.unauthorized("User account is not active");
    }

    const tokens = await JwtService.generateAccessAndRefreshTokens(user._id, session._id);
    const rotatedSession = await SessionService.rotateRefreshToken(
      session._id,
      tokenHash,
      tokens.refreshToken,
      refreshExpiryDate()
    );
    if (!rotatedSession) throw AppError.unauthorized("Refresh token has already been used");

    return { ...tokens, sessionId: session._id };
  }
  static async logout(sessionId, userId) {
    await SessionService.deactivateSession(sessionId);
    await UserService.onLogout(userId);
    return true;
  }
  static async restoreSession(userId) {
    const user = await UserService.getUser(userId);
    if (!user) throw new AppError("User not found", 404);
    const finalPermissions = await PermissionService.getUserFinalPermissions(user, true);
    const session = await SessionService.getActiveSessionForUser(userId);
    const accessToken = await JwtService.generateAccessToken(userId, session?._id);
    return {
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        role: {
          id: user.role._id,
          name: user.role.name,
          roleLevel: user.role.roleLevel
        },
        permissions: finalPermissions
      },
      accessToken,
      refreshToken: null,
      sessionId: session?._id || null
    };
  }
}

function parseExpiry(value) {
  const match = String(value).trim().match(/^(\d+)([smhd])$/i);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return Number(match[1]) * multipliers[match[2].toLowerCase()];
}

function refreshExpiryDate() {
  return new Date(Date.now() + parseExpiry(process.env.JWT_REFRESH_EXP || "7d"));
}