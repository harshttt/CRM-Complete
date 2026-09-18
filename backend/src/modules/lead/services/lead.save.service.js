
import mongoose from "mongoose";
import createError from "http-errors";
import Lead from "../lead.model.js";
import { cacheDel, cacheScanDel } from "../../../utils/cache.js";
import { UserService } from "../../user/user.service.js";
import { LeadScoringService } from "./lead.scoring.service.js";
import { checkDuplicate } from "../../../utils/facebookNormalizer.js";
import { deepTransform } from "../../../utils/transform.js";


import Activity from "../../activity/activity.model.js";


export class LeadSaveService {

    // Activity Logger
    static logActivity(leadId, userId, type, description, metadata = {}) {
      return Activity.create({
        lead: leadId,
        user: userId,
        type,
        description,
        metadata,
      });
    }

      static _transform(doc) {
        return deepTransform(doc);
      }

// static async saveLead({ id = null, payload, userId }) {
//   if (!userId) throw createError(400, "userId required");

//   const creator = await UserService.getUser(userId);
//   if (!creator) throw createError(404, "User not found");

//   const creatorRole = creator.role?.name?.toLowerCase() || "unknown";
//   let lead;

//   // ==========================
//   // CREATE LEAD FLOW
//   // ==========================
//   // if (!id) {
//   //   const dupQuery = {
//   //     $and: [{ status: "active" }, { $or: [] }],
//   //   };

//   //   if (payload.phone) dupQuery.$and[1].$or.push({ phone: payload.phone });
//   //   if (payload.email) dupQuery.$and[1].$or.push({ email: payload.email });

//     // let existingLead = null;
//     // let duplicateReason = null;

//     // if (dupQuery.$and[1].$or.length > 0) {
//     //   existingLead = await Lead.findOne(dupQuery);

//   //       const existingLead = dupQuery.$or.length
//   //       ? await Lead.findOne(dupQuery)
//   //       : null;

//   //     let duplicateReason = null;

//   //     if (existingLead) {
//   //       if (
//   //         existingLead.phone === payload.phone &&
//   //         existingLead.email === payload.email
//   //       ) {
//   //         duplicateReason = "phone+email";
//   //       } else if (existingLead.phone === payload.phone) {
//   //         duplicateReason = "phone";
//   //       } else {
//   //         duplicateReason = "email";
//   //       }

//   //       // increment duplicate count on original lead
//   //       await Lead.updateOne(
//   //         { _id: existingLead._id },
//   //         { $inc: { duplicateCount: 1 } }
//   //       );
//   //     }
//   //   // }

//   //   // category validation (UNCHANGED)
//   //   if ("category" in payload) {
//   //     if (
//   //       payload.category &&
//   //       !mongoose.Types.ObjectId.isValid(payload.category)
//   //     ) {
//   //       throw createError(400, "Invalid category id");
//   //     }
//   //   }

//   //   // CREATE LEAD
//   //   lead = new Lead({
//   //     ...payload,
//   //     createdBy: userId,
//   //     assignedTo: payload.assignedTo || userId,
//   //     currentOwner: payload.assignedTo || userId,
//   //     currentOwnerRole: creatorRole,

//   //     // DUPLICATE FIELDS
//   //     isDuplicate: !!existingLead,
//   //     duplicateOf: existingLead?._id || null,
//   //     duplicateReason,
//   //     // duplicateCreatedBy: existingLead ? userId : null,
//   //     // duplicateSource: existingLead ? "manual" : null,
//   //     // duplicateSource: existingLead ? payload.source || "meta" : null,
//   //     duplicateCount: 0,

//   //     status: existingLead ? "duplicate" : "active",

//   //     lastActivityAt: new Date(),
//   //     updatedBy: userId,
//   //   });

//   //   lead.scoreBreakdown.lsis = LeadScoringService.calculateLSIS(lead.source);
//   // }


//    if (!id) {

//      if ("category" in payload) {
//       if (
//         payload.category &&
//         !mongoose.Types.ObjectId.isValid(payload.category)
//       ) {
//         throw createError(400, "Invalid category id");
//       }
//     }
    
//     const dup = await checkDuplicate({
//       phone: payload.phone,
//       email: payload.email,
//     });

 

//     lead = new Lead({
//       ...payload,
//       createdBy: userId,
//       assignedTo: payload.assignedTo || userId,
//       currentOwner: payload.assignedTo || userId,
//       currentOwnerRole: creatorRole,

//       isDuplicate: !!dup,
//       duplicateOf: dup?.rootLead?._id || null,
//       duplicateReason: dup?.reason || null,

//       hasDuplicates: false,
//       duplicateCount: 0,

//       status: dup ? "duplicate" : "active",
//       lastActivityAt: new Date(),
//       updatedBy: userId,
//     });

//     // lead.scoreBreakdown.lsis = LeadScoringService.calculateLSIS(lead.source);
//     lead.scoreBreakdown = lead.scoreBreakdown || {};
//     lead.scoreBreakdown.lsis = LeadScoringService.calculateLSIS(lead.source);
     
//   }

//   // ==========================
//   // UPDATE LEAD FLOW
//   // ==========================
//   else {
//     if (!mongoose.Types.ObjectId.isValid(id))
//       throw createError(400, "Invalid lead id");

//     if ("category" in payload) {
//       if (
//         payload.category &&
//         !mongoose.Types.ObjectId.isValid(payload.category)
//       ) {
//         throw createError(400, "Invalid category id");
//       }
//     }

//     lead = await Lead.findById(id);
//     if (!lead) throw createError(404, "Lead not found");

//     const oldPhone = lead.phone;
//     const oldEmail = lead.email;
//     const oldDuplicateOf = lead.duplicateOf;

//     Object.assign(lead, payload);
//     lead.updatedBy = userId;
//     lead.lastActivityAt = new Date();
// // ==========================
//   // RE-CHECK DUPLICATE IF PHONE OR EMAIL CHANGED
//   // ==========================
//   if (
//       payload.phone !== oldPhone ||
//       payload.email !== oldEmail
//     ) {
//       // If previously duplicate → decrement old root safely
//       if (wasDuplicate && oldDuplicateOf) {
//         await Lead.updateOne(
//           { _id: oldDuplicateOf, duplicateCount: { $gt: 0 } },
//           { $inc: { duplicateCount: -1 } }
//         );
//       }

//       const dup = await checkDuplicate(
//         { phone: lead.phone, email: lead.email },
//         lead._id
//       );

//       lead.isDuplicate = !!dup;
//       lead.duplicateOf = dup?.rootLead?._id || null;
//       lead.duplicateReason = dup?.reason || null;
//       lead.status = dup ? "duplicate" : "active";
//     }

//    // ==========================
//   // MANUAL DUPLICATE REMOVAL
//   // ==========================
//   if (payload.isDuplicate === false && oldDuplicateOf) {
//       await Lead.updateOne(
//         { _id: oldDuplicateOf, duplicateCount: { $gt: 0 } },
//         { $inc: { duplicateCount: -1 } }
//       );

//       lead.isDuplicate = false;
//       lead.duplicateOf = null;
//       lead.duplicateReason = null;
//       lead.status = "active";
//     }

//   }

//   // ==========================
//   // SAVE + LOG
//   // ==========================
//   await lead.save();


//   await this.logActivity(
//     lead._id,
//     userId,
//     id ? "lead_updated" : "lead_created",
//     id ? "Lead updated" : "Lead created",
//     { payload }
//   );

//   await cacheDel(`lead:${lead._id}`);
//   await cacheScanDel("leads:list");

//   return LeadService._transform(lead.toObject());
// }

// }


//use lead
// static async saveLead({ id = null, payload, userId }) {
//   if (!userId) throw createError(400, "userId required");

//   const creator = await UserService.getUser(userId);
//   if (!creator) throw createError(404, "User not found");

//   const creatorRole = creator.role?.name?.toLowerCase() || "unknown";
//   let lead;

//   // ==========================
//   // CREATE LEAD FLOW
//   // ==========================

//   // if (!id) {
//   //   const dupQuery = {
//   //     $and: [{ status: "active" }, { $or: [] }],
//   //   };

//   //   if (payload.phone) dupQuery.$and[1].$or.push({ phone: payload.phone });
//   //   if (payload.email) dupQuery.$and[1].$or.push({ email: payload.email });

//     // let existingLead = null;
//     // let duplicateReason = null;

//     // if (dupQuery.$and[1].$or.length > 0) {
//     //   existingLead = await Lead.findOne(dupQuery);

//   //       const existingLead = dupQuery.$or.length
//   //       ? await Lead.findOne(dupQuery)
//   //       : null;

//   //     let duplicateReason = null;

//   //     if (existingLead) {
//   //       if (
//   //         existingLead.phone === payload.phone &&
//   //         existingLead.email === payload.email
//   //       ) {
//   //         duplicateReason = "phone+email";
//   //       } else if (existingLead.phone === payload.phone) {
//   //         duplicateReason = "phone";
//   //       } else {
//   //         duplicateReason = "email";
//   //       }

//   //       // increment duplicate count on original lead
//   //       await Lead.updateOne(
//   //         { _id: existingLead._id },
//   //         { $inc: { duplicateCount: 1 } }
//   //       );
//   //     }
//   //   // }

//   //   // category validation (UNCHANGED)
//   //   if ("category" in payload) {
//   //     if (
//   //       payload.category &&
//   //       !mongoose.Types.ObjectId.isValid(payload.category)
//   //     ) {
//   //       throw createError(400, "Invalid category id");
//   //     }
//   //   }

//   //   // CREATE LEAD
//   //   lead = new Lead({
//   //     ...payload,
//   //     createdBy: userId,
//   //     assignedTo: payload.assignedTo || userId,
//   //     currentOwner: payload.assignedTo || userId,
//   //     currentOwnerRole: creatorRole,

//   //     // DUPLICATE FIELDS
//   //     isDuplicate: !!existingLead,
//   //     duplicateOf: existingLead?._id || null,
//   //     duplicateReason,
//   //     // duplicateCreatedBy: existingLead ? userId : null,
//   //     // duplicateSource: existingLead ? "manual" : null,
//   //     // duplicateSource: existingLead ? payload.source || "meta" : null,
//   //     duplicateCount: 0,

//   //     status: existingLead ? "duplicate" : "active",

//   //     lastActivityAt: new Date(),
//   //     updatedBy: userId,
//   //   });

//   //   lead.scoreBreakdown.lsis = LeadScoringService.calculateLSIS(lead.source);
//   // }


//    if (!id) {

//      if ("category" in payload) {
//       if (
//         payload.category &&
//         !mongoose.Types.ObjectId.isValid(payload.category)
//       ) {
//         throw createError(400, "Invalid category id");
//       }
//     }
    
//     const dup = await checkDuplicate({
//       phone: payload.phone,
//       email: payload.email,
//     });

 

//     lead = new Lead({
//       ...payload,
//       createdBy: userId,
//       assignedTo: payload.assignedTo || userId,
//       currentOwner: payload.assignedTo || userId,
//       currentOwnerRole: creatorRole,

//       isDuplicate: !!dup,
//       duplicateOf: dup?.rootLead?._id || null,
//       duplicateReason: dup?.reason || null,

//       hasDuplicates: false,
//       duplicateCount: 0,

//       status: dup ? "duplicate" : "active",
//       lastActivityAt: new Date(),
//       updatedBy: userId,
//     });

//     // lead.scoreBreakdown.lsis = LeadScoringService.calculateLSIS(lead.source);
//     lead.scoreBreakdown = lead.scoreBreakdown || {};
//     lead.scoreBreakdown.lsis = LeadScoringService.calculateLSIS(lead.source);
     
//   }

//   // ==========================
//   // UPDATE LEAD FLOW
//   // ==========================
//   else {
//     if (!mongoose.Types.ObjectId.isValid(id))
//       throw createError(400, "Invalid lead id");

//     if ("category" in payload) {
//       if (
//         payload.category &&
//         !mongoose.Types.ObjectId.isValid(payload.category)
//       ) {
//         throw createError(400, "Invalid category id");
//       }
//     }

//     lead = await Lead.findById(id);
//     if (!lead) throw createError(404, "Lead not found");

//     const oldPhone = lead.phone;
//     const oldEmail = lead.email;
//     const oldDuplicateOf = lead.duplicateOf;

//     Object.assign(lead, payload);
//     lead.updatedBy = userId;
//     lead.lastActivityAt = new Date();
// // ==========================
//   // RE-CHECK DUPLICATE IF PHONE OR EMAIL CHANGED
//   // ==========================
//   if (
//       payload.phone !== oldPhone ||
//       payload.email !== oldEmail
//     ) {
//       // If previously duplicate → decrement old root safely
//       if (wasDuplicate && oldDuplicateOf) {
//         await Lead.updateOne(
//           { _id: oldDuplicateOf, duplicateCount: { $gt: 0 } },
//           { $inc: { duplicateCount: -1 } }
//         );
//       }

//       const dup = await checkDuplicate(
//         { phone: lead.phone, email: lead.email },
//         lead._id
//       );

//       lead.isDuplicate = !!dup;
//       lead.duplicateOf = dup?.rootLead?._id || null;
//       lead.duplicateReason = dup?.reason || null;
//       lead.status = dup ? "duplicate" : "active";
//     }

//    // ==========================
//   // MANUAL DUPLICATE REMOVAL
//   // ==========================
//   if (payload.isDuplicate === false && oldDuplicateOf) {
//       await Lead.updateOne(
//         { _id: oldDuplicateOf, duplicateCount: { $gt: 0 } },
//         { $inc: { duplicateCount: -1 } }
//       );

//       lead.isDuplicate = false;
//       lead.duplicateOf = null;
//       lead.duplicateReason = null;
//       lead.status = "active";
//     }

//   }

//   // ==========================
//   // SAVE + LOG
//   // ==========================
//   await lead.save();


//   await this.logActivity(
//     lead._id,
//     userId,
//     id ? "lead_updated" : "lead_created",
//     id ? "Lead updated" : "Lead created",
//     { payload }
//   );

//   await cacheDel(`lead:${lead._id}`);
//   await cacheScanDel("leads:list");

//   return this._transform(lead.toObject());
// }



static async saveLead({ id = null, payload, userId }) {
  if (!userId) throw createError(400, "userId required");

  const creator = await UserService.getUser(userId);
  if (!creator) throw createError(404, "User not found");

  const creatorRole = creator.role?.name?.toLowerCase() || "unknown";
  let lead;

  /* =====================================================
     CREATE FLOW
  ===================================================== */
  if (!id) {

    if ("category" in payload) {
      if (
        payload.category &&
        !mongoose.Types.ObjectId.isValid(payload.category)
      ) {
        throw createError(400, "Invalid category id");
      }
    }

    const dup = await checkDuplicate({
      phone: payload.phone,
      email: payload.email,
    });

    lead = new Lead({
      ...payload,
      createdBy: userId,
      assignedTo: payload.assignedTo || userId,
      currentOwner: payload.assignedTo || userId,
      currentOwnerRole: creatorRole,

      isDuplicate: !!dup,
      duplicateOf: dup?.rootLead?._id || null,
      duplicateReason: dup?.reason || null,
      hasDuplicates: false,
      duplicateCount: 0,

      status: dup ? "duplicate" : "active",
      lastActivityAt: new Date(),
      updatedBy: userId,
    });

      if (dup?.rootLead) {
      await Lead.updateOne(
        { _id: dup.rootLead },
        {
          $inc: { duplicateCount: 1 },
          $set: { hasDuplicates: true },
          $addToSet: { duplicates: lead._id },
        }
      );
    }

    lead.scoreBreakdown = lead.scoreBreakdown || {};
    lead.scoreBreakdown.lsis =LeadScoringService.calculateLSIS(lead.source);

 
  }

  /* =====================================================
     UPDATE FLOW
  ===================================================== */
  else {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw createError(400, "Invalid lead id");

    lead = await Lead.findById(id);
    if (!lead) throw createError(404, "Lead not found");

    const wasDuplicate = lead.isDuplicate;
    const oldRootId = lead.duplicateOf;
    const oldPhone = lead.phone;
    const oldEmail = lead.email;

    Object.assign(lead, payload);
    lead.updatedBy = userId;
    lead.lastActivityAt = new Date();

  if (wasDuplicate && oldRootId) {

      await Lead.updateOne(
        { _id: oldRootId },
        {
          $inc: { duplicateCount: -1 },
          $pull: { duplicates: lead._id },
        }
      );

      await Lead.updateOne(
        { _id: oldRootId, duplicateCount: { $lte: 0 } },
        {
          $set: {
            duplicateCount: 0,
            hasDuplicates: false,
            duplicates: [],
          },
        }
      );
    }

   
 const dup = await checkDuplicate(
      { phone: lead.phone, email: lead.email },
      lead._id
    );

    if (dup?.rootLeadId) {

      // mark as duplicate again
      lead.isDuplicate = true;
      lead.duplicateOf = dup.rootLead;
      lead.duplicateReason = dup.reason;
      lead.status = "duplicate";

      // add to new root
      await Lead.updateOne(
        { _id: dup.rootLead },
        {
          $inc: { duplicateCount: 1 },
          $set: { hasDuplicates: true },
          $addToSet: { duplicates: lead._id },
        }
      );

    } else {

      lead.isDuplicate = false;
      lead.duplicateOf = null;
      lead.duplicateReason = null;
      lead.status = payload.status || "active";
    }
   
  }

   await lead.save();
  /* =====================================================
     ACTIVITY + CACHE
  ===================================================== */
  await this.logActivity(
    lead._id,
    userId,
    id ? "lead_updated" : "lead_created",
    id ? "Lead updated" : "Lead created",
    { payload }
  );

  await cacheDel(`lead:${lead._id}`);
  await cacheScanDel("leads:list");

  return this._transform(lead.toObject());
}





//first code 
  // Save or created lead
  // static async saveLead({ id = null, payload, userId }) {
  //   if (!userId) throw createError(400, "userId required");
  //   const creator = await UserService.getUser(userId);
  //   if (!creator) throw createError(404, "User not found");
  //   const creatorRole = creator.role?.name?.toLowerCase() || "unknown";
  //   let lead;

