import { useState } from "react";
import { X, Search } from "lucide-react";
import { useChat } from "../../context/chatContext";
import { searchUsers } from "../../services/chat.service";
import { Avatar } from "../common/avatar";

interface NewChatModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NewChatModal({ open, onClose }: NewChatModalProps) {
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState<
    Array<{ _id: string; full_name?: string; avatar?: string; phone_number: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const { startNewChat } = useChat();

  if (!open) return null;

  async function handleSearch() {
    if (!phone.trim()) return;
    setLoading(true);
    try {
      setResults(await searchUsers(phone.trim()));
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectUser(user: (typeof results)[0]) {
    await startNewChat(user._id, user.full_name ?? user.phone_number, user.avatar);
    onClose();
    setPhone("");
    setResults([]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[var(--surface)] rounded-2xl w-full max-w-md p-4 border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-[var(--fg)]">New chat</h3>
          <button type="button" onClick={onClose} className="text-[var(--fg-muted)]">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Phone number"
            className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] outline-none text-sm"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="px-3 py-2 rounded-xl text-white text-sm disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            <Search size={16} />
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto">
          {loading && <p className="text-sm text-[var(--fg-muted)] text-center py-4">Searching...</p>}
          {results.map((user) => (
            <button
              key={user._id}
              type="button"
              onClick={() => handleSelectUser(user)}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[var(--surface-hover)] text-left"
            >
              <Avatar name={user.full_name ?? user.phone_number} src={user.avatar} size={36} />
              <div>
                <p className="text-sm text-[var(--fg)]">{user.full_name ?? "Unknown"}</p>
                <p className="text-xs text-[var(--fg-muted)]">{user.phone_number}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
