const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../helpers/generateOTP");
const { verifyGoogleToken } = require("../helpers/gmailAuth");
const { Plan, Likes, User, Saves } = require("../models/associations");
// const { where } = require("sequelize");
const { where, Op, Sequelize } = require("sequelize");
const { sequelize } = require("../models/associations");

const signupService = async (body) => {
  try {
    const check = await User.findOne({
      where: {
        email: body?.email,
        user_type: "User",
      },
    });
    console.log("[CHECK]:", check);

    if (!check) {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const result = await User.create({
        ...body,
        password: hashedPassword,
        planId: 1,
      });
      if (result) {
        return {
          status: 200,
          message: "Successfully signed up.",
        };
      } else {
        console.log("[RESULT]:", result);
        return {
          status: 500,
          message: "A problem occurred while signing-up.",
        };
      }
    } else {
      return {
        status: 409,
        message: "User with these credentials already exist",
      };
    }
  } catch (err) {
    console.log("[ERROR IN HANDLER]:", err);
    return {
      status: 500,
      message: "A problem occurred while signing-up.",
    };
  }
};

const googleSignupService = async (body) => {
  try {
    if (body?.idToken === null) {
      return {
        status: 404,
        message: "ID token was required to authenticate by means of google.",
        token: null,
        refreshToken: null,
      };
    }

    const check = await User.findOne({
      where: {
        email: body?.email,
        user_type: "User",
      },
      include: {
        model: Plan,  
      },
    });

    console.log("[CHECK]:", check);

    const payload = await verifyGoogleToken(body?.idToken);
    const { email, name, sub: googleId , picture} = payload;

    if (!check) {
      const result = await User.create({
        email,
        name,
        planId: 1,
        provider: body?.provider
      });

      console.log("[RESULT]:", result);
      let updateData;

      if (result) {
        // if (!result.fcmToken.includes(body?.fcmToken)) {
        updateData = {
          fcmToken: Array.isArray(result.fcmToken)
            ? [...result.fcmToken, body?.fcmToken]
            : [body?.fcmToken],
        };
        // }

        const userFcmUpdateQuery = await User.update(updateData, {
          where: {
            userId: result?.userId,
          },
        });

        console.log("[FCM UPDATE FOR USER RESPONSE]:", userFcmUpdateQuery);

        const userAfterUpate = await User.findByPk(result?.userId);

        const fetchLikesCount = await Likes.count({
          where: {
            userId: result?.userId,
          },
        });

        const fetchSavesCount = await Saves.count({
          where: {
            userId: result?.userId,
          },
        });

        

        const createdUser = await User.findByPk(result?.userId, {
          include: [
            {
              model: Plan
            }
          ]
        })

        console.log("[plan]:", createdUser?.Plan?.dataValues)

        const token = jwt.sign(
          {
            id: result?.userId,
            name: result?.name,
            email: result?.email,
            user_dob: result?.dob,
            provider: result?.provider,
            user_type: result?.user_type,
            likes: fetchLikesCount,
            saves: fetchSavesCount,
            fcmToken: userAfterUpate.fcmToken,
            profile_picture: picture,
            plan: createdUser?.Plan?.dataValues,
            notificationEnability: result?.notificationEnability
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "30m",
          }
        );

        const refreshToken = jwt.sign(
          {
            email: result?.email,
          },
          process.env.JWT_REFRESH_SECRET,
          {
            expiresIn: "15d",
          }
        );

        return {
          status: 200,
          message: "Successfully authenticated.",
          token: token,
          refreshToken: refreshToken,
        };
      } else {
        console.log("[RESULT]:", result);
        return {
          status: 500,
          message: "A problem occurred while signing-up.",
          token: null,
          refreshToken: null,
        };
      }
    } else {
      let updateData;

      // Ensure fcmToken is an array
      if (!Array.isArray(check.fcmToken)) {
        check.fcmToken = [];
      }

      if (!check.fcmToken.includes(body?.fcmToken)) {
        updateData = {
          fcmToken: [...check.fcmToken, body?.fcmToken],
        };
      }
      const userFcmUpdateQuery = await User.update(updateData, {
        where: {
          userId: check?.userId,
        },
      });

      const fetchLikesCount = await Likes.count({
        where: {
          userId: check?.userId,
        },
      });

      const fetchSavesCount = await Saves.count({
        where: {
          userId: check.userId,
        },
      });

      console.log("[FCM UPDATE FOR USER RESPONSE]:", userFcmUpdateQuery);

      const userAfterUpate = await User.findByPk(check?.userId);

      const token = jwt.sign(
        {
          id: check?.userId,
          name: check?.name,
          email: check?.email,
          user_dob: check?.dob,
          provider: check?.provider,
          user_type: check?.user_type,
          likes: fetchLikesCount,
          saves: fetchSavesCount,
          fcmToken: userAfterUpate?.fcmToken,
          profile_picture: picture, 
          plan: check?.Plan?.dataValues,
          notificationEnability: check?.notificationEnability
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "30m",
        }
      );

      const refreshToken = jwt.sign(
        {
          email: check?.email,
        },
        process.env.JWT_REFRESH_SECRET,
        {
          expiresIn: "15d",
        }
      );

      return {
        status: 200,
        message: "Successfully authenticated up.",
        token: token,
        refreshToken: refreshToken,
      };
    }
  } catch (err) {
    console.log("[ERROR IN HANDLER]:", err);
    return {
      status: 500,
      message: "A problem occurred while signing-up.",
      token: null,
      refreshToken: null,
    };
  }
};

