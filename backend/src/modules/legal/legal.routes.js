import express from "express";
import { LegalController } from "./legal.controller.js";
import { permit } from "../../middlewares/permission.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/* ---------- PUBLIC ---------- */
router.get("/public/:type", LegalController.getPublicLegal);

/* ---------- ADMIN ---------- */
router.post("/create", auth, permit("legal:create"), LegalController.createLegal);
router.put("/:id", auth, permit("legal:update"), LegalController.upsertLegal);
router.get("/fetch-all", auth, permit("legal:read"), LegalController.getAllLegal);
router.get("/:id", auth, permit("legal:read"), LegalController.getLegalById);

export default router;