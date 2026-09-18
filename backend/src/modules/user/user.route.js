import express from "express";
import { UserController } from "./user.controller.js";
import { permit } from "../../middlewares/permission.middleware.js";

const router = express.Router();

router.post("/create", permit("user:create"), UserController.createUser);
router.get("/fetch-all", permit("user:read"), UserController.listUsers);
router.get("/search", permit("user:read"), UserController.searchUsers);
router.get("/parent-user-dropdown", UserController.getParentUserDropdown);
//STATIC ROUTES FIRST
router.get("/tree/:id", permit("user:read"), UserController.getUserTree);
router.get("/permission/:id", permit("user:read"), UserController.getUserPermissions);
router.patch("/change-parent", permit("user:update"), UserController.changeParentUser);
router.patch("/move-subtree", permit("user:update"), UserController.moveSubtree);

//DYNAMIC ROUTES SHOULD ALWAYS BE LAST
router.get("/:id", permit("user:read"), UserController.getUser);
router.put("/:id", permit("user:update"), UserController.updateUser);
router.delete("/:id", permit("user:delete"), UserController.deleteUser);//soft delete
router.delete("/delete/:id", permit("user:delete"), UserController.deleteUserWthTransfer);//hard delete with subtree transfer
router.put("/:id/password", permit("user:update"), UserController.changePassword);
router.patch("/restore/:id", permit("user:restore"), UserController.restoreUser);
export default router;