const appleSignInService = async (body) => {
  try {
    const check = await User.findOne({
      where: {
        email: body?.email,
        user_type: "User",
      },
    });

    console.log("[CHECK]:", check);

    


    if (!check) {
      const result = await User.create({ ...body, planId: 1, fcmToken: body.fcmToken ? [body.fcmToken] : [], });
      console.log("[RESULT]:", result);

      if (result) {
        const fetchLikesCount = await Likes.count({
          where: {
            userId: result?.userId,
          },
        });
    
        const fetchSavesCount = await Saves.count({
          where: {
            userId: result?.userId,
          },
        });

        let updateData;

        if (!result.fcmToken.includes(body?.fcmToken)) {
          updateData.fcmToken = [...result.fcmToken, body?.fcmToken];
        }

        const userFcmUpdateQuery = await User.update(updateData, {
          where: {
            userId: result?.userId,
          },
        });

        console.log("[UPDATED USER FCM TOKEN]:", userFcmUpdateQuery);

        const userAfterUpate = await User.findByPk(result?.userId, {
          include: [
            {
              model: Plan
            }
          ]
        });

        

        const token = jwt.sign(
          {
            id: check?.userId,
            name: result?.name,
            email: result?.email,
            user_dob: result?.dob,
            provider: result?.provider,
            user_type: result?.user_type,
            likes: fetchLikesCount,
            saves: fetchSavesCount,
            fcmToken: userAfterUpate.fcmToken,
            plan: userAfterUpate?.Plan?.dataValues,
            notificationEnability: result?.notificationEnability
          },

          process.env.JWT_SECRET,
          {
            expiresIn: "30m",
          }
        );

        const refreshToken = jwt.sign(
          {
            email: check?.email,
          },
          process.env.JWT_REFRESH_SECRET,
          {
            expiresIn: "15d",
          }
        );

        return {
          status: 200,
          message: "Successfully authenticated.",
          token: token,
          refreshToken: refreshToken,
        };
      } else {
        console.log("[RESULT]:", result);
        return {
          status: 500,
          message: "A problem occurred while signing-up.",
          token: null,
          refreshToken: null,
        };
      }
    } else {

      let updateData;
      // if (!check.fcmToken.includes(body?.fcmToken)) {
      //   updateData.fcmToken = [...check.fcmToken, body?.fcmToken];
      // }

      const userFcmUpdateQuery = await User.update({ fcmToken: body.fcmToken ? [body.fcmToken] : [],}, {
        where: {
          userId: check?.userId,
        },
        
      });

      const userAfterUpate = await User.findByPk(check?.userId, {
        include: [
          {
            model: Plan
          }
        ]
      });

      const fetchLikesCount = await Likes.count({
        where: {
          userId: check?.userId,
        },
      });
  
      const fetchSavesCount = await Saves.count({
        where: {
          userId: check?.userId,
        },
      });

      const token = jwt.sign(
        {
          id: check?.userId,
          name: check?.name,
          email: check?.email,
          user_dob: check?.dob,
          provider: check?.provider,
          user_type: check?.user_type,
          likes: fetchLikesCount,
          saves: fetchSavesCount,
          fcmToken: userAfterUpate?.fcmToken,
          plan: userAfterUpate?.Plan.dataValues,
          notificationEnability: check?.notificationEnability
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "30m",
        }
      );

      const refreshToken = jwt.sign(
        {
          email: check?.email,
        },
        process.env.JWT_REFRESH_SECRET,
        {
          expiresIn: "15d",
        }
      );

      return {
        status: 200,
        message: "Successfully authenticated up.",
        token: token,
        refreshToken: refreshToken,
      };
    }
  } catch (err) {
    console.log("[ERROR WHILE APPLE SIGN IN]:", err);
    return {
      status: 500,
      message: "A problem occurred while signing-in.",
      token: null,
      refreshToken: null,
    };
  }
};

