import mongoose from "mongoose";
import { conversationModel, MessageModel, userModel } from "@repo/db-nosql";
import { CONVERSATION_TYPE } from "@repo/types";
import { ApiError, ApiResponse } from "@repo/utils";
import { asyncHandler } from "../../utils";
import { enrichMessagesWithAuthors } from "../../services/message.service";

const createOrGetDirectConversation = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) throw new ApiError(401, "Unauthorized request");

  const { recipientId } = req.body;

  if (!recipientId) throw new ApiError(400, "Recipient user id is required");
  if (!mongoose.isObjectIdOrHexString(recipientId)) {
    throw new ApiError(400, "Invalid recipient user id");
  }

  if (recipientId === currentUser._id.toString()) {
    throw new ApiError(400, "Cannot start a conversation with yourself");
  }

  const recipient = await userModel.findById(recipientId);
  if (!recipient) throw new ApiError(404, "Recipient user not found");

  if (
    currentUser.tenant_id &&
    recipient.tenant_id &&
    currentUser.tenant_id.toString() !== recipient.tenant_id.toString()
  ) {
    throw new ApiError(403, "Cannot message users from another tenant");
  }

  const currentUserId = new mongoose.Types.ObjectId(currentUser._id);
  const recipientObjectId = new mongoose.Types.ObjectId(recipientId);

  let conversation = await conversationModel.findOne({
    participants: { $all: [currentUserId, recipientObjectId] },
    is_group: false,
    is_deleted: false,
  });

  if (!conversation) {
    conversation = await conversationModel.create({
      participants: [currentUserId, recipientObjectId],
      type: CONVERSATION_TYPE.DIRECT,
      is_group: false,
    } as never);
  }

  return res.json(
    new ApiResponse(200, conversation, "Conversation ready")
  );
});

const getMessagesByConversationId = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) throw new ApiError(401, "Unauthorized");

  const conversationId = String(req.params.conversationId);
  const query = req.query as { page?: string; limit?: string };

  if (!mongoose.isObjectIdOrHexString(conversationId)) {
    throw new ApiError(400, "Invalid conversation id");
  }

  const conversation = await conversationModel.findOne({
    _id: conversationId,
    participants: currentUser._id,
    is_deleted: false,
  } as Record<string, unknown>);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 30;
  const offset = (page - 1) * limit;

  const messages = await MessageModel.find({
    conversation_Id: conversation._id,
    is_Deleted: false,
  } as Record<string, unknown>)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  const enriched = await enrichMessagesWithAuthors(
    messages as unknown as Parameters<typeof enrichMessagesWithAuthors>[0]
  );

  return res.json(
    new ApiResponse(
      200,
      { conversation, messages: enriched.reverse() },
      "Messages fetched successfully"
    )
  );
});

export { createOrGetDirectConversation, getMessagesByConversationId };
