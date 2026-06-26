import { getAssociatedUsersDetails, getConversationMessages } from "./users.controller";
import { Router } from "express";
import { verifyJWT } from "../../middleware/auth.middleware";

const userRouter = Router();

userRouter.route("/conv-message/:conversationedUserId").get(verifyJWT, getConversationMessages);
userRouter.route("/getAllConversationUsers").get(verifyJWT, getAssociatedUsersDetails);


export {
    userRouter
}