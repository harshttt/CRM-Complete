import Joi from "joi";

export const createCustomerSchema = Joi.object({
  name: Joi.string().trim().max(200).required(),
  companyName: Joi.string().trim().max(200).allow("").optional(),
  contactPerson: Joi.string().trim().max(200).allow("").optional(),
  email: Joi.string().email().allow("").optional(),
  phone: Joi.string().trim().allow("").optional(),
  address: Joi.string().trim().max(500).allow("").optional(),
  latitude: Joi.number().min(-90).max(90).allow(null).optional(),
  longitude: Joi.number().min(-180).max(180).allow(null).optional(),
});

export const updateCustomerSchema = Joi.object({
  name: Joi.string().trim().max(200).optional(),
  companyName: Joi.string().trim().max(200).allow("").optional(),
  contactPerson: Joi.string().trim().max(200).allow("").optional(),
  email: Joi.string().email().allow("").optional(),
  phone: Joi.string().trim().allow("").optional(),
  address: Joi.string().trim().max(500).allow("").optional(),
  latitude: Joi.number().min(-90).max(90).allow(null).optional(),
  longitude: Joi.number().min(-180).max(180).allow(null).optional(),
}).min(1);
