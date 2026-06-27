
export type MessageStatus = "received_unseen" | "received_seen" | "sent";

export interface UserCardProps {
  avatar?: string;
  full_name: string;
  lastMessage: string;
  messageStatus: MessageStatus;
  timestamp?: string;
  onClick?: () => void;
}