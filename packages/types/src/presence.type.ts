export interface PresencePayload {
  userId: string;
  isOnline: boolean;
  lastActiveAt?: string;
}

export interface TypingPayload {
  conversationId: string;
  userId: string;
}
