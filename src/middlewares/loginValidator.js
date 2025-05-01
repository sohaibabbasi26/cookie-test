const Joi = require("joi");

const loginValidator = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).optional(),
    provider: Joi.string().required(),
    idToken: Joi.string().optional().allow(null)
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: 400,
      message: "Validation error",
      details: error.details,
    });
  }

  next(); 
};

module.exports = {loginValidator};
