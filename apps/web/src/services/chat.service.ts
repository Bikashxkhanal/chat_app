import type {
  ApiSuccessResponseInterface,
  ConversationListItem,
  MessageReceivedPayload,
  MessageStatusPayload,
  TypingPayload,
  PresencePayload,
} from "@repo/types";
import { apiClient } from "./api";

export async function fetchConversations() {
  const { data } = await apiClient.get<ApiSuccessResponseInterface>(
    "/users/getAllConversationUsers"
  );
  return data.data as ConversationListItem[];
}

export async function fetchMessages(userId: string, page = 1, limit = 50) {
  const { data } = await apiClient.get<ApiSuccessResponseInterface>(
    `/users/conv-message/${userId}`,
    { params: { page, limit } }
  );
  return data.data as {
    conversation: { _id: string } | null;
    messages: MessageReceivedPayload[];
  };
}

export async function createDirectConversation(recipientId: string) {
  const { data } = await apiClient.post<ApiSuccessResponseInterface>(
    "/conversations/direct",
    { recipientId }
  );
  return data.data as { _id: string };
}

export async function searchUsers(phone: string) {
  const { data } = await apiClient.get<ApiSuccessResponseInterface>("/users/search", {
    params: { phone },
  });
  return data.data as Array<{
    _id: string;
    full_name?: string;
    avatar?: string;
    phone_number: string;
  }>;
}

export async function markConversationSeen(conversationId: string) {
  const { data } = await apiClient.post<ApiSuccessResponseInterface>(
    `/messages/${conversationId}/seen`
  );
  return data.data as { messages: MessageReceivedPayload[] };
}

export async function fetchMessagesByConversation(conversationId: string, page = 1, limit = 50) {
  const { data } = await apiClient.get<ApiSuccessResponseInterface>(
    `/conversations/${conversationId}/messages`,
    { params: { page, limit } }
  );
  return data.data as {
    conversation: { _id: string } | null;
    messages: MessageReceivedPayload[];
  };
}
