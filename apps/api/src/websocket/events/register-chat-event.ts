import { chatEventEnums, MESSAGE_STATUS } from "@repo/types";
import { conversationModel, MessageModel, userModel } from "@repo/db-nosql";
import mongoose from "mongoose";
import {
  assertConversationParticipant,
  markConversationSeen,
  markMessagesDelivered,
  toMessagePayload,
} from "../../services/message.service";
import { presenceStore } from "../../services/presence.store";

export const mountJoinChatEvent = (socket: any) => {
  socket.on(chatEventEnums.JOIN_CHAT_EVENT, (chatId: string) => {
    socket.join(chatId);
  });
};

export const mountLeaveChatEvent = (socket: any) => {
  socket.on(chatEventEnums.LEAVE_CHAT_EVENT, (chatId: string) => {
    socket.leave(chatId);
  });
};

export const mountTypingChatEvent = (socket: any, io: any) => {
  socket.on(
    chatEventEnums.TYPING_EVENT,
    async (payload: { conversationId: string } | string) => {
      const conversationId =
        typeof payload === "string" ? payload : payload.conversationId;
      if (!conversationId) return;

      const typingPayload = {
        conversationId: conversationId.toString(),
        userId: socket.user._id.toString(),
      };

      socket.to(conversationId.toString()).emit(chatEventEnums.TYPING_EVENT, typingPayload);

      const conversation = await conversationModel
        .findById(conversationId)
        .select("participants")
        .lean();

      for (const participant of conversation?.participants ?? []) {
        const participantId = participant.toString();
        if (participantId === socket.user._id.toString()) continue;
        io.to(participantId).emit(chatEventEnums.TYPING_EVENT, typingPayload);
      }
    }
  );
};

export const mountTypingStopEvent = (socket: any, io: any) => {
  socket.on(
    chatEventEnums.STOP_TYPING_EVENT,
    async (payload: { conversationId: string } | string) => {
      const conversationId =
        typeof payload === "string" ? payload : payload.conversationId;
      if (!conversationId) return;

      const stopPayload = {
        conversationId: conversationId.toString(),
        userId: socket.user._id.toString(),
      };

      socket.to(conversationId.toString()).emit(chatEventEnums.STOP_TYPING_EVENT, stopPayload);

      const conversation = await conversationModel
        .findById(conversationId)
        .select("participants")
        .lean();

      for (const participant of conversation?.participants ?? []) {
        const participantId = participant.toString();
        if (participantId === socket.user._id.toString()) continue;
        io.to(participantId).emit(chatEventEnums.STOP_TYPING_EVENT, stopPayload);
      }
    }
  );
};

export const mountMarkSeenEvent = (socket: any, io: any) => {
  socket.on(
    chatEventEnums.MARK_SEEN_EVENT,
    async (payload: { conversationId: string }) => {
      try {
        const { conversationId } = payload;
        if (!conversationId) return;

        const conversation = await assertConversationParticipant(
          conversationId,
          socket.user._id
        );
        if (!conversation) return;

        const seenMessages = await markConversationSeen(
          conversationId,
          socket.user._id
        );

        for (const msg of seenMessages) {
          io.to(msg.author).emit(chatEventEnums.MESSAGE_SEEN_EVENT, {
            messageId: msg._id,
            conversationId,
            status: MESSAGE_STATUS.SEEN,
            seen_at: msg.seen_at,
          });
        }
      } catch {
        socket.emit(chatEventEnums.SOCKET_ERROR_EVENT, "Failed to mark messages seen");
      }
    }
  );
};

