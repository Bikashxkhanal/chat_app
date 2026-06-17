import { Router } from "express";
import { login, preRegister, register } from "./auth.controller";
import { verifyAPIKEY } from "../../middleware/apiKey.middleware";
import { ssoVerifyJWT } from "../../middleware/ssoAuth.middleware";

const authRouter = Router();

authRouter.route("/login").post(login);
authRouter.route("/register").post(register);
authRouter.route("/sso/login").post(verifyAPIKEY, ssoVerifyJWT , login);

export {
    authRouter
    }

