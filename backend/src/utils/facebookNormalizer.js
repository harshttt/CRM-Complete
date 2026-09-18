import logger from "../utils/logger.js";
import User from "../modules/user/user.model.js";
import Lead from "../modules/lead/lead.model.js";

// export function normalizeFacebookLead(fbData) {
//   logger.info("Normalizing Facebook lead data:", fbData);
//   const map = {};
//   fbData.field_data?.forEach((f) => {
//     map[f.name] = f.values?.[0];
//   });

//   logger.info("Normalized lead data:", map);

//   return {
//       fullName: map.full_name || "Facebook Lead",
//       phone: map.phone_number || null,
//       email: map.email || null,
//       projectName: map.project_name || null,
//       address: map.city || null,
//       source: "FACEBOOK",
//       tags: ["facebook"],
//       stage: "fresh",
//       message: "Lead from Facebook Ads",
//   };
// }

//system owner fetcher
export async function getSystemOwner() {
  // Prefer Super Admin
  let user = await User.findOne({})
    .populate("role")
    .sort({ "role.roleLevel": 1 }) // 1 first, then 2
    .lean();

  if (!user) {
    throw new Error("No Super Admin/Admin found in system");
  }

  return user;
}



export async function checkDuplicate({ phone, email }, excludeId = null) {
  if (!phone && !email) return null;

  const query = {
    status: "active",
    isDuplicate: false,
    $or: [],
  };

  if (phone) query.$or.push({ phone });
  if (email) query.$or.push({ email });

  if (!query.$or.length) return null;

  if (excludeId) { query._id = { $ne: excludeId }}

  const existingLead = await Lead.findOne(query);

  if (!existingLead) return null;

  let reason = null;

  if (existingLead.phone === phone && existingLead.email === email) {
    reason = "phone+email";
  } else if (existingLead.phone === phone) {
    reason = "phone";
  } else {
    reason = "email";
  }

  // mark root
  // await Lead.updateOne(
  //   { _id: existingLead._id },
  //   {
  //     $inc: { duplicateCount: 1 },
  //     $set: { hasDuplicates: true },
  //   }
  // );

  return {
    rootLead: existingLead,
    reason,
  };
}



export function normalizeFacebookLead(rawLead, context) {
  const answers = {};

  for (const field of rawLead.field_data || []) {
    answers[field.name] = field.values?.[0] ?? null;
  }

  return {
    fullName:
      answers.full_name ||
      answers.name ||
      `${answers.first_name || ""} ${answers.last_name || ""}`.trim(),

    phone: answers.phone_number || answers.phone || null,
    email: answers.email || null,
    message: answers.message || answers.comments || null,

    meta: {
      provider: "facebook",
      leadGenId: context.leadGenId,
      pageId: context.pageId,
      formId: context.formId,
      adId: rawLead.ad_id,
      adName: rawLead.ad_name,
      adSetId: rawLead.adset_id,
      campaignId: rawLead.campaign_id,
      createdTime: rawLead.created_time,
    },

    metaAnswers: answers,     // 🔥 ALL FORM FIELDS
    metaRaw: rawLead,         // 🔥 FULL RAW LEAD
  };
}