export const mountSendMessageEvent = (socket: any, io: any) => {
  socket.on(
    chatEventEnums.SEND_MESSAGE_EVENT,
    async (payload: {
      conversationId: string;
      text: string;
      recipientId?: string;
      clientMessageId?: string;
      isGroup?: boolean;
    }) => {
      try {
        const { conversationId, text, recipientId, clientMessageId, isGroup } = payload;

        if (!conversationId || !text?.trim()) {
          socket.emit(chatEventEnums.SOCKET_ERROR_EVENT, "Invalid message payload");
          return;
        }

        const conversation = await assertConversationParticipant(
          conversationId,
          socket.user._id
        );

        if (!conversation) {
          socket.emit(chatEventEnums.SOCKET_ERROR_EVENT, "Conversation not found");
          return;
        }

        const isGroupChat = Boolean(conversation.is_group || isGroup);

        if (!isGroupChat && !recipientId) {
          socket.emit(chatEventEnums.SOCKET_ERROR_EVENT, "Recipient is required for direct messages");
          return;
        }

        const message = await MessageModel.create({
          author: socket.user._id,
          conversation_Id: conversation._id,
          text: text.trim(),
          is_Media: false,
          is_Deleted: false,
          status: MESSAGE_STATUS.SENT,
          clientMessageId: clientMessageId ?? null,
        } as Record<string, unknown>);

        await conversationModel.findByIdAndUpdate(conversation._id, {
          updatedAt: new Date(),
        });

        const saved = message as unknown as Parameters<typeof toMessagePayload>[0];
        const messagePayload = {
          ...toMessagePayload(saved),
          ...(isGroupChat && {
            authorProfile: {
              _id: socket.user._id.toString(),
              full_name: socket.user.full_name,
              avatar: socket.user.avatar ?? null,
            },
          }),
        };

        const senderPayload = { ...messagePayload, status: MESSAGE_STATUS.SENT };

        socket.emit(chatEventEnums.MESSAGE_SENT_EVENT, senderPayload);

        const deliveredAt = new Date().toISOString();
        const notifyDelivered = (targetUserId: string) => {
          if (!presenceStore.isOnline(targetUserId)) return;
          const deliveredPayload = {
            messageId: messagePayload._id,
            conversationId,
            status: MESSAGE_STATUS.DELIVERED,
            delivered_at: deliveredAt,
            clientMessageId,
          };
          io.to(socket.user._id.toString()).emit(
            chatEventEnums.MESSAGE_DELIVERED_EVENT,
            deliveredPayload
          );
          io.to(targetUserId).emit(chatEventEnums.MESSAGE_DELIVERED_EVENT, deliveredPayload);
        };

        if (isGroupChat) {
          const participants = (conversation.participants ?? []) as unknown as mongoose.Types.ObjectId[];
          for (const participant of participants) {
            const participantId = participant.toString();
            if (participantId === socket.user._id.toString()) continue;

            io.to(participantId).emit(chatEventEnums.MESSAGE_RECEIVED_EVENT, messagePayload);
            io.to(participantId).emit(chatEventEnums.NEW_CHAT_EVENT, {
              conversationId,
              lastMessage: messagePayload,
            });
            notifyDelivered(participantId);
          }
        } else {
          socket.to(conversationId).emit(chatEventEnums.MESSAGE_RECEIVED_EVENT, messagePayload);
          io.to(recipientId!).emit(chatEventEnums.MESSAGE_RECEIVED_EVENT, messagePayload);
          notifyDelivered(recipientId!);
          io.to(recipientId!).emit(chatEventEnums.NEW_CHAT_EVENT, {
            conversationId,
            lastMessage: messagePayload,
          });
        }
      } catch {
        if (payload.clientMessageId) {
          socket.emit(chatEventEnums.SOCKET_ERROR_EVENT, {
            message: "Failed to send message",
            clientMessageId: payload.clientMessageId,
            status: MESSAGE_STATUS.FAILED,
          });
        } else {
          socket.emit(chatEventEnums.SOCKET_ERROR_EVENT, "Failed to send message");
        }
      }
    }
  );
};

export const mountMessageAckEvent = (socket: any, io: any) => {
  socket.on(
    chatEventEnums.MESSAGE_ACK_EVENT,
    async (payload: { messageId: string; conversationId: string }) => {
      const { messageId, conversationId } = payload;
      if (!messageId || !conversationId) return;

      const conversation = await assertConversationParticipant(
        conversationId,
        socket.user._id
      );
      if (!conversation) return;

      await markMessagesDelivered([messageId], socket.user._id.toString());

      const deliveredAt = new Date().toISOString();
      const statusPayload = {
        messageId,
        conversationId,
        status: MESSAGE_STATUS.DELIVERED,
        delivered_at: deliveredAt,
      };

      io.to(conversationId).emit(chatEventEnums.MESSAGE_DELIVERED_EVENT, statusPayload);
    }
  );
};

export const registerPresence = async (socket: any, io: any) => {
  const userId = socket.user._id.toString();
  presenceStore.markOnline(userId);

  await userModel.findByIdAndUpdate(socket.user._id, {
    last_active_at: new Date(),
  });

  socket.broadcast.emit(chatEventEnums.USER_ONLINE_EVENT, {
    userId,
    isOnline: true,
    lastActiveAt: new Date().toISOString(),
  });

  socket.on("disconnect", async () => {
    const fullyOffline = presenceStore.markOffline(userId);
    if (fullyOffline) {
      const lastActiveAt = new Date();
      await userModel.findByIdAndUpdate(socket.user._id, {
        last_active_at: lastActiveAt,
      });
      socket.broadcast.emit(chatEventEnums.USER_OFFLINE_EVENT, {
        userId,
        isOnline: false,
        lastActiveAt: lastActiveAt.toISOString(),
      });
    }
  });
};
