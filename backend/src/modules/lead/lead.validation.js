import Joi from "joi";
import mongoose from "mongoose";

export const objectId = Joi.string().custom((val, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(val))
    return helpers.error("any.invalid");
  return val;
}, "ObjectId validation");

export const createLeadSchema = Joi.object({
  fullName: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email().allow("").optional(),
  projectName: Joi.string().optional(),
  category: Joi.string().optional(),
  address: Joi.string().optional(),
  source: Joi.string()
    .valid(
      "website",
      "referral",
      "exhibition_event",
      "online_ads",
      "walk-in",
      "phone_inquiry",
      "email_campaign",
      "property_portal",
      "campaign",
      "social_media",
      "advertisement",
      "cold_call",
      "broker",
      "meta",
    ).optional(),
  budgetMin: Joi.number().optional(),
  budgetMax: Joi.number().optional(),
  propertyType: Joi.string().optional(),
  locationPreference: Joi.string().optional(),
  stage: Joi.string().optional(),
  assignedTo: objectId.optional(),
  nextFollowUp: Joi.date().optional(),
  branch: Joi.string().optional(),
  region: Joi.string().optional(),
  reason: Joi.string().optional().allow(""),
  // tags: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array()
    .items(Joi.string().valid("hot", "medium", "low", "urgent"))
    .default(["low"])
    .optional(),
});

export const updateLeadSchema = Joi.object({
  fullName: Joi.string().optional(),
  phone: Joi.string().optional(),
  email: Joi.string().email().allow("").optional(),
  projectName: Joi.string().optional(),
  category: Joi.string().optional(),
  address: Joi.string().optional(),
  budgetMin: Joi.number().optional(),
  propertyType: Joi.string().optional(),
  locationPreference: Joi.string().optional(),
  source: Joi.string()
    .valid(
    "website",
      "referral",
      "exhibition_event",
      "online_ads",
      "walk-in",
      "phone_inquiry",
      "email_campaign",
      "property_portal",
      "campaign",
      "social_media",
      "advertisement",
      "cold_call",
      "broker",
      "meta",
    ).optional(),
  budgetMax: Joi.number().optional(),
  stage: Joi.string().optional(),
  assignedTo: objectId.optional(),
  nextFollowUp: Joi.date().optional(),
  branch: Joi.string().optional(),
  region: Joi.string().optional(),
  reason: Joi.string().optional().allow(""),
  // tags: Joi.array().items(Joi.string()).optional(),
    tags: Joi.array()
    .items(Joi.string().valid("hot", "medium", "low", "urgent"))
    .default(["low"])
    .optional(),
}).min(1); // at least 1 field

export const assignSchema = Joi.object({
  assignedTo: objectId.required(),
  reason: Joi.string().optional().allow(""),
});

export const stageSchema = Joi.object({
  stage: Joi.string()
    .valid(
    "fresh",
      "call_attempt",
      "call_back",
      "not_answered",
      "contacted",
      "project_done",
      "interested",
      "prospect",
      "qualified",
      "negotiation",
      "invalid",
      "junk_lead",
      "lost_lead",
      "follow_up",
      "payment",
      "reregistered",
      "onboarding",
      "meeting_scheduled",
      "future_prospect",
      "dump",
      "open",
      "site_visit",
      "in_progress",
      "unqualified",
      "closed_won",
      "closed_lost",
      "archived",
    )
    .required(),
});

export const followUpSchema = Joi.object({
  nextFollowUp: Joi.date().required(),
});

export const commentSchema = Joi.object({
  comment: Joi.string().required(),
  conversationType: Joi.string()
    .valid(
      "call",
      "whatsApp",
      "meeting",
      "visit",
      "mail",
      "sms",
      "message",
      "other"
    )
    .optional(),
  commentType: Joi.string().valid("general", "followup", "ni", "reminder", "internalNote", "system").optional(),
  stageAtTime: Joi.string().optional().allow(""),
  reminderAt: Joi.date().optional().allow(null),
});

export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(200).optional(),
  q: Joi.string().optional().allow(""),
  stage: Joi.string().optional(),
  assignedTo: objectId.optional(),
  branch: Joi.string().optional(),
  source: Joi.string().optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
    tags: Joi.array()
    .items(Joi.string().valid("hot", "medium", "low", "urgent"))
    .default(["low"])
    .optional(),
});

