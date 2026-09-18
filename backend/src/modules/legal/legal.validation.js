import Joi from "joi";

const LEGAL_TYPES = ["PRIVACY", "TERMS", "COOKIE", "REFUND", "DELETE_ACCOUNT"];
const LEGAL_STATUS = ["DRAFT", "PUBLISHED"];

/* ---------- CREATE ---------- */
export const createLegalSchema = Joi.object({
  type: Joi.string().valid(...LEGAL_TYPES).required(),
  title: Joi.string().trim().required(),
  content: Joi.string().required(),
  version: Joi.string().required(),
});

/* ---------- UPDATE / UPSERT ---------- */
export const updateLegalSchema = Joi.object({
  title: Joi.string().trim(),
  content: Joi.string(),
  version: Joi.string(),
  status: Joi.string().valid(...LEGAL_STATUS)
}).min(1);