const loginService = async (body) => {
  console.log(body);
  try {
    const check = await User.findOne({
      where: {
        email: body?.email,
        user_type: "User",
      },
      include: {
        model: Plan,  
      },
    });

    if (!check) {
      return {
        status: 404,
        message: "Account doesn't exist.",
        token: null,
      };
    }

    console.log("[check]:", check);

    const fetchLikesCount = await Likes.count({
      where: {
        userId: check?.userId,
      },
    });

    const fetchSavesCount = await Saves.count({
      where: {
        userId: check.userId,
      },
    });

    let updateData = {};

    console.log("[CHECK]:", check);

    console.log("[fcm tokens with found user]:", check?.fcmToken);

    if (check?.provider === "Manual") {
      if (check?.fcmToken && !check.fcmToken.includes(body?.fcmToken)) {
        await User.update(
          {
            fcmToken: sequelize.fn(
              "array_append",
              sequelize.col("fcmToken"),
              body.fcmToken
            ),
          },
          {
            where: {
              userId: check?.userId,
            },
          }
        );
        console.log("FCM token appended.");
      }

      const passwordMatch = await bcrypt.compare(
        body?.password,
        check?.password
      );
      console.log("[PASSWORDS MATCHED]:", passwordMatch);
      if (!passwordMatch) {
        return {
          status: 401,
          message: "Invalid Password",
          token: null,
        };
      } else if (passwordMatch) {
        const userFcmUpdateQuery = await User.update(updateData, {
          where: {
            userId: check?.userId,
          },
        });

        const userAfterUpate = await User.findByPk(check?.userId);

        console.log("[FCM UPDATE FOR USER RESPONSE]:", userFcmUpdateQuery);

        const token = jwt.sign(
          {
            id: check?.userId,
            name: check?.name,
            user_dob: check?.dob,
            email: check?.email,
            provider: check?.provider,
            user_type: check?.user_type,
            plan: check.Plan?.dataValues,
            profile_picture: check?.profile_picture,
            fcmToken: userAfterUpate?.fcmToken,
            notificationEnability: check?.notificationEnability,
            likes: fetchLikesCount,
            Saves: fetchSavesCount,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "30m",
          }
        );

        const refreshToken = jwt.sign(
          {
            email: check?.email,
          },
          process.env.JWT_REFRESH_SECRET,
          {
            expiresIn: "15d",
          }
        );

        return {
          status: 200,
          message: "Successfully logged in.",
          token: token,
          refreshToken: refreshToken,
        };
      }
    } else if (check?.provider === "Google" || check?.provider === "Apple") {
      await User.update(
        {
          fcmToken: sequelize.fn(
            "array_append",
            sequelize.col("fcmToken"),
            body.fcmToken
          ),
        },
        {
          where: {
            userId: check?.userId,
          },
        }
      );
      console.log("FCM token appended.");
      const userAfterUpate = await User.findByPk(check?.userId);

      console.log("[FCM UPDATE FOR USER RESPONSE]:", userFcmUpdateQuery);

      const token = jwt.sign(
        {
          id: check?.userId,
          name: check?.name,
          user_dob: check?.dob,
          email: check?.email,
          provider: check?.provider,
          user_type: check?.user_type,
          likes: fetchLikesCount,
          Saves: fetchSavesCount,
          fcmToken: userAfterUpate?.fcmToken,
          notificationEnability: check?.notificationEnability
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "30m",
        }
      );

      const refreshToken = jwt.sign(
        {
          email: check?.email,
        },
        process.env.JWT_REFRESH_SECRET,
        {
          expiresIn: "15d",
        }
      );
      return {
        status: 200,  
        message: "Successfully logged in.",
        token: token,
        refreshToken: refreshToken,
      };
    } else {
      return {
        status: 404,
        message: "User with these credentials doesn't exist",
        token: null,
        refreshToken: null,
      };
    }
  } catch (err) {
    console.log("[ERROR IN HANDLER]:", err);
    return {
      status: 500,
      message: "A problem occurred while logging in.",
      token: null,
      refreshToken: null,
    };
  }
};

