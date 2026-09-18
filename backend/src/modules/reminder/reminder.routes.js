import express from "express";
import { ReminderController } from "./reminder.controller.js";

const router = express.Router();

router.post("/", ReminderController.create);
router.get("/",  ReminderController.list);
router.get("/:id", ReminderController.get);
router.patch("/:id", ReminderController.update);
router.patch("/:id/complete", ReminderController.markCompleted);
router.delete("/:id", ReminderController.remove);

export default router;
