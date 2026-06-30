import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, RotateCcw } from "lucide-react";
import { useChat } from "../../context/chatContext";
import { LocalStorage } from "../../utils";
import { MESSAGE_STATUS, type MessageReceivedPayload } from "@repo/types";
import { Avatar } from "../common/avatar";

function StatusTicks({ status }: { status?: string }) {
  const color =
    status === MESSAGE_STATUS.SEEN
      ? "var(--accent)"
      : status === MESSAGE_STATUS.DELIVERED
        ? "var(--fg-muted)"
        : "var(--fg-muted)";

  if (status === MESSAGE_STATUS.SENDING) {
    return <span className="text-[10px] opacity-60">...</span>;
  }
  if (status === MESSAGE_STATUS.FAILED) {
    return <span className="text-[10px]" style={{ color: "var(--danger)" }}>!</span>;
  }

  return (
    <svg width="14" height="9" viewBox="0 0 16 10" fill="none" className="inline ml-1">
      <path d="M1 5L4.5 8.5L10.5 1.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 5L8.5 8.5L14.5 1.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MessageBubble({
  message,
  isOwn,
  isGroup,
  onRetry,
}: {
  message: MessageReceivedPayload;
  isOwn: boolean;
  isGroup?: boolean;
  onRetry?: () => void;
}) {
  const authorName = message.authorProfile?.full_name ?? "Member";

  return (
    <div className={`flex gap-2 mb-3 ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && isGroup && (
        <Avatar
          name={authorName}
          src={message.authorProfile?.avatar}
          size={28}
          className="mt-1"
        />
      )}

      <div className={`max-w-[72%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {!isOwn && isGroup && (
          <span className="text-[11px] text-[var(--fg-muted)] mb-1 ml-1">{authorName}</span>
        )}
        <div
          className="px-3.5 py-2 rounded-2xl text-sm"
          style={{
            background: isOwn ? "var(--bubble-own)" : "var(--bubble-other)",
            color: isOwn ? "var(--bubble-own-fg)" : "var(--bubble-other-fg)",
            borderBottomRightRadius: isOwn ? 4 : undefined,
            borderBottomLeftRadius: !isOwn ? 4 : undefined,
          }}
        >
          {message.text}
          <div
            className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end opacity-70" : "text-[var(--fg-muted)]"}`}
          >
            <span className="text-[10px]">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {isOwn && <StatusTicks status={message.status} />}
            {isOwn && message.status === MESSAGE_STATUS.FAILED && onRetry && (
              <button type="button" onClick={onRetry} className="ml-1" title="Retry">
                <RotateCcw size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2 text-xs text-[var(--fg-muted)]">
      <span className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--fg-muted)] animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--fg-muted)] animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--fg-muted)] animate-bounce [animation-delay:300ms]" />
      </span>
      <span>typing</span>
    </div>
  );
}

export default function ChatWindow({ onBack }: { onBack?: () => void }) {
  const {
    selectedChat,
    messages,
    isLoadingMessages,
    isTyping,
    isConnected,
    onlineUsers,
    sendMessage,
    notifyTyping,
  } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUser = LocalStorage.get("user") as { _id?: string } | null;
  const currentUserId = currentUser?._id?.toString();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!selectedChat) return null;

  const isOnline = selectedChat.userId ? onlineUsers.has(selectedChat.userId) : false;

  function handleSend() {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
    notifyTyping(false);
  }

  function handleRetry(failed: MessageReceivedPayload) {
    sendMessage(failed.text);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full bg-[var(--bg)]">
      <div className="flex items-center gap-2 px-3 py-3 border-b border-[var(--border)] bg-[var(--surface)] shrink-0 mobile-header-pad">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden flex items-center justify-center w-9 h-9 -ml-1 rounded-xl text-[var(--fg)] hover:bg-[var(--surface-hover)]"
            aria-label="Back to chats"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="relative shrink-0">
          <Avatar name={selectedChat.full_name} src={selectedChat.avatar} size={40} />
          {isOnline && !selectedChat.isGroup && (
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--surface)]"
              style={{ background: "var(--online)" }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-medium text-[var(--fg)] truncate">{selectedChat.full_name}</h2>
          <p className="text-xs text-[var(--fg-muted)]">
            {selectedChat.isGroup
              ? "Group"
              : isTyping
                ? "typing..."
                : isOnline
                  ? "Online"
                  : isConnected
                    ? "Offline"
                    : "Reconnecting..."}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 overscroll-contain">
        {isLoadingMessages ? (
          <p className="text-center text-[var(--fg-muted)] text-sm">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-[var(--fg-muted)] text-sm mt-8">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.clientMessageId ?? msg._id}
              message={msg}
              isOwn={msg.author?.toString() === currentUserId}
              isGroup={selectedChat.isGroup}
              onRetry={
                msg.status === MESSAGE_STATUS.FAILED ? () => handleRetry(msg) : undefined
              }
            />
          ))
        )}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 px-3 py-2.5 border-t border-[var(--border)] bg-[var(--surface)] mobile-input-pad">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              notifyTyping(e.target.value.length > 0);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            onBlur={() => notifyTyping(false)}
            placeholder="Message..."
            className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] outline-none focus:border-[var(--accent)] text-base md:text-sm"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
            style={{ background: "var(--accent)" }}
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
