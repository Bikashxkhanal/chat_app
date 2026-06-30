interface ConversationHeaderProps {
  onNewChat?: () => void;
  onNewGroup?: () => void;
}

const ConversationHeader = ({ onNewChat, onNewGroup }: ConversationHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-3 pt-4 pb-2">
      <h2 className="text-lg font-medium text-[var(--fg)]">Chats</h2>
      <div className="flex items-center gap-2">
        {onNewGroup && (
          <button
            type="button"
            onClick={onNewGroup}
            className="text-xs font-medium px-2.5 py-1 rounded-lg text-[var(--accent)] hover:bg-[var(--accent-muted)]"
          >
            Group
          </button>
        )}
        {onNewChat && (
          <button
            type="button"
            onClick={onNewChat}
            className="text-xs font-medium px-2.5 py-1 rounded-lg text-[var(--accent)] hover:bg-[var(--accent-muted)]"
          >
            New
          </button>
        )}
      </div>
    </div>
  );
};

export default ConversationHeader;
