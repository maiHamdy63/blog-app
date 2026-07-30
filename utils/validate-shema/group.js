const Joi = require("joi");

const createGroupSchema = Joi.object({
  name: Joi.string().required(),
});

const memberSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
});

const permissionSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  allow: Joi.boolean().required(),
});

module.exports = { createGroupSchema, memberSchema, permissionSchema };
