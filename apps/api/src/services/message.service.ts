import mongoose from "mongoose";
import { conversationModel, MessageModel, userModel } from "@repo/db-nosql";
import {
  MESSAGE_STATUS,
  type MessageAuthorProfile,
  type MessageReceivedPayload,
} from "@repo/types";

export function toMessagePayload(message: {
  _id: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  conversation_Id: mongoose.Types.ObjectId;
  text: string;
  status?: string;
  clientMessageId?: string;
  delivered_at?: Date | null;
  seen_at?: Date | null;
  createdAt?: Date;
}): MessageReceivedPayload {
  return {
    _id: message._id.toString(),
    author: message.author.toString(),
    conversation_Id: message.conversation_Id.toString(),
    text: message.text,
    status: (message.status as MessageReceivedPayload["status"]) ?? MESSAGE_STATUS.SENT,
    clientMessageId: message.clientMessageId,
    delivered_at: message.delivered_at?.toISOString() ?? null,
    seen_at: message.seen_at?.toISOString() ?? null,
    createdAt: (message.createdAt ?? new Date()).toISOString(),
  };
}

export async function assertConversationParticipant(
  conversationId: string,
  userId: mongoose.Types.ObjectId
) {
  return conversationModel.findOne({
    _id: new mongoose.Types.ObjectId(conversationId),
    participants: userId,
    is_deleted: false,
  } as Record<string, unknown>);
}

export async function markMessagesDelivered(
  messageIds: string[],
  recipientId: string
) {
  const now = new Date();
  await MessageModel.updateMany(
    {
      _id: { $in: messageIds.map((id) => new mongoose.Types.ObjectId(id)) },
      author: { $ne: new mongoose.Types.ObjectId(recipientId) },
      status: MESSAGE_STATUS.SENT,
    } as Record<string, unknown>,
    {
      $set: { status: MESSAGE_STATUS.DELIVERED, delivered_at: now },
    }
  );

  return MessageModel.find({
    _id: { $in: messageIds.map((id) => new mongoose.Types.ObjectId(id)) },
  } as Record<string, unknown>).lean();
}

export async function markConversationSeen(
  conversationId: string,
  viewerId: mongoose.Types.ObjectId
) {
  const now = new Date();

  await MessageModel.updateMany(
    {
      conversation_Id: new mongoose.Types.ObjectId(conversationId),
      author: { $ne: viewerId },
      seen_at: null,
      is_Deleted: false,
    } as Record<string, unknown>,
    {
      $set: { status: MESSAGE_STATUS.SEEN, seen_at: now },
    }
  );

  const messages = await MessageModel.find({
    conversation_Id: new mongoose.Types.ObjectId(conversationId),
    author: { $ne: viewerId },
    seen_at: now,
  } as Record<string, unknown>).lean();

  return messages.map((m) =>
    toMessagePayload(m as unknown as Parameters<typeof toMessagePayload>[0])
  );
}

export async function enrichMessagesWithAuthors(
  messages: Array<{
    _id: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    conversation_Id: mongoose.Types.ObjectId;
    text: string;
    status?: string;
    clientMessageId?: string;
    delivered_at?: Date | null;
    seen_at?: Date | null;
    createdAt?: Date;
  }>
): Promise<MessageReceivedPayload[]> {
  if (messages.length === 0) return [];

  const authorIds = [...new Set(messages.map((m) => m.author.toString()))];
  const users = await userModel
    .find({ _id: { $in: authorIds } } as Record<string, unknown>)
    .select("full_name avatar")
    .lean();

  const profileMap = new Map<string, MessageAuthorProfile>(
    users.map((u) => [
      u._id.toString(),
      {
        _id: u._id.toString(),
        full_name: u.full_name ?? undefined,
        avatar: u.avatar ?? null,
      },
    ])
  );

  return messages.map((message) => ({
    ...toMessagePayload(message),
    authorProfile: profileMap.get(message.author.toString()),
  }));
}

export async function getUnreadCount(
  conversationId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
) {
  return MessageModel.countDocuments({
    conversation_Id: conversationId,
    author: { $ne: userId },
    seen_at: null,
    is_Deleted: false,
  } as Record<string, unknown>);
}
