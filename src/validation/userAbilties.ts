import Joi from "joi";

export const userAbilitiesPostSchema = Joi.object({
  ability_name: Joi.string().min(1).max(50).required(),
  years_experience: Joi.number().positive(),
});


export const userAbilitiesGetSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  pageSize: Joi.number().integer().min(1).max(100).optional(),
});

export const userAbilitiesDeleteSchema = Joi.object({
  ability_names: Joi.array().items(Joi.string().required()).min(1).required(),
});
