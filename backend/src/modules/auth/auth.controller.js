import { ApiResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/appError.js";
import { AuthService } from "./auth.service.js";
import SystemActivityService from "../systemActivity/systemActivity.service.js";

export class AuthController {
static async login(req, res, next) {
  try {
    const payload = req.body;

    const deviceInfo = {
      deviceId: payload.deviceId,
      userAgent: req.headers["user-agent"],
      platform: payload.platform
    };

    const result = await AuthService.login({
      emailOrPhone: payload.emailOrPhone,
      password: payload.password,
      deviceInfo,
      ip: req.ip,
      fcmToken: payload.fcmToken
    });

    SystemActivityService.auth({
      user: result.user.id,
      session: result.sessionId,
      action: "login",
      description: "User logged in",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      platform: payload.platform
    });
    return res.json(
      ApiResponse.success(
        {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          sessionId: result.sessionId
        },
        "Login successful"
      )
    );
  } catch (error) {
    console.error("Error in AuthController.login:", error);
    next(error);
  }
}

  static async logout(req, res, next) {
    try {
      const { sessionId, userId } = req.body;
      await AuthService.logout(sessionId, userId);
      SystemActivityService.auth({
        user: userId,
        session: sessionId,
        action: "logout",
        description: "User logged out"
      });
      return res.json(ApiResponse.success(null, "Logged out successfully"));
    } catch (error) {
      next(error);
    }
  }
  static async validateToken(req, res, next) {
    try {
      const result = await AuthService.restoreSession(req.user._id);
      return res.json(
        ApiResponse.success(result, "Token is valid")
      );
    } catch (error) {
      next(error);
    }
  }
}