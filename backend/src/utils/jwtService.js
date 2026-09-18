import jwt from "jsonwebtoken";
import crypto from "crypto";

export class JwtService {

  static async generateAccessAndRefreshTokens(userId) {
    const accessToken = await this.generateAccessToken(userId);
    const refreshToken = await this.generateRefreshToken(userId);
    return { accessToken, refreshToken };
  }

  static async generateAccessToken(userId) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }
    const token = await jwt.sign(
      { id: userId, type: "access" },
      secret,
      { expiresIn: process.env.JWT_ACCESS_EXP || "15m" }
    );
    return token;
  }

  static async generateRefreshToken(userId) {
    const secret = process.env.REFRESH_SECRET;
    if (!secret) {
      throw new Error("REFRESH_SECRET is not defined in environment variables.");
    }
    const token = await jwt.sign(
      { id: userId, type: "refresh" },
      secret,
      { expiresIn: process.env.JWT_REFRESH_EXP || "7d" }
    );
    return token;
  }

  static verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  static verifyRefreshToken(token) {
    return jwt.verify(token, process.env.REFRESH_SECRET);
  }


  static verifyFacebookSignature(req) {
  try {
    const signature = req.headers["x-hub-signature-256"];
    if (!signature) return false;

    if (!req.rawBody || !Buffer.isBuffer(req.rawBody)) {
      console.error("❌ rawBody missing or invalid");
      return false;
    }

    const expected =
      "sha256=" +
      crypto
        .createHmac("sha256", process.env.FB_APP_SECRET)
        .update(req.rawBody)
        .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );

  } catch (err) {
    console.error("❌ Signature verification error:", err.message);
    return false;
  }
}
  
}