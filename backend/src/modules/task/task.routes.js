import express from "express";
import TaskController from "./task.controller.js";
import { validateBody, validateQuery } from "../../utils/validate.js";
import { createTaskSchema, listTaskQuerySchema, updateTaskSchema } from "./task.validation.js";

const router = express.Router();


router.get("/constants", TaskController.getTaskConstants);
router.post("/create", validateBody(createTaskSchema), TaskController.create);
router.get("/list", validateQuery(listTaskQuerySchema), TaskController.list);
router.patch("/complete/:id", TaskController.complete);
router.delete("/soft_delete/:id", TaskController.softDelete);
router.put("/:id",validateBody(updateTaskSchema), TaskController.update);

export default router;
