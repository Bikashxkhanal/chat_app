// ─── Dashboard Layout ─────────────────────────────────────────────────────────
// Shared sidebar shell used by Contacts, Settings, Home, Messages.
// No backend / auth wiring yet — "User Name" + avatar are placeholders.

import { type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  MessagesIcon,
  ContactsIcon,
  SettingsIcon,
  HelpIcon,
  LogoutIcon,
} from "./icons";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: "/dashboard/home", label: "Home", icon: HomeIcon },
  { to: "/dashboard/messages", label: "Messages", icon: MessagesIcon },
  { to: "/dashboard/contacts", label: "Contacts", icon: ContactsIcon },
  { to: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-[#0b0f19] text-gray-100">
      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-white/5 bg-[#0d1220] px-4 py-5">
        <div>
          {/* User */}
          <div className="mb-6 flex items-center gap-3 px-1">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-indigo-400 to-purple-500">
              <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-[#0d1220] bg-emerald-400" />
            </div>
            <span className="truncate font-semibold text-white">User Name</span>
          </div>

          {/* New chat */}
          <button
            type="button"
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
          >
            <MessagesIcon width={16} height={16} />
            New Chat
          </button>

          {/* Nav */}
          <nav className="flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-indigo-500 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  }`
                }
              >
                <Icon width={18} height={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-1 border-t border-white/5 pt-4">
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-200"
          >
            <HelpIcon width={18} height={18} />
            Help
          </button>
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-200"
          >
            <LogoutIcon width={18} height={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
