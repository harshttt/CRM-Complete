import express from "express";
import { CommentController } from "./comment.controller.js";
const router = express.Router();

router.get("/constants", CommentController.getCommentConstants);



export default router;
