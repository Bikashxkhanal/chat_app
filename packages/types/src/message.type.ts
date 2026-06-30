import type { Types } from "mongoose";

export const MESSAGE_STATUS = {
  SENDING: "sending",
  SENT: "sent",
  DELIVERED: "delivered",
  SEEN: "seen",
  FAILED: "failed",
} as const;

export type MESSAGE_STATUS = (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS];

export interface IMessage {
  _id: Types.ObjectId | string;
  author: Types.ObjectId | string;
  conversation_Id: Types.ObjectId | string;
  text: string;
  is_Media: boolean;
  media_Id?: Types.ObjectId | string | null;
  is_Deleted: boolean;
  status: MESSAGE_STATUS;
  clientMessageId?: string | null;
  delivered_at?: Date | string | null;
  seen_at?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SendMessagePayload {
  conversationId: string;
  text: string;
  recipientId?: string;
  clientMessageId?: string;
  isGroup?: boolean;
}

export interface MessageAuthorProfile {
  _id: string;
  full_name?: string;
  avatar?: string | null;
}

export interface MessageReceivedPayload {
  _id: string;
  author: string;
  conversation_Id: string;
  text: string;
  status: MESSAGE_STATUS;
  clientMessageId?: string;
  delivered_at?: string | null;
  seen_at?: string | null;
  createdAt: string;
  authorProfile?: MessageAuthorProfile;
}

export interface MessageStatusPayload {
  messageId: string;
  conversationId: string;
  status: MESSAGE_STATUS;
  delivered_at?: string | null;
  seen_at?: string | null;
  clientMessageId?: string;
}

export interface MarkSeenPayload {
  conversationId: string;
  messageIds?: string[];
}

export interface ConversationListItem {
  _id: string;
  is_group: boolean;
  updatedAt: string;
  unreadCount?: number;
  displayInfo: {
    _id: string;
    fullname?: string;
    name?: string;
    avatar?: string | null;
    isOnline?: boolean;
    lastActiveAt?: string;
  };
  lastMessage?: {
    text: string;
    createdAt: string;
    author?: string;
    status?: MESSAGE_STATUS;
  };
}
