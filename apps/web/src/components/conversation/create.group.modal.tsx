import { useState } from "react";
import { X, Search, Users } from "lucide-react";
import { useChat } from "../../context/chatContext";
import { searchUsers } from "../../services/chat.service";
import { Avatar } from "../common/avatar";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
}

type SearchUser = {
  _id: string;
  full_name?: string;
  avatar?: string;
  phone_number: string;
};

const inputClass =
  "w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] outline-none text-sm";

export default function CreateGroupModal({ open, onClose }: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [selected, setSelected] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { startNewGroup } = useChat();

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

  function toggleMember(user: SearchUser) {
    setSelected((prev) =>
      prev.some((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  }

  async function handleCreate() {
    if (!name.trim() || selected.length === 0) return;
    setCreating(true);
    try {
      await startNewGroup(
        name.trim(),
        selected.map((u) => u._id)
      );
      onClose();
      setName("");
      setPhone("");
      setSelected([]);
      setResults([]);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[var(--surface)] rounded-2xl w-full max-w-md p-4 border border-[var(--border)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[var(--fg)]">
            <Users size={18} />
            <h3 className="text-base font-medium">New group</h3>
          </div>
          <button type="button" onClick={onClose} className="text-[var(--fg-muted)]">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
            className={inputClass}
          />

          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by phone"
              className={`flex-1 ${inputClass}`}
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

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((u) => (
                <span
                  key={u._id}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent-muted)] text-[var(--accent)]"
                >
                  {u.full_name ?? u.phone_number}
                </span>
              ))}
            </div>
          )}

          <div className="max-h-40 overflow-y-auto">
            {loading && <p className="text-sm text-[var(--fg-muted)] text-center py-3">Searching...</p>}
            {results.map((user) => {
              const isSelected = selected.some((u) => u._id === user._id);
              return (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => toggleMember(user)}
                  className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-left mb-1 ${
                    isSelected ? "bg-[var(--accent-muted)]" : "hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  <Avatar name={user.full_name ?? user.phone_number} src={user.avatar} size={36} />
                  <div>
                    <p className="text-sm text-[var(--fg)]">{user.full_name ?? "Unknown"}</p>
                    <p className="text-xs text-[var(--fg-muted)]">{user.phone_number}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !name.trim() || selected.length === 0}
            className="w-full py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40"
            style={{ background: "var(--accent)" }}
          >
            {creating ? "Creating..." : `Create (${selected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
