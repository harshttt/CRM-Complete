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
    let tokens = await JwtService.generateAccessAndRefreshTokens(user._id);

    const session = await SessionService.createSession(user, deviceInfo, ip, fcmToken);
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
    const accessToken = JwtService.generateAccessToken(userId);
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