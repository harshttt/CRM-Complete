import express from "express";
import { PropertyController } from "./property.controller.js";

const router = express.Router();

router.post("/create", PropertyController.create);
router.get("/constants", PropertyController.getPropertyConstants);
router.get("/list", PropertyController.list);
router.patch("/toggle/:id", PropertyController.toggle);
router.delete("/soft_delete/:id", PropertyController.softDelete);
router.delete("/hard_delete/:id", PropertyController.remove);
router.get("/:id", PropertyController.getById);
router.put("/:id", PropertyController.update);


export default router;
