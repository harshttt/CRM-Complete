import { ApiResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/appError.js";
import { AuthService } from "./auth.service.js";
import SystemActivityService from "../systemActivity/systemActivity.service.js";

const REFRESH_COOKIE = "crm_refresh_token";

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
    sameSite: process.env.COOKIE_SAME_SITE || (process.env.NODE_ENV === "production" ? "none" : "lax"),
    path: "/api/auth",
    maxAge: parseExpiry(process.env.JWT_REFRESH_EXP || "7d"),
  };
}

function readCookie(req, name) {
  const cookies = req.headers.cookie?.split(";").map((item) => item.trim()) || [];
  const value = cookies.find((item) => item.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.slice(name.length + 1)) : null;
}

function parseExpiry(value) {
  const match = String(value).trim().match(/^(\d+)([smhd])$/i);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return Number(match[1]) * multipliers[match[2].toLowerCase()];
}

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
    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions());
    return res.json(
      ApiResponse.success(
        {
          user: result.user,
          accessToken: result.accessToken,
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
      const { sessionId, userId } = req.body || {};
      await AuthService.logout(sessionId, userId);
      SystemActivityService.auth({
        user: userId,
        session: sessionId,
        action: "logout",
        description: "User logged out"
      });
      res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
      return res.json(ApiResponse.success(null, "Logged out successfully"));
    } catch (error) {
      res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
      next(error);
    }
  }

  static async refresh(req, res, next) {
    try {
      const result = await AuthService.refresh(readCookie(req, REFRESH_COOKIE));
      res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions());
      return res.json(ApiResponse.success({
        accessToken: result.accessToken,
        sessionId: result.sessionId,
      }, "Token refreshed"));
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