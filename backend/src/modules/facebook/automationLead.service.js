import Lead from "../lead/lead.model.js";
import { LEAD_ENUMS } from "../../constants/lead.constants.js";
import { getSystemOwner , checkDuplicate } from "../../utils/facebookNormalizer.js";
import logger from "../../utils/logger.js";

class AutomationLeadService {
  static async saveFacebookLead(payload) {

    //BASIC VALIDATION
    // if (!payload.phone || !payload.fullName) {
    //   console.warn("Facebook lead skipped: missing phone/fullName");
    //   return null;
    // }

    // //DEDUPE (PHONE FIRST)
    // const existing = await Lead.findOne({
    //   phone: payload.phone,
    //   status: LEAD_ENUMS.STATUS.ACTIVE,
    // });

    // if (existing) {
    //   console.log("Duplicate Facebook lead ignored:", payload.phone);
    //   return existing;
    // }

      logger.info(
    {
     payload
    },
    "[FB-LEAD-SAVE] Processing Facebook lead"
  );

     const systemUser = await getSystemOwner();
     const roleName = systemUser.role?.name?.toLowerCase() || "admin";

       const dup = await checkDuplicate({
      phone: payload.phone,
      email: payload.email,
    });

    //     /* =========================
    //  * DUPLICATE CHECK
    //  * ========================= */
    // let existingLead = null;
    // let duplicateReason = null;

    // const dupQuery = {
    //   status: LEAD_ENUMS.STATUS.ACTIVE,
    //   $or: [],
    // };

    // if (payload.phone) dupQuery.$or.push({ phone: payload.phone });
    // if (payload.email) dupQuery.$or.push({ email: payload.email });

    // if (dupQuery.$or.length > 0) {
    //   existingLead = await Lead.findOne(dupQuery)

      

    //   if (existingLead) {
    //     if (
    //       existingLead.phone === payload.phone &&
    //       existingLead.email === payload.email
    //     ) {
    //       duplicateReason = "phone+email";
    //     } else if (existingLead.phone === payload.phone) {
    //       duplicateReason = "phone";
    //     } else {
    //       duplicateReason = "email";
    //     }

    //     // increment duplicate count on ORIGINAL
    //     await Lead.updateOne(
    //       { _id: existingLead._id },
    //       { $inc: { duplicateCount: 1 } }
    //     );
    //   }
    // }

    //CREATE LEAD (SYSTEM OWNED)
    const lead = await Lead.create({
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email || null,
      address: payload.address || null,

      source: LEAD_ENUMS.SOURCE.META,
      tags: [LEAD_ENUMS.TAGS.MEDIUM],
      stage: LEAD_ENUMS.STAGE.FRESH,

      ownerType: "system",

      assignedTo: systemUser._id,
      currentOwner: systemUser._id,
      currentOwnerRole: roleName,
      // assignedTo: null,
      // currentOwner: null,
      // currentOwnerRole: null,

      isDuplicate: !!dup,
      duplicateOf: dup?.rootLead?._id || null,
      duplicateReason: dup?.reason || null,
      hasDuplicates: false, 
      duplicateCount: 0,    
      status: dup ? "duplicate" : "active",

      //    assignmentHistory: [
      //   {
      //     from: null, // SYSTEM
      //     to: systemUser._id,
      //     roleFrom: "system",
      //     roleTo: roleName,
      //     reason: "meta_auto_assignment",
      //     changedBy: systemUser._id,
      //     changedAt: new Date(),
      //   },
      // ],

      //   lastAssignedAt: new Date(),
      // status: LEAD_ENUMS.STATUS.ACTIVE,
      lastActivityAt: new Date(),
      message: payload.message || "Lead from Facebook Ads",
    });

     /* ===============================
        UPDATE ROOT IF DUPLICATE
    ================================ */
    if (dup?.rootLead?._id) {

      await Lead.updateOne(
        { _id: dup.rootLead._id },
        {
          $inc: { duplicateCount: 1 },
          $set: { hasDuplicates: true },
          $addToSet: { duplicates: lead._id },
        }
      );



    logger.info(
        {
          rootId: dup.rootLead._id,
          duplicateId: lead._id,
        },
        "[FB-LEAD-SAVE] Root updated with duplicate"
      );
    }



   logger.info(
      { leadId: lead._id },
      "[FB-LEAD-SAVE] Lead created successfully"
    );

      logger.info(
    {
      leadId: lead._id,
      formId: payload.meta?.formId,
      duplicate: !!dup,
    },
    "[FB-LEAD-SAVE] Lead saved successfully"
  );

    return lead;
  }
}

export default AutomationLeadService;
