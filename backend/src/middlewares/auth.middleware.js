import { JwtService } from "../utils/jwtService.js";
import { UserService } from "../modules/user/user.service.js";
import { PermissionService } from "../modules/permission/permission.service.js";
import { AppError } from "../utils/appError.js";

export async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw AppError.unauthorized("Missing authorization token");
    }
    const token = header.split(" ")[1];
    let payload;
    try {
      payload = JwtService.verifyAccessToken(token);
    } catch (err) {
      throw AppError.unauthorized("Invalid or expired token");
    }
    const user = await UserService.getUser(payload.id);
    if (!user) throw AppError.unauthorized("User not found");
    const finalPermissions = await PermissionService.getUserFinalPermissions(user);
    user.finalPermissions = finalPermissions;
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}