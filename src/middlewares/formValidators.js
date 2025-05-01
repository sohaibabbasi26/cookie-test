
const Joi = require("joi");

const signUpValidator = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
    dob: Joi.date().optional(),
    password: Joi.string().allow(null, '').optional(),
    otp: Joi.string().length(5).optional(),
    provider: Joi.string().required(),
    idToken: Joi.string().optional().allow(null),
    planId: Joi.number().optional().allow(null)
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


const loginValidator = (req, res, next) => {

  console.log("[Request body]:", req?.body);
  const schema = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().required(),
    password: Joi.string().allow(null, '').optional(),
    provider: Joi.string().required(),
    idToken: Joi.string().optional(),
    fcmToken: Joi.string().allow(null, '').optional()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    console.log("[VALIDATION ERROR]:", error);
    return res.status(400).json({
      status: 400,
      message: "Validation error",
      details: error.details,
    });
  }

  next(); 
};

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

const verifyOtpValidator = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(5).required(),
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



const noteCreationValidator = (req, res, next) => {
  console.log("[BODY]:",req?.body);
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    console.log("[ERROR]:",error);
    return res.status(400).json({
      status: 400,
      message: "Validation error",
      details: error.details,
    });
  }

  next(); 
};


const noteEditValidator = (req, res, next) => {
  const schema = Joi.object({
    notesId: Joi.number().required(),
    title: Joi.string().optional(),
    description: Joi.string().optional(),
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

const changePasswordValidator = (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string().required(),
    newPassword: Joi.string().required()
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


const updateUserInfoValidator = (req, res, next) => {
  // if (!req?.file) {
  //   return {
  //     status: 404,
  //     message: "Didn't get the file",
  //     details: null
  //   }
  // }

  const schema = Joi.object({
    name: Joi.string().optional(),
    dob: Joi.string().optional(),
    notificationEnability: Joi.boolean().optional(),
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

const reminderCreationValidator = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    time: Joi.string().required(),
    repeatType: Joi.string().required(),
    isActive: Joi.boolean().required()
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
}

const reminderCustomizationValidator = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    time: Joi.string().optional(),
    repeatType: Joi.string().optional(),
    isActive: Joi.string().optional()
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
}

const submitFeedbackValidator = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    subject: Joi.string().required(),
    details: Joi.string().required()
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
}

const uploadVideoValidator = (req, res, next) => {

  // const file = req?.file;
  // console.log("[file]:",file);
  // if (!req.file) {
  //   return res.status(400).json({
  //     status: 400,
  //     message: "Video file is required",
  //   });
  // }


  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    planId: Joi.string().required(),
    categoryId: Joi.number().required(),
    level: Joi.string().required()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    console.log("[error]",error)
    return res.status(400).json({
      status: 400,
      message: "Validation error",
      details: error.details,
    });
  }

  next(); 
}

const createCategoryValidator = (req, res, next) => {

  const file = req?.file;
  console.log("[file]:",file);
  if (!req.file) {
    return res.status(400).json({
      status: 400,
      message: "Image file is required",
    });
  }

  const schema = Joi.object({
    title: Joi.string().required(),
    tagline: Joi.string().required(),
    colors: Joi.string().custom((value, helper) => {
      try {
        JSON.parse(value); 
        return value;
      } catch (err) {
        return helper.message('Invalid JSON string');
      }
    }).required()
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
}


const updateVideoInfoValidator = (req, res, next) => {

  const schema = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    planId: Joi.number().optional(),
    categoryId: Joi.any().optional(),
    level: Joi.string().optional()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    console.log("[error]",error)

    return  res.status(400).json({
      status: 400,
      message: "Validation error",
      details: error.details,
    });
  }

  next(); 
}

const updateCategoryValidator = (req, res, next) => {

  const schema = Joi.object({
    title: Joi.string().optional(),
    tagline: Joi.string().optional(),
    colors: Joi.string().custom((value, helper) => {
      try {
        JSON.parse(value); 
        return value;
      } catch (err) {
        return helper.message('Invalid JSON string');
      }
    }).required(),
    categoryId: Joi.string().required()
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
}


const assignCustomVideoValidator = (req, res, next) => {



  const schema = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    userId: Joi.number().optional(),
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
}


const editCustomVideoInfoValidator = (req, res, next) => {

  const schema = Joi.object({
    userId: Joi.number().required(),
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    custom_manifestation_id: Joi.number().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    console.log("[ERROR]:",error);
    return res.status(400).json({
      status: 400,
      message: "Validation error",
      details: error.details,
    });
  }
  next(); 
}



module.exports = {
    signUpValidator,
    loginValidator,
    otpValidator,
    resetPasswordValidator,
    verifyOtpValidator,
    noteCreationValidator,
    noteEditValidator,
    changePasswordValidator,
    updateUserInfoValidator,
    reminderCreationValidator,
    reminderCustomizationValidator,
    submitFeedbackValidator,
    uploadVideoValidator,
    createCategoryValidator,
    updateVideoInfoValidator,
    updateCategoryValidator,
    assignCustomVideoValidator,
    editCustomVideoInfoValidator
}