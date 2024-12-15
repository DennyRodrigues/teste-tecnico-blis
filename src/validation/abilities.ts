import Joi from "joi";

export const abilitiesPostSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  active: Joi.boolean(),
});

export const abilitiesPutSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  active: Joi.boolean().required(),
});
