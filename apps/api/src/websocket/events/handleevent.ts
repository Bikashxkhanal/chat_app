import {
  mountJoinChatEvent,
  mountLeaveChatEvent,
  mountMarkSeenEvent,
  mountMessageAckEvent,
  mountSendMessageEvent,
  mountTypingChatEvent,
  mountTypingStopEvent,
  registerPresence,
} from "./register-chat-event";

export const handleEvents = (socket: any, io: any) => {
  registerPresence(socket, io);
  mountJoinChatEvent(socket);
  mountLeaveChatEvent(socket);
  mountTypingChatEvent(socket, io);
  mountTypingStopEvent(socket, io);
  mountSendMessageEvent(socket, io);
  mountMarkSeenEvent(socket, io);
  mountMessageAckEvent(socket, io);
};
