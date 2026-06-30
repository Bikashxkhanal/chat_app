import axios, { type AxiosInstance } from "axios";
import { io, type Socket } from "socket.io-client";
import {
  AUTH_ROLE,
  chatEventEnums,
  type ApiSuccessResponseInterface,
  type ConversationListItem,
  type MessageReceivedPayload,
  type SendMessagePayload,
  type MessageStatusPayload,
} from "@repo/types";

export interface ChatSDKConfig {
  apiBaseUrl: string;
  socketUrl?: string;
}

export interface SSOAuthConfig {
  apiKey: string;
  accessToken: string;
}

type EventCallback = (payload: unknown) => void;

export class ChatSDK {
  private api: AxiosInstance;
  private socket: Socket | null = null;
  private accessToken: string | null = null;
  private listeners = new Map<string, Set<EventCallback>>();

  constructor(private config: ChatSDKConfig) {
    this.api = axios.create({
      baseURL: config.apiBaseUrl,
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });

    this.api.interceptors.request.use((req) => {
      if (this.accessToken) {
        req.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return req;
    });
  }

  getAccessToken() {
    return this.accessToken;
  }

  async login(phoneNumber: string, password: string) {
    const { data } = await this.api.post<ApiSuccessResponseInterface>("/auth/login", {
      type: AUTH_ROLE.NORMAL,
      phone_number: phoneNumber,
      password,
    });

    const token = (data.data as { accessToken?: string })?.accessToken;
    if (token) this.setAccessToken(token);

    return data;
  }

  async ssoLogin({ apiKey, accessToken }: SSOAuthConfig) {
    const { data } = await this.api.post<ApiSuccessResponseInterface>(
      "/auth/sso/login",
      { type: AUTH_ROLE.SDK, api_key: apiKey },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const token = (data.data as { accessToken?: string })?.accessToken;
    if (token) this.setAccessToken(token);

    return data;
  }

  async logout() {
    await this.api.post("/auth/logout");
    this.disconnect();
    this.accessToken = null;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  connect(accessToken?: string): Socket {
    if (accessToken) this.accessToken = accessToken;
    if (!this.accessToken) throw new Error("Access token required");

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    const socketUrl = this.config.socketUrl ?? this.config.apiBaseUrl.replace("/api/v1", "");

    this.socket = io(socketUrl, {
      auth: { accessToken: this.accessToken },
      transports: ["websocket"],
      reconnection: true,
    });

    const relay = (event: string) => {
      this.socket?.on(event, (payload: unknown) => this.emitLocal(event, payload));
    };

    [
      chatEventEnums.CONNECTED_EVENT,
      chatEventEnums.MESSAGE_RECEIVED_EVENT,
      chatEventEnums.MESSAGE_SENT_EVENT,
      chatEventEnums.MESSAGE_DELIVERED_EVENT,
      chatEventEnums.MESSAGE_SEEN_EVENT,
      chatEventEnums.NEW_CHAT_EVENT,
      chatEventEnums.TYPING_EVENT,
      chatEventEnums.STOP_TYPING_EVENT,
      chatEventEnums.USER_ONLINE_EVENT,
      chatEventEnums.USER_OFFLINE_EVENT,
      chatEventEnums.SOCKET_ERROR_EVENT,
      chatEventEnums.RECONNECTING_EVENT,
    ].forEach(relay);

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback) {
    this.listeners.get(event)?.delete(callback);
  }

  private emitLocal(event: string, payload: unknown) {
    this.listeners.get(event)?.forEach((cb) => cb(payload));
  }

  async getConversations(): Promise<ConversationListItem[]> {
    const { data } = await this.api.get<ApiSuccessResponseInterface>(
      "/users/getAllConversationUsers"
    );
    return data.data as ConversationListItem[];
  }

  async getMessages(userId: string, page = 1, limit = 30) {
    const { data } = await this.api.get<ApiSuccessResponseInterface>(
      `/users/conv-message/${userId}`,
      { params: { page, limit } }
    );
    return data.data as {
      conversation: { _id: string } | null;
      messages: MessageReceivedPayload[];
    };
  }

  async createDirectConversation(recipientId: string) {
    const { data } = await this.api.post<ApiSuccessResponseInterface>(
      "/conversations/direct",
      { recipientId }
    );
    return data.data as { _id: string };
  }

  async getMessagesByConversationId(conversationId: string, page = 1, limit = 30) {
    const { data } = await this.api.get<ApiSuccessResponseInterface>(
      `/conversations/${conversationId}/messages`,
      { params: { page, limit } }
    );
    return data.data as {
      conversation: { _id: string } | null;
      messages: MessageReceivedPayload[];
    };
  }

  async createGroup(body: { name: string; memberIds: string[]; avatar?: string | null }) {
    const { data } = await this.api.post<ApiSuccessResponseInterface>("/groups", body);
    return data.data as {
      group: { _id: string; name: string; avatar?: string | null };
      conversation: { _id: string };
    };
  }

  async searchUsers(phone: string) {
    const { data } = await this.api.get<ApiSuccessResponseInterface>("/users/search", {
      params: { phone },
    });
    return data.data as Array<{
      _id: string;
      full_name?: string;
      avatar?: string;
      phone_number: string;
    }>;
  }

  async markConversationSeen(conversationId: string) {
    this.socket?.emit(chatEventEnums.MARK_SEEN_EVENT, { conversationId });
    const { data } = await this.api.post<ApiSuccessResponseInterface>(
      `/messages/${conversationId}/seen`
    );
    return data.data as { messages: MessageReceivedPayload[] };
  }

  joinConversation(conversationId: string) {
    this.socket?.emit(chatEventEnums.JOIN_CHAT_EVENT, conversationId);
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit(chatEventEnums.LEAVE_CHAT_EVENT, conversationId);
  }

  sendMessage(payload: SendMessagePayload) {
    this.socket?.emit(chatEventEnums.SEND_MESSAGE_EVENT, payload);
  }

  ackMessage(messageId: string, conversationId: string) {
    this.socket?.emit(chatEventEnums.MESSAGE_ACK_EVENT, { messageId, conversationId });
  }

  startTyping(conversationId: string) {
    this.socket?.emit(chatEventEnums.TYPING_EVENT, { conversationId });
  }

  stopTyping(conversationId: string) {
    this.socket?.emit(chatEventEnums.STOP_TYPING_EVENT, { conversationId });
  }
}
