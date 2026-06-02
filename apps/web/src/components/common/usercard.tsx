import { useState } from "react";
 
type MessageStatus = "received_unseen" | "received_seen" | "sent";
 
interface UserCardProps {
  avatar: string;
  name: string;
  lastMessage: string;
  messageStatus: MessageStatus;
  timestamp?: string;
  onClick?: () => void;
}
 
const statusStyles: Record<MessageStatus, { dot: string; text: string; bg: string }> = {
  received_unseen: {
    dot: "#22c55e",
    text: "#14532d",
    bg: "rgba(34,197,94,0.10)",
  },
  received_seen: {
    dot: "transparent",
    text: "#94a3b8",
    bg: "transparent",
  },
  sent: {
    dot: "transparent",
    text: "#94a3b8",
    bg: "transparent",
  },
};
 
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
 
export function UserCard({
  avatar,
  name,
  lastMessage,
  messageStatus,
  timestamp,
  onClick,
}: UserCardProps) {
  const [hovered, setHovered] = useState(false);
  const style = statusStyles[messageStatus];
  const isUnseen = messageStatus === "received_unseen";
  const isSent = messageStatus === "sent";
 
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "12px 16px",
        borderRadius: "16px",
        cursor: "pointer",
        background: hovered
          ? "rgba(255,255,255,0.06)"
          : isUnseen
          ? "rgba(34,197,94,0.04)"
          : "transparent",
        transition: "background 0.18s ease",
        position: "relative",
        userSelect: "none",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            overflow: "hidden",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: "16px",
            color: "#fff",
            letterSpacing: "0.03em",
            boxShadow: isUnseen
              ? "0 0 0 2px rgba(34,197,94,0.5)"
              : "0 0 0 2px rgba(255,255,255,0.06)",
            transition: "box-shadow 0.2s",
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            getInitials(name)
          )}
        </div>
        {/* Online indicator for unseen */}
        {isUnseen && (
          <span
            style={{
              position: "absolute",
              bottom: 1,
              right: 1,
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: "#22c55e",
              border: "2px solid #0f172a",
              boxSizing: "border-box",
            }}
          />
        )}
      </div>
 
      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 3,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: isUnseen ? 700 : 500,
              fontSize: "15px",
              color: isUnseen ? "#f1f5f9" : "#cbd5e1",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              letterSpacing: "-0.01em",
            }}
          >
            {name}
          </span>
          {timestamp && (
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "11px",
                color: isUnseen ? "#22c55e" : "#475569",
                fontWeight: isUnseen ? 600 : 400,
                flexShrink: 0,
                marginLeft: 8,
              }}
            >
              {timestamp}
            </span>
          )}
        </div>
 
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {/* Sent double-tick icon */}
          {isSent && (
            <svg
              width="16"
              height="10"
              viewBox="0 0 16 10"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <path
                d="M1 5L4.5 8.5L10.5 1.5"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 5L8.5 8.5L14.5 1.5"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
 
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13.5px",
              fontWeight: isUnseen ? 500 : 400,
              color: style.text,
              background: isUnseen ? style.bg : "transparent",
              padding: isUnseen ? "1px 7px" : "0",
              borderRadius: isUnseen ? "20px" : "0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "200px",
              display: "inline-block",
              lineHeight: "1.6",
              transition: "all 0.2s",
            }}
          >
            {lastMessage}
          </span>
 
          {/* Unread badge */}
          {isUnseen && (
            <span
              style={{
                marginLeft: "auto",
                flexShrink: 0,
                background: "#22c55e",
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: "11px",
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              1
            </span>
          )}
        </div>
      </div>
    </div>
  );
}