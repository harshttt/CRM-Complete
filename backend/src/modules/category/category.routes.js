import express from "express";
import { CategoryController } from "./category.controller.js";
import { permit } from "../../middlewares/permission.middleware.js";
import { validateBody } from "./category.validation.js";
import { createCategorySchema, updateCategorySchema } from "./category.validation.js";

const router = express.Router();


router.post( "/create",permit("category:create"),validateBody(createCategorySchema),CategoryController.create);
router.get("/list",permit("category:read"), CategoryController.list);
router.get("/dropdown", CategoryController.dropdown);
router.patch("/toggle/:id", permit("category:toggle"), CategoryController.toggle);
router.post("/restore/:id",  permit("category:restore"), CategoryController.restore);
router.get("/:id",permit("category:read"), CategoryController.get);
router.put("/:id", permit("category:update"),validateBody(updateCategorySchema),CategoryController.update);
router.delete("/:id",permit("category:delete"), CategoryController.del);

export default router;
