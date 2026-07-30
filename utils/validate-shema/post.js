const Joi = require("joi");

const createPostSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  group: Joi.string().hex().length(24),
});

const updatePostSchema = Joi.object({
  title: Joi.string(),
  content: Joi.string(),
});

module.exports = { createPostSchema, updatePostSchema };
