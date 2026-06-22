// ─── Settings Page ─────────────────────────────────────────────────────────
// Static UI only — local state, no backend wiring yet.

import { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { PaletteIcon, LockIcon, ChevronRightIcon, DotsIcon } from "./icons";

type Theme = "dark" | "light" | "auto";
type FontSize = "small" | "default" | "large";

export default function Settings() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [fontSize, setFontSize] = useState<FontSize>("default");

  const fontOptions: { label: string; value: FontSize }[] = [
    { label: "Small", value: "small" },
    { label: "Default", value: "default" },
    { label: "Large", value: "large" },
  ];

  return (
    <DashboardLayout>
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-white/5 px-8 py-4">
        <h1 className="text-lg font-bold tracking-wide text-white">CHATPULSE</h1>
        <button type="button" className="text-gray-500 hover:text-gray-300" aria-label="More options">
          <DotsIcon width={18} height={18} />
        </button>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-8 py-8">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="mb-6 text-sm text-gray-500">
          Manage your account preferences and application configuration.
        </p>

        {/* Appearance */}
        <section className="mb-6 rounded-2xl border border-white/5 bg-[#0d1220] p-6">
          <div className="mb-5 flex items-center gap-2">
            <PaletteIcon width={18} height={18} className="text-indigo-400" />
            <h3 className="font-semibold text-white">Appearance</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Theme */}
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-gray-500">THEME</p>
              <div className="grid grid-cols-3 gap-2">
                {(["dark", "light", "auto"] as Theme[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`flex h-16 items-center justify-center rounded-xl text-sm font-medium capitalize transition-colors ${
                      theme === t
                        ? "border-2 border-indigo-500 bg-[#0b0f19] text-white"
                        : t === "light"
                          ? "bg-gray-100 text-gray-900 hover:opacity-90"
                          : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-gray-500">FONT SIZE</p>
              <div className="px-1 pt-4">
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={1}
                  value={fontOptions.findIndex((f) => f.value === fontSize)}
                  onChange={(e) =>
                    setFontSize(fontOptions[Number(e.target.value)].value)
                  }
                  className="w-full accent-indigo-500"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  {fontOptions.map((f) => (
                    <span key={f.value}>{f.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="mb-6 rounded-2xl border border-white/5 bg-[#0d1220] p-6">
          <div className="mb-3 flex items-center gap-2">
            <LockIcon width={18} height={18} className="text-indigo-400" />
            <h3 className="font-semibold text-white">Privacy</h3>
          </div>

          <div className="divide-y divide-white/5">
            <button
              type="button"
              className="flex w-full items-center justify-between py-3 text-left"
            >
              <div>
                <p className="text-sm font-medium text-white">Read Receipts</p>
                <p className="text-xs text-gray-500">
                  Allow others to see when you've read their messages.
                </p>
              </div>
              <ChevronRightIcon width={18} height={18} className="text-gray-500" />
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-between py-3 text-left"
            >
              <div>
                <p className="text-sm font-medium text-white">Last Seen</p>
                <p className="text-xs text-gray-500">Everyone</p>
              </div>
              <ChevronRightIcon width={18} height={18} className="text-gray-500" />
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-between py-3 text-left"
            >
              <div>
                <p className="text-sm font-medium text-white">Blocked Contacts</p>
                <p className="text-xs text-gray-500">0 contacts</p>
              </div>
              <ChevronRightIcon width={18} height={18} className="text-gray-500" />
            </button>
          </div>
        </section>

        {/* Footer actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5"
          >
            Discard Changes
          </button>
          <button
            type="button"
            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
          >
            Save All Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
