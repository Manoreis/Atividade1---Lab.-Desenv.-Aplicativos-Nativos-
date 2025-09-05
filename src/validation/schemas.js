const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const todoSchema = Joi.object({
  title: Joi.string().min(1).required(),
  done: Joi.boolean(),
});

module.exports = { registerSchema, loginSchema, todoSchema };
