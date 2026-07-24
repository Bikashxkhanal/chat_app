
export type MessageStatus = "received_unseen" | "received_seen" | "sent" | "delivered" | "seen" | "failed" | "sending";

export interface UserCardProps {
  avatar?: string | null;
  full_name: string ;
  lastMessage: string;
  messageStatus: MessageStatus;
  timestamp?: string;
  conversationId?: string;
  userId?: string;
  groupId?: string;
  isGroup?: boolean;
  unreadCount?: number;
  isOnline?: boolean;
  
  onClick?: () => void;
}