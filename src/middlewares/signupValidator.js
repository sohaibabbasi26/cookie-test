const Joi = require("joi");

const signUpValidator = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    dob: Joi.date().optional(),
    password: Joi.string().min(8).optional(),
    otp: Joi.string().length(5).optional(),
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

module.exports = {signUpValidator};
