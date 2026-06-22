// ─── Contacts Page ─────────────────────────────────────────────────────────
// Static UI only — mock data, no backend wiring yet.

import { useMemo, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { SearchIcon, PlusIcon, DotsIcon } from "./icons";

interface Contact {
  id: string;
  name: string;
  status: string;
  presence: "online" | "offline";
}

const MOCK_CONTACTS: Contact[] = [
  { id: "1", name: "Alice Freeman", status: "Online", presence: "online" },
  { id: "2", name: "Arjun Patel", status: "Online", presence: "online" },
  { id: "3", name: "Balthazar King", status: "Offline", presence: "offline" },
  { id: "4", name: "Chloe Schmidt", status: "Online", presence: "online" },
  { id: "5", name: "Damien Thorne", status: " Offline", presence: "offline" },
  { id: "6", name: "Elias Blackwood", status: "Offline", presence: "offline" }
];

const presenceDotClass: Record<Contact["presence"], string> = {
  online: "bg-emerald-400",
  offline: "bg-gray-500",
};

const LETTERS = ["ALL", "A", "B", "C", "D", "E", "F", "…", "Z"];

export default function Contacts() {
  const [activeTab, setActiveTab] = useState<"direct" | "groups">("direct");
  const [activeLetter, setActiveLetter] = useState("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return MOCK_CONTACTS.filter((c) => {
      const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase());
      const matchesLetter =
        activeLetter === "ALL" ||
        activeLetter === "…" ||
        c.name[0].toUpperCase() === activeLetter;
      return matchesQuery && matchesLetter;
    });
  }, [query, activeLetter]);

  return (
    <DashboardLayout>
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-white/5 px-8 py-4">
        <h1 className="text-lg font-bold tracking-wide text-white">CHAT PULSE</h1>

        <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 mx-8">
          <SearchIcon width={16} height={16} className="text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts..."
            className="w-full bg-transparent text-sm text-gray-200 placeholder:text-gray-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab("direct")}
              className={activeTab === "direct" ? "text-white" : "text-gray-500 hover:text-gray-300"}
            >
              Direct
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("groups")}
              className={activeTab === "groups" ? "text-white" : "text-gray-500 hover:text-gray-300"}
            >
              Groups
            </button>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
          >
            <PlusIcon width={16} height={16} />
            Add New Contact
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="px-8 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Contacts</h2>

          <div className="flex items-center gap-1">
            {LETTERS.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => setActiveLetter(letter)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  activeLetter === letter
                    ? "bg-indigo-500 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-white/5 mb-6" />

        {activeTab === "groups" ? (
          <p className="text-sm text-gray-500">No groups yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((contact) => (
              <div
                key={contact.id}
                className="flex items-start justify-between rounded-2xl border border-white/5 bg-[#0d1220] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="relative h-9 w-9 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold text-gray-200">
                    {contact.name[0]}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-[#0d1220] ${presenceDotClass[contact.presence]}`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.status}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-300"
                  aria-label="Contact options"
                >
                  <DotsIcon width={16} height={16} />
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-500">No contacts found.</p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