  //   //create lead flow
  //   if (!id) {
  //     // Dedupe check for active leads
  //     const dupQuery = {
  //       $and: [{ status: "active" }, { $or: [] }],
  //     };

  //     if (payload.phone) dupQuery.$and[1].$or.push({ phone: payload.phone });
  //     if (payload.email) dupQuery.$and[1].$or.push({ email: payload.email });
  //     if (dupQuery.$and[1].$or.length > 0) {
  //       const exists = await Lead.findOne(dupQuery);
  //       if (exists) throw createError(409, "Lead exists with same phone/email");
  //     }
  //     if ("category" in payload) {
  //       if (
  //         payload.category &&
  //         !mongoose.Types.ObjectId.isValid(payload.category)
  //       ) {
  //         throw createError(400, "Invalid category id");
  //       }
  //     }

  //     // if ("property_id" in payload) {
  //     //   if (!mongoose.Types.ObjectId.isValid(payload.property_id)) {
  //     //     throw createError(400, "Invalid property id");
  //     //   }
  //     // }

  //     //       if (payload.category) {
  //     //   if (mongoose.Types.ObjectId.isValid(payload.category)) {
  //     //     // category is ID
  //     //     lead.category = payload.category;
  //     //   } else {
  //     //     // category is name → auto create if not exists
  //     //     const cat = await CategoryService.getOrCreateByName(payload.category, userId);
  //     //     lead.category = cat._id;
  //     //   }
  //     // }

