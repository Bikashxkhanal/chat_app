import { Router } from "express";
import { verifyJWT } from "../../middleware/auth.middleware";
import { createOrGetDirectConversation, getMessagesByConversationId } from "./conversations.controller";

const conversationRouter = Router();

conversationRouter
  .route("/direct")
  .post(verifyJWT, createOrGetDirectConversation);

conversationRouter
  .route("/:conversationId/messages")
  .get(verifyJWT, getMessagesByConversationId);

export { conversationRouter };
