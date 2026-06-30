import { Router } from "express";
import { verifyJWT } from "../../middleware/auth.middleware";
import { markConversationSeenHandler } from "./messages.controller";

const messagesRouter = Router();

messagesRouter
  .route("/:conversationId/seen")
  .post(verifyJWT, markConversationSeenHandler);

export { messagesRouter };