  //     lead = new Lead({
  //       ...payload,
  //       createdBy: userId,
  //       assignedTo: payload.assignedTo || userId,
  //       currentOwner: payload.assignedTo || userId,
  //       currentOwnerRole: creatorRole,
  //       lastActivityAt: new Date(),
  //       updatedBy: userId,
  //     });
  //     lead.scoreBreakdown.lsis =
  //     LeadScoringService.calculateLSIS(lead.source);
  //   }

  //   //update lead flow
  //   else {
  //     if (!mongoose.Types.ObjectId.isValid(id))
  //       throw createError(400, "Invalid lead id");

  //     if ("category" in payload) {
  //       if (
  //         payload.category &&
  //         !mongoose.Types.ObjectId.isValid(payload.category)
  //       ) {
  //         throw createError(400, "Invalid category id");
  //       }
  //     }

  //     lead = await Lead.findById(id);
  //     if (!lead) throw createError(404, "Lead not found");

  //     Object.assign(lead, payload);
  //     lead.updatedBy = userId;
  //     lead.lastActivityAt = new Date();
  //   }

  //   // SAVE LEAD
  //   await lead.save();
  //   await this.logActivity(
  //     lead._id,
  //     userId,
  //     id ? "lead_updated" : "lead_created",
  //     id ? "Lead updated" : "Lead created",
  //     { payload }
  //   );

  //   // CLEAR CACHE
  //   await cacheDel(`lead:${lead._id}`);
  //   await cacheScanDel("leads:list");

  //   // return lead.toObject();
  //   return LeadService._transform(lead.toObject());
  // }

}