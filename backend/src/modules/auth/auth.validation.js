import Joi from "joi";

export const loginSchema = Joi.object({
  emailOrPhone: Joi.string().required(),
  password: Joi.string().optional(),
  deviceId: Joi.string().optional(),
  fcmToken: Joi.string().optional(),
  userAgent: Joi.string().optional(),
  platform: Joi.string().optional(),
  ip: Joi.string().optional(),
});
