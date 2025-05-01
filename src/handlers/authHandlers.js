const { token } = require("morgan");
const service = require("../services/authServices");

const signupHandler = async (request, response) => {
  try {
    const body = request?.body;
    const provider = body.provider;
    console.log("[BODY DATA]:", body);

    if (provider === "Manual") {
      const result = await service.signupService(body);
      response.status(result?.status).send({
        status: result?.status,
        message: result?.message,
      });
    } else if (provider === "Google") {
      const result = await service.googleSignupService(body);
      response.status(result?.status).send({
        status: result?.status,
        message: result?.message,
        token: result?.token,
        flow: "gmailFlow",
      });
    } else if (provider === "Apple") {
      const result = await service.appleSignInService(body);
      response.status(result?.status).send({
        status: result?.status,
        message: result?.message,
        token: result?.token,
        flow: "appleFlow",
      });
    } else {
      response.status(401).send({
        status: 401,
        message: "Unauthorized Access.",
        token: null
      });
    }
  } catch (err) {
    console.log("[ERROR IN HANDLER]:", err);
    response.status(500).send({
      status: 500,
      message: "A problem occurred while signing-up.",
    });
  }
};

const loginHandler = async (request, response) => {
  try {
    const body = request?.body;
    console.log("[BODY DATA]:", body);

    if (body?.provider === "Manual") {
      const result = await service.loginService(body);

      response.status(result?.status).send({
        status: result?.status,
        message: result?.message,
        token: result?.token,
        refreshToken: result?.refreshToken
      });
    } else if (body?.provider === "Google") {
      const result = await service.googleSignupService(body);
      response.status(result?.status).send({
        status: result?.status,
        message: result?.message,
        token: result?.token,
        refreshToken: result?.refreshToken,
        flow: "gmailFlow",
      });
    } else if (body?.provider === "Apple") {
      const result = await service.appleSignInService(body);
      response.status(result?.status).send({
        status: result?.status,
        message: result?.message,
        token: result?.token,
        refreshToken: result?.refreshToken,
        flow: "appleFlow",
      });
    } else {
      response.status(401).send({
        status: 401,
        message: "Unauthorized Access.",
      });
    }
  } catch (err) {
    console.log("[ERROR IN HANDLER]:", err);
    response.status(500).send({
      status: 500,
      message: "A problem occurred while logging-in.",
    });
  }
};

const getRefreshToken = async (request, response) => {
  try {
    const user = request?.user;
    console.log("[User]:", user);
    const result = await service.getRefreshTokenService(user);
    console.log("[RESULT]:",result);
    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      newToken: result?.newToken
    })
  } catch (err) {
    console.log("[ERR]:",err);
    response.status(500).status({
      status: 500,
      message: "A problem occurred while generating refresh token.",
      newToken: null
    })
  }
} 

const generateOTP = async (request, response) => {
  try {
    const body = request?.body;
    console.log("[BODY DATA]:", body);
    const result = await service.generateOTPService(body);

    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      otp: result?.otp,
    });
  } catch (err) {
    console.log("[ERROR IN HANDLER]:", err);
    response.status(500).send({
      status: 500,
      message: "Some problem occurred while generating OTP.",
      otp: null,
    });
  }
};

const verifyOtp = async (request, response) => {
  try {
    const body = request?.body;
    const result = await service.verifyOtpService(body);

    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
      matched: result?.matched,
      token: result?.token
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Couldn't compare the otps password.",
      matched: false,
      token: null
    });
  }
};


const resetPassword = async (request, response) => {
  try {
    const body = request?.body;
    const user = request?.user;
    const result = await service.resetPasswordService(user, body);

    response.status(result?.status).send({
      status: result?.status,
      message: result?.message,
    });
  } catch (err) {
    console.log("[ERROR]:", err);
    response.status(500).send({
      status: 500,
      message: "Couldn't compare the otps password.",
    });
  }
}

const getPopularVideos = async (request, response) => {
  try {
      
  } catch (err) {
    console.log("[ERROR]:",err);
    response.status(500).send({
      status: 500,
      message: "Some problem occured while getting "
    })
  }
}

module.exports = {
  signupHandler,
  loginHandler,
  generateOTP,
  verifyOtp,
  resetPassword,
  getRefreshToken,
  getPopularVideos
};
