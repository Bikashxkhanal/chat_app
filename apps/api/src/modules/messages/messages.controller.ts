import { ApiError, ApiResponse } from "@repo/utils";
import { asyncHandler } from "../../utils";
import { markConversationSeen } from "../../services/message.service";

export const markConversationSeenHandler = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized");

  const conversationId = String(req.params.conversationId);
  if (!conversationId) throw new ApiError(400, "Conversation id required");

  const seenMessages = await markConversationSeen(conversationId, user._id);

  return res.json(
    new ApiResponse(200, { messages: seenMessages }, "Messages marked as seen")
  );
});
