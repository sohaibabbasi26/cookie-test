const express = require("express");
const router = express.Router();
const handlers = require("../handlers/authHandlers");
const validators = require("../middlewares/formValidators");
const { validateRefreshToken } = require("../middlewares/validateRefreshToken");
const verifyResetToken = require("../middlewares/forgotPasswordVerificator");
const authenticateJWT = require("../middlewares/jwtVerificator");

/**
 * @swagger
 * /sign-up:
 *   post:
 *     summary: Sign up a new user
 *     description: This endpoint allows a user to sign up with the provided credentials.
 *     operationId: signUp
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's full name.
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *               password:
 *                 type: string
 *                 description: The user's password.
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: The user's date of birth (optional).
 *     responses:
 *       201:
 *         description: Successfully signed up the user.
 *       400:
 *         description: Validation errors or missing fields.
 *       409:
 *         description: User already exists with the provided email.
 */
router.post('/sign-up', validators.signUpValidator, handlers.signupHandler);

/**
 * @swagger
 * /log-in:
 *   post:
 *     summary: Log in an existing user
 *     description: This endpoint allows a user to log in with their credentials.
 *     operationId: logIn
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *               password:
 *                 type: string 
 *                 description: The user's password.
 *     responses:
 *       200:
 *         description: Successfully logged in.
 *       401:
 *         description: Invalid email or password.
 *       400:
 *         description: Validation errors or missing fields.
 */
router.post('/log-in', validators.loginValidator, handlers.loginHandler);

/**
 * @swagger
 * /generate-otp:
 *   post:
 *     summary: Generate a one-time password (OTP)
 *     description: This endpoint generates an OTP for the user to verify their identity or proceed with password reset.
 *     operationId: generateOTP
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *     responses:
 *       200:
 *         description: OTP generated and sent successfully.
 *       400:
 *         description: Validation errors or missing fields.
 *       404:
 *         description: User not found with the provided email.
 */
router.post('/generate-otp', validators.otpValidator, handlers.generateOTP);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset user password
 *     description: This endpoint allows the user to reset their password using the generated OTP.
 *     operationId: resetPassword
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *               otp:
 *                 type: string
 *                 description: The OTP received by the user.
 *               newPassword:
 *                 type: string
 *                 description: The new password the user wants to set.
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *       400:
 *         description: Validation errors or missing fields.
 *       404:
 *         description: User not found or OTP is incorrect.
 */
router.post("/verify-otp", validators.verifyOtpValidator, handlers.verifyOtp);

router.post("/reset-password", verifyResetToken, handlers.resetPassword);

router.post("/get-access-token", validateRefreshToken,  handlers.getRefreshToken);

router.get("/get-popular-videos", authenticateJWT, () => {});


module.exports = router;

