import { Router } from "express";
import { login, logout, preRegister, refreshAccessToken, register, verifyOtpHandler, resendOtpHandler } from "./auth.controller";
import { verifyAPIKEY } from "../../middleware/apiKey.middleware";
import { ssoVerifyJWT } from "../../middleware/ssoAuth.middleware";

const authRouter = Router();

authRouter.route("/login").post(login);
authRouter.route("/logout").post(logout);
authRouter.route("/refresh").post(refreshAccessToken);
authRouter.route("/preregister").post(preRegister);
authRouter.route("/verify-otp").post(verifyOtpHandler);
authRouter.route("/resend-otp").post(resendOtpHandler);
authRouter.route("/register").post(register);
authRouter.route("/sso/login").post(verifyAPIKEY, ssoVerifyJWT, login);
authRouter.route("/sdk/register").post(verifyAPIKEY, ssoVerifyJWT, register);

export {
    authRouter
    }

