import express from "express";
import { LeadController } from "./lead.controller.js";
import { permit } from "../../middlewares/permission.middleware.js";
import { upload } from "../../middlewares/upload.js";
import { validateBody, validateQuery } from "../../utils/validate.js";
import {createLeadSchema,updateLeadSchema,assignSchema,stageSchema,followUpSchema,commentSchema,listQuerySchema} from "./lead.validation.js";
const router = express.Router();

// authenticated + permissioned routes
router.get("/constants", LeadController.getLeadConstants);
router.post("/create",permit("lead:create"),validateBody(createLeadSchema),LeadController.create);
router.get("/getLeadFromDB", LeadController.getAllMetaLeads);
router.get("/export",permit("lead:export"), LeadController.exportLeads);
router.get("/list",permit("lead:read"),validateQuery(listQuerySchema),LeadController.list);
router.get("/summary", permit("lead:read"), LeadController.summary);
router.get("/duplicates/:id", permit("lead:duplicate:read"),LeadController.getDuplicateLeads);
router.get("/:id", permit("lead:read"), LeadController.getById);
router.get("/assignment-history/:id",permit("lead:read"),LeadController.getAssignmentHistory);
router.get("/stage-history/:id",permit("lead:read"),LeadController.getStageHistory);
router.put("/:id",permit("lead:update"),validateBody(updateLeadSchema),LeadController.update);
router.put("/stage/:id",permit("lead:stage:update"),validateBody(stageSchema),LeadController.updateStage);
router.put("/assign/:id",permit("lead:assign"),validateBody(assignSchema),LeadController.assign);
router.post("/bulk/stage-change", LeadController.bulkStageChange);
router.post("/comment/:id",permit("lead:update"),validateBody(commentSchema),LeadController.addComment);
router.put("/comment/:id",validateBody(commentSchema),LeadController.updateComment);
router.get("/comment/:leadId", LeadController.listComments);
router.delete("/:id", permit("lead:delete"), LeadController.softDelete);
router.post("/bulk/assign", permit("lead:assign"), LeadController.bulkAssign);
router.post("/bulk/import",permit("lead:import"),upload,LeadController.bulkImport);
router.post("/lock/:id", LeadController.lockLead);
router.post("/unlock/:id", LeadController.unlockLead);
router.put("/recycle/restore/:id", LeadController.restoreRemovedLead);



export default router;
