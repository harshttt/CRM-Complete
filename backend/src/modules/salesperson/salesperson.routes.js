import express from "express";
import { SalespersonController } from "./salesperson.controller.js";
import { permit } from "../../middlewares/permission.middleware.js";
import { validateBody, validateQuery } from "../../utils/validate.js";

const router = express.Router();


router.get("/performance", SalespersonController.performance);


export default router;
