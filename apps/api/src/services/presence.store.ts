const onlineUsers = new Map<string, number>();

export const presenceStore = {
  markOnline(userId: string) {
    onlineUsers.set(userId, (onlineUsers.get(userId) ?? 0) + 1);
  },

  markOffline(userId: string) {
    const count = onlineUsers.get(userId) ?? 0;
    if (count <= 1) {
      onlineUsers.delete(userId);
      return true;
    }
    onlineUsers.set(userId, count - 1);
    return false;
  },

  isOnline(userId: string) {
    return onlineUsers.has(userId);
  },

  getOnlineUserIds() {
    return Array.from(onlineUsers.keys());
  },
};
