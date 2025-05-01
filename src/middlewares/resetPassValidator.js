const Joi = require("joi");

const resetPasswordValidator = (req, res, next) => {
  const schema = Joi.object({
    otp: Joi.string().length(5).required(),
    password: Joi.string().min(8).optional(),
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

module.exports = {resetPasswordValidator};
