import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createChatSDK } from "@repo/sdk-web";
import type { ChatSDK } from "@repo/sdk-web";
import {
  chatEventEnums,
  MESSAGE_STATUS,
  type ConversationListItem,
  type MessageReceivedPayload,
  type MessageStatusPayload,
  type TypingPayload,
  type PresencePayload,
  type UserCardProps,
} from "@repo/types";
import { API_BASE } from "../services/api";
import { LocalStorage } from "../utils";

export interface SelectedChat {
  conversationId: string;
  userId?: string;
  full_name: string;
  avatar?: string | null;
  isGroup?: boolean;
  groupId?: string;
}

interface ChatContextValue {
  conversations: UserCardProps[];
  selectedChat: SelectedChat | null;
  messages: MessageReceivedPayload[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isTyping: boolean;
  isConnected: boolean;
  onlineUsers: Set<string>;
  selectChat: (chat: SelectedChat) => Promise<void>;
  closeChat: () => void;
  sendMessage: (text: string) => void;
  startNewChat: (recipientId: string, full_name: string, avatar?: string | null) => Promise<void>;
  startNewGroup: (name: string, memberIds: string[], avatar?: string | null) => Promise<void>;
  refreshConversations: () => Promise<void>;
  notifyTyping: (isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextValue>({
  conversations: [],
  selectedChat: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isTyping: false,
  isConnected: false,
  onlineUsers: new Set(),
  selectChat: async () => {},
  closeChat: () => {},
  sendMessage: () => {},
  startNewChat: async () => {},
  startNewGroup: async () => {},
  refreshConversations: async () => {},
  notifyTyping: () => {},
});

export const useChat = () => useContext(ChatContext);

function formatTime(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function normalizeId(id?: string | { toString(): string }) {
  return id?.toString?.() ?? String(id ?? "");
}

function mapConversationToCard(
  item: ConversationListItem,
  currentUserId?: string,
  onlineUsers?: Set<string>
): UserCardProps {
  const display = item.displayInfo;
  const lastMsg = item.lastMessage;
  const authorId = normalizeId(lastMsg?.author);
  const isSent = authorId === normalizeId(currentUserId);
  const unread = item.unreadCount ?? 0;
  const userId = item.is_group ? item._id : normalizeId(display?._id);

  let messageStatus: UserCardProps["messageStatus"] = "received_seen";
  if (unread > 0) messageStatus = "received_unseen";
  else if (isSent) {
    messageStatus =
      lastMsg?.status === MESSAGE_STATUS.SEEN
        ? "seen"
        : lastMsg?.status === MESSAGE_STATUS.DELIVERED
          ? "delivered"
          : "sent";
  }

  return {
    conversationId: item._id,
    userId,
    groupId: item.is_group ? normalizeId(display?._id) : undefined,
    isGroup: item.is_group,
    full_name: display?.fullname ?? display?.name ?? "Unknown",
    avatar: display?.avatar ?? null,
    lastMessage: lastMsg?.text ?? "No messages yet",
    messageStatus,
    timestamp: formatTime(lastMsg?.createdAt ?? item.updatedAt),
    unreadCount: unread,
    isOnline: onlineUsers?.has(userId) ?? display?.isOnline,
  };
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<UserCardProps[]>([]);
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);
  const [messages, setMessages] = useState<MessageReceivedPayload[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const sdkRef = useRef<ChatSDK | null>(null);
  const selectedChatRef = useRef<SelectedChat | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingActiveRef = useRef(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedConversationsRef = useRef(false);
  const onlineUsersRef = useRef<Set<string>>(new Set());
  const currentUserIdRef = useRef("");

  const currentUser = LocalStorage.get("user") as { _id?: string } | null;
  currentUserIdRef.current = normalizeId(currentUser?._id);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    onlineUsersRef.current = onlineUsers;
  }, [onlineUsers]);

  const getSdk = useCallback(() => {
    if (!sdkRef.current) {
      sdkRef.current = createChatSDK({ apiBaseUrl: API_BASE });
    }
    return sdkRef.current;
  }, []);

  const refreshConversations = useCallback(async () => {
    // Keep existing cards visible during socket-driven refreshes. The loading
    // state is reserved for the initial fetch so the sidebar does not flash.
    const isInitialLoad = !hasLoadedConversationsRef.current;
    if (isInitialLoad) setIsLoadingConversations(true);
    try {
      const data = await getSdk().getConversations();
      setConversations(
        data.map((c) =>
          mapConversationToCard(c, currentUserIdRef.current, onlineUsersRef.current)
        )
      );
      hasLoadedConversationsRef.current = true;
    } finally {
      if (isInitialLoad) setIsLoadingConversations(false);
    }
  }, [getSdk]);

  const scheduleRefreshConversations = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      refreshConversations();
    }, 400);
  }, [refreshConversations]);

  const belongsToActiveChat = useCallback((conversationId: string) => {
    const active = selectedChatRef.current;
    if (!active) return false;
    return normalizeId(conversationId) === normalizeId(active.conversationId);
  }, []);

  const upsertMessage = useCallback((payload: MessageReceivedPayload) => {
    if (!belongsToActiveChat(payload.conversation_Id)) return;

    setMessages((prev) => {
      if (payload.clientMessageId) {
        const byClient = prev.findIndex((m) => m.clientMessageId === payload.clientMessageId);
        if (byClient >= 0) {
          const next = [...prev];
          next[byClient] = { ...next[byClient], ...payload };
          return next;
        }
      }

      const byId = prev.findIndex((m) => m._id === payload._id);
      if (byId >= 0) {
        const next = [...prev];
        next[byId] = { ...next[byId], ...payload };
        return next;
      }

      return [...prev, payload];
    });
  }, [belongsToActiveChat]);

  const updateMessageStatus = useCallback((payload: MessageStatusPayload) => {
    if (!belongsToActiveChat(payload.conversationId)) return;

    setMessages((prev) =>
      prev.map((m) => {
        const match =
          m._id === payload.messageId ||
          (payload.clientMessageId && m.clientMessageId === payload.clientMessageId);
        if (!match) return m;
        return {
          ...m,
          status: payload.status,
          delivered_at: payload.delivered_at ?? m.delivered_at,
          seen_at: payload.seen_at ?? m.seen_at,
        };
      })
    );
  }, [belongsToActiveChat]);

  const patchPresenceOnCard = useCallback((userId: string, isOnline: boolean) => {
    setConversations((prev) =>
      prev.map((c) => (c.userId === userId ? { ...c, isOnline } : c))
    );
  }, []);

  const markSeen = useCallback((conversationId: string) => {
    getSdk().markConversationSeen(conversationId).catch(() => {});
  }, [getSdk]);

  // Socket setup — runs once; handlers use refs to avoid dependency loops
  useEffect(() => {
    const token = LocalStorage.get("accessToken") as string | null;
    if (!token) return;

    const sdk = getSdk();
    sdk.setAccessToken(token);
    const socket = sdk.connect(token);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    setIsConnected(socket.connected);

    const onMessageSent = (payload: unknown) => {
      upsertMessage({ ...(payload as MessageReceivedPayload), status: MESSAGE_STATUS.SENT });
      // The sender does not receive MESSAGE_RECEIVED_EVENT, so refresh its
      // conversation card explicitly (preview, timestamp, and sort order).
      scheduleRefreshConversations();
    };

    const onMessageReceived = (payload: unknown) => {
      const msg = payload as MessageReceivedPayload;

      // Sender already has this via messageSent + optimistic UI
      if (normalizeId(msg.author) === currentUserIdRef.current) return;

      const active = selectedChatRef.current;
      const isActiveChat =
        active && normalizeId(msg.conversation_Id) === normalizeId(active.conversationId);

      if (isActiveChat) {
        // A delivery receipt is only sent while the recipient has this chat
        // open. Messages in inactive chats stay sent until they are opened.
        sdk.ackMessage(msg._id, msg.conversation_Id);
        upsertMessage(msg);
        markSeen(active.conversationId);
      }

      scheduleRefreshConversations();
    };

    const onMessageDelivered = (payload: unknown) => {
      updateMessageStatus(payload as MessageStatusPayload);
    };

    const onMessageSeen = (payload: unknown) => {
      updateMessageStatus(payload as MessageStatusPayload);
      scheduleRefreshConversations();
    };

    const onNewChat = () => scheduleRefreshConversations();

    const onTyping = (payload: unknown) => {
      const p = payload as TypingPayload;
      const active = selectedChatRef.current;
      if (
        active &&
        normalizeId(active.conversationId) === normalizeId(p.conversationId) &&
        normalizeId(p.userId) !== currentUserIdRef.current
      ) {
        setIsTyping(true);
        if (typingClearTimeoutRef.current) clearTimeout(typingClearTimeoutRef.current);
        typingClearTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const onStopTyping = (payload: unknown) => {
      const p = payload as TypingPayload;
      if (
        selectedChatRef.current &&
        normalizeId(selectedChatRef.current.conversationId) === normalizeId(p.conversationId) &&
        normalizeId(p.userId) !== currentUserIdRef.current
      ) {
        setIsTyping(false);
        if (typingClearTimeoutRef.current) clearTimeout(typingClearTimeoutRef.current);
      }
    };

    const onUserOnline = (payload: unknown) => {
      const p = payload as PresencePayload;
      setOnlineUsers((prev) => new Set(prev).add(p.userId));
      patchPresenceOnCard(p.userId, true);
    };

    const onUserOffline = (payload: unknown) => {
      const p = payload as PresencePayload;
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(p.userId);
        return next;
      });
      patchPresenceOnCard(p.userId, false);
    };

    const onSocketError = (err: unknown) => {
      const data = err as { clientMessageId?: string };
      if (data?.clientMessageId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === data.clientMessageId
              ? { ...m, status: MESSAGE_STATUS.FAILED }
              : m
          )
        );
      }
    };

    sdk.on(chatEventEnums.MESSAGE_SENT_EVENT, onMessageSent);
    sdk.on(chatEventEnums.MESSAGE_RECEIVED_EVENT, onMessageReceived);
    sdk.on(chatEventEnums.MESSAGE_DELIVERED_EVENT, onMessageDelivered);
    sdk.on(chatEventEnums.MESSAGE_SEEN_EVENT, onMessageSeen);
    sdk.on(chatEventEnums.NEW_CHAT_EVENT, onNewChat);
    sdk.on(chatEventEnums.TYPING_EVENT, onTyping);
    sdk.on(chatEventEnums.STOP_TYPING_EVENT, onStopTyping);
    sdk.on(chatEventEnums.USER_ONLINE_EVENT, onUserOnline);
    sdk.on(chatEventEnums.USER_OFFLINE_EVENT, onUserOffline);
    sdk.on(chatEventEnums.SOCKET_ERROR_EVENT, onSocketError);

    refreshConversations();

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      if (typingClearTimeoutRef.current) clearTimeout(typingClearTimeoutRef.current);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      sdk.off(chatEventEnums.MESSAGE_SENT_EVENT, onMessageSent);
      sdk.off(chatEventEnums.MESSAGE_RECEIVED_EVENT, onMessageReceived);
      sdk.off(chatEventEnums.MESSAGE_DELIVERED_EVENT, onMessageDelivered);
      sdk.off(chatEventEnums.MESSAGE_SEEN_EVENT, onMessageSeen);
      sdk.off(chatEventEnums.NEW_CHAT_EVENT, onNewChat);
      sdk.off(chatEventEnums.TYPING_EVENT, onTyping);
      sdk.off(chatEventEnums.STOP_TYPING_EVENT, onStopTyping);
      sdk.off(chatEventEnums.USER_ONLINE_EVENT, onUserOnline);
      sdk.off(chatEventEnums.USER_OFFLINE_EVENT, onUserOffline);
      sdk.off(chatEventEnums.SOCKET_ERROR_EVENT, onSocketError);
      sdk.disconnect();
      sdkRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSdk]);

  const selectChat = useCallback(
    async (chat: SelectedChat) => {
      const sdk = getSdk();
      setSelectedChat(chat);
      setIsLoadingMessages(true);
      setIsTyping(false);

      setConversations((prev) =>
        prev.map((c) =>
          normalizeId(c.conversationId) === normalizeId(chat.conversationId)
            ? { ...c, unreadCount: 0, messageStatus: "received_seen" as const }
            : c
        )
      );

      sdk.joinConversation(chat.conversationId);

      try {
        const { conversation, messages: msgs } = chat.isGroup
          ? await sdk.getMessagesByConversationId(chat.conversationId)
          : await sdk.getMessages(chat.userId!);
        const conversationId = conversation?._id ?? chat.conversationId;

        setSelectedChat((prev) => (prev ? { ...prev, conversationId } : prev));
        sdk.joinConversation(conversationId);
        setMessages(msgs ?? []);
        markSeen(conversationId);
        await refreshConversations();
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [getSdk, markSeen, refreshConversations]
  );

  const closeChat = useCallback(() => {
    const active = selectedChatRef.current;
    if (active) {
      getSdk().leaveConversation(active.conversationId);
    }
    setSelectedChat(null);
    setMessages([]);
    setIsTyping(false);
  }, [getSdk]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!selectedChat || !text.trim() || !currentUserIdRef.current) return;

      const clientMessageId = crypto.randomUUID();
      const currentUser = LocalStorage.get("user") as {
        full_name?: string;
        avatar?: string | null;
      } | null;

      upsertMessage({
        _id: clientMessageId,
        author: currentUserIdRef.current,
        conversation_Id: selectedChat.conversationId,
        text: text.trim(),
        status: MESSAGE_STATUS.SENDING,
        clientMessageId,
        createdAt: new Date().toISOString(),
        ...(selectedChat.isGroup && {
          authorProfile: {
            _id: currentUserIdRef.current,
            full_name: currentUser?.full_name,
            avatar: currentUser?.avatar ?? null,
          },
        }),
      });

      getSdk().sendMessage({
        conversationId: selectedChat.conversationId,
        text: text.trim(),
        recipientId: selectedChat.isGroup ? undefined : selectedChat.userId,
        clientMessageId,
        isGroup: selectedChat.isGroup,
      });

      getSdk().stopTyping(selectedChat.conversationId);
    },
    [selectedChat, getSdk, upsertMessage]
  );

  const notifyTyping = useCallback(
    (typing: boolean) => {
      if (!selectedChat) return;
      const sdk = getSdk();
      const conversationId = selectedChat.conversationId;

      if (typing) {
        if (!isTypingActiveRef.current) {
          sdk.startTyping(conversationId);
          isTypingActiveRef.current = true;
        }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          sdk.stopTyping(conversationId);
          isTypingActiveRef.current = false;
        }, 2000);
      } else {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (isTypingActiveRef.current) {
          sdk.stopTyping(conversationId);
          isTypingActiveRef.current = false;
        }
      }
    },
    [selectedChat, getSdk]
  );

  const startNewChat = useCallback(
    async (recipientId: string, full_name: string, avatar?: string | null) => {
      const conversation = await getSdk().createDirectConversation(recipientId);
      await selectChat({
        conversationId: conversation._id,
        userId: recipientId,
        full_name,
        avatar,
      });
    },
    [getSdk, selectChat]
  );

  const startNewGroup = useCallback(
    async (name: string, memberIds: string[], avatar?: string | null) => {
      const result = await getSdk().createGroup({ name, memberIds, avatar });
      await selectChat({
        conversationId: result.conversation._id,
        groupId: result.group._id,
        isGroup: true,
        full_name: result.group.name,
        avatar: result.group.avatar ?? null,
      });
    },
    [getSdk, selectChat]
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        selectedChat,
        messages,
        isLoadingConversations,
        isLoadingMessages,
        isTyping,
        isConnected,
        onlineUsers,
        selectChat,
        closeChat,
        sendMessage,
        startNewChat,
        startNewGroup,
        refreshConversations,
        notifyTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