const generateOTPService = async (body) => {
  try {
    const check = await User.findOne({
      where: {
        email: body?.email,
      },
    });

    if (check) {
      const otp = await generateOTP();
      console.log("[OTP]:", otp);

      const result = User.update(
        { otp: otp },
        {
          where: {
            email: body?.email,
          },
        }
      );
      console.log("[RESULT]:", result);

      return {
        status: 200,
        message: "Successsfully generated an OTP.",
        otp: otp,
      };
    } else {
      return {
        status: 401,
        message: "Account with this email doesn't exist.",
        otp: null,
      };
    }
  } catch (err) {
    console.log("[ERROR WHILE GENERATING OTP]:", err);
    return {
      status: 500,
      message: "Some problem occurred while generating OTP.",
      otp: null,
    };
  }
};

const verifyOtpService = async (body) => {
  try {
    const email = body.email;
    const otp = body.otp;

    const checkIfUser = await User.findOne({
      where: {
        email: email,
        user_type: "User",
      },
    });

    if (checkIfUser) {
      if (checkIfUser?.provider === "Manual") {
        if (checkIfUser?.otp === otp) {
          const token = jwt.sign(
            {
              id: checkIfUser?.userId,
              name: checkIfUser?.name,
              user_dob: checkIfUser?.dob,
              email: checkIfUser?.email,
              provider: checkIfUser?.provider,
              user_type: checkIfUser?.user_type,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "10m",
            }
          );

          return {
            status: 200,
            message: "OTP matched",
            matched: true,
            token: token,
          };
        } else {
          console.log("[USER]:", checkIfUser);
          return {
            status: 401,
            message: "Wrong OTP entered.",
            matched: false,
            token: null,
          };
        }
      } else {
        return {
          status: 401,
          message:
            "You can't change a password for any third-party SSO provider.",
          matched: false,
          token: null,
        };
      }
    } else {
      console.log("[CHECK]:", checkIfUser);
      return {
        status: 401,
        message: "Unauthorized Access.",
        matched: false,
        token: null,
      };
    }
  } catch (err) {
    console.log("[ERROR WHILE RESETTING THE PASSWORD]:", err);
    return {
      status: 500,
      message: "Couldn't reset the password.",
      matched: false,
      token: null,
    };
  }
};

const resetPasswordService = async (user, body) => {
  try {
    const email = body.email;
    const password = body.password;

    if (email !== user.email) {
      return {
        status: 403,
        message: "Unauthorized access to reset password.",
      };
    }

    const checkIfUser = await User.findOne({
      where: {
        email: email,
        user_type: "User",
      },
    });

    if (checkIfUser?.provider === "Manual") {
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await User.update(
        {
          password: hashedPassword,
          otp: null,
        },
        {
          where: {
            email: email,
            user_type: "User",
          },
        }
      );

      console.log("[USER UPDATED]:", result);
      return {
        status: 200,
        message: "Password has been reset",
      };
    } else {
      console.log("[USER]:", checkIfUser);
      return {
        status: 401,
        message: "Wrong OTP entered.",
      };
    }
  } catch (err) {
    console.log("[ERROR WHILE RESETTING THE PASSWORD]:", err);
    return {
      status: 500,
      message: "Couldn't reset the password.",
    };
  }
};

const getRefreshTokenService = async (user) => {
  try {
    const existingUser = await User.findOne({
      where: { email: user?.email },
      include: {
        model: Plan,
      },
    });

    const fetchLikesCount = await Likes.count({
      where: {
        userId: existingUser?.userId,
      },
    });

    const fetchSavesCount = await Saves.count({
      where: {
        userId: existingUser?.userId,
      },
    });

    const newAccessToken = jwt.sign(
      {
        id: existingUser?.userId,
        name: existingUser?.name,
        user_dob: existingUser?.dob,
        email: existingUser?.email,
        provider: existingUser?.provider,
        user_type: existingUser?.user_type,
        plan: existingUser.Plan?.dataValues,
        profile_picture: existingUser?.profile_picture,
        fcmToken: existingUser?.fcmToken,
        notificationEnability: existingUser?.notificationEnability,
        likes: fetchLikesCount,
        saves: fetchSavesCount,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    return {
      status: 200,
      message: "Successfully created an access token.",
      newToken: newAccessToken,
    };
  } catch (err) {
    console.log("[ERROR WHILE GENERATING AN ACCESS TOKEN]:", err);
    return {
      status: 500,
      message: "Some problem occurrd while generating an access token",
      newToken: null,
    };
  }
};

module.exports = {
  signupService,
  loginService,
  generateOTPService,
  verifyOtpService,
  googleSignupService,
  appleSignInService,
  resetPasswordService,
  getRefreshTokenService,
};
