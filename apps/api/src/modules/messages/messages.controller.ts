import { ApiError, ApiResponse } from "@repo/utils";
import { chatEventEnums, MESSAGE_STATUS } from "@repo/types";
import { asyncHandler } from "../../utils";
import { markConversationSeen } from "../../services/message.service";

export const markConversationSeenHandler = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized");

  const conversationId = String(req.params.conversationId);
  if (!conversationId) throw new ApiError(400, "Conversation id required");

  const seenMessages = await markConversationSeen(conversationId, user._id);

  // The SDK also sends this request as a reliability fallback. Emit receipts
  // here too so a fast HTTP response cannot race the socket event and leave
  // the sender's UI stuck at "delivered".
  const io = req.app.get("io");
  for (const message of seenMessages) {
    io.to(message.author).emit(chatEventEnums.MESSAGE_SEEN_EVENT, {
      messageId: message._id,
      conversationId,
      status: MESSAGE_STATUS.SEEN,
      seen_at: message.seen_at,
    });
  }

  return res.json(
    new ApiResponse(200, { messages: seenMessages }, "Messages marked as seen")
  );
});



