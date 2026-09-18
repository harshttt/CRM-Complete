import { JwtService } from "../utils/jwtService.js";
import { UserService } from "../modules/user/user.service.js";
import { PermissionService } from "../modules/permission/permission.service.js";
import logger from "../utils/logger.js";

export default async function socketAuth(socket, next) {
  try {
    const token = (
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1] ||
      socket.handshake.query?.token
    )?.trim();

    logger.info("[SocketAuth] Token received:", token ? "YES" : "NO");

    if (!token) {
      return next(new Error("Missing socket auth token"));
    }

    const payload = JwtService.verifyAccessToken(token);

    const user = await UserService.getUser(payload.id);
    if (!user) {
      return next(new Error("User not found"));
    }

    user.finalPermissions =
      await PermissionService.getUserFinalPermissions(user);

    socket.user = user;
    socket.token = token;

    logger.info(`[SocketAuth] Auth success user=${user._id}`);

    next();
  } catch (err) {
    logger.error("[SocketAuth] ERROR:", err.message);
    next(new Error("Unauthorized socket"));
  }
}
