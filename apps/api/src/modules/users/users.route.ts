import { getAssociatedUsersDetails, getConversationMessages, searchUsers } from "./users.controller";
import { getMyProfile, updateMyProfile, uploadProfileAvatar } from "./profile.controller";
import { Router } from "express";
import { verifyJWT } from "../../middleware/auth.middleware";
import { standaloneOnly } from "../../middleware/standaloneOnly.middleware";
import { upload } from "../../middleware/multer.middleware";

const userRouter = Router();

userRouter.route("/me").get(verifyJWT, standaloneOnly, getMyProfile);
userRouter.route("/me").patch(verifyJWT, standaloneOnly, updateMyProfile);
userRouter.route("/conv-message/:conversationedUserId").get(verifyJWT, getConversationMessages);
userRouter.route("/getAllConversationUsers").get(verifyJWT, getAssociatedUsersDetails);
userRouter.route("/search").get(verifyJWT, searchUsers);
userRouter.route("/upload-profile").post(verifyJWT, upload.fields([{name : "profilePicture",maxCount : 1}]), uploadProfileAvatar)

export {
    userRouter
}