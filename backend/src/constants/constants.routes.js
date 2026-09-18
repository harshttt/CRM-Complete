import express from "express";
const router = express.Router();

import { ConstantsController } from "./constants.controller.js";




router.get("/all", ConstantsController.getAllConstants);

export default router;
