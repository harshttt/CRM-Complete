import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import { loginSchema } from "./auth.validation.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", validate(loginSchema), AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/validate",auth, AuthController.validateToken);

export default router;