import { Router } from "express";
import { verifyJWT } from "../../middleware/auth.middleware";
import { createGroup, getGroupByConversation } from "./groups.controller";

const groupsRouter = Router();

groupsRouter.route("/").post(verifyJWT, createGroup);
groupsRouter.route("/conversation/:conversationId").get(verifyJWT, getGroupByConversation);

export { groupsRouter };
