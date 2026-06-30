import { MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import NewChatModal from "./new.chat.modal";

const DefaultMessageUI = () => {
  const [showNewChat, setShowNewChat] = useState(false);

  return (
    <>
      <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-[var(--bg)] gap-3">
        <button
          type="button"
          onClick={() => setShowNewChat(true)}
          className="p-4 rounded-2xl border border-[var(--border)] text-[var(--accent)] hover:bg-[var(--surface-hover)] transition-colors"
        >
          <MessageSquarePlus size={32} />
        </button>
        <p className="text-sm text-[var(--fg-muted)]">Select a chat or start a new one</p>
      </div>
      <NewChatModal open={showNewChat} onClose={() => setShowNewChat(false)} />
    </>
  );
};

export default DefaultMessageUI;
