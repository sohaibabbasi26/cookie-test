const Joi = require("joi");

const otpValidator = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
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

module.exports = {otpValidator};
