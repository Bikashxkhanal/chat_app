import type { UserCardProps, MessageStatus } from "@repo/types";
import { Avatar } from "./avatar";

const statusColor: Record<MessageStatus, string> = {
  received_unseen: "var(--fg)",
  received_seen: "var(--fg-muted)",
  sent: "var(--fg-muted)",
  delivered: "var(--fg-muted)",
  seen: "var(--accent)",
  failed: "var(--danger)",
  sending: "var(--fg-muted)",
};

export function UserCard({
  avatar,
  full_name,
  lastMessage,
  messageStatus,
  timestamp,
  unreadCount = 0,
  isOnline,
  isGroup,
  onClick,
}: UserCardProps) {
  const hasUnread = unreadCount > 0;
  const isSent = ["sent", "delivered", "seen", "sending"].includes(messageStatus);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors hover:bg-[var(--surface-hover)]"
    >
      <div className="relative shrink-0">
        <Avatar name={full_name} src={avatar} size={44} />
        {isOnline && !isGroup && (
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--surface)]"
            style={{ background: "var(--online)" }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className={`text-sm truncate ${hasUnread ? "font-semibold text-[var(--fg)]" : "font-medium text-[var(--fg)]"}`}
          >
            {full_name}
          </span>
          {timestamp && (
            <span className="text-[11px] text-[var(--fg-muted)] shrink-0">{timestamp}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-xs truncate flex-1"
            style={{ color: statusColor[messageStatus] }}
          >
            {isSent ? "You: " : ""}
            {lastMessage}
          </span>

          {hasUnread && (
            <span
              className="shrink-0 min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold text-white flex items-center justify-center"
              style={{ background: "var(--unread)" }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
