import { useState } from "react";
import { Input } from "../common/input";
import Button from "../common/button";
import { login } from "../../services/auth.service";
import { AUTH_ROLE } from "@repo/types";

const COUNTRY_CODES = [
  { code: "+977", flag: "🇳🇵", name: "NP" },
  { code: "+1",   flag: "🇺🇸", name: "US" },
  { code: "+44",  flag: "🇬🇧", name: "GB" },
  { code: "+91",  flag: "🇮🇳", name: "IN" },
  { code: "+61",  flag: "🇦🇺", name: "AU" },
  { code: "+81",  flag: "🇯🇵", name: "JP" },
];

interface LoginProps {
  onSuccess: () => void;        // navigate into the app after login
  onSignupClick: () => void;    // navigate to PreSignup
}

export default function Login({ onSuccess, onSignupClick }: LoginProps) {
  const [countryCode, setCountryCode] = useState("+977");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fullNumber = `${countryCode}${phone.replace(/\D/g, "")}`;

  async function handleSignIn() {
    setError("");

    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);
      await login({
        type : AUTH_ROLE.NORMAL,
        phone_number : fullNumber,
        password : password
      })
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid phone number or password.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSignIn();
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #f1f2f9 0%, #e9ebf6 100%)" }}
    >
     
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <span className="text-lg font-bold" style={{ color: "#3730d4" }}>
          ChatPulse
        </span>
        <a href="#" className="text-sm text-gray-500 hover:underline">
          Support
        </a>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md px-8 py-10">

          {/* Chat icon */}
          <div className="flex justify-center mb-5">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "#e8e9fb" }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  stroke="#3730d4"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-1">
            Welcome Back
          </h1>
          <p className="text-center text-sm text-gray-500 mb-7">
            Sign in to continue your conversations.
          </p>

          {/* Phone number */}
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone Number
          </label>
          <div className="flex gap-2 mb-4">
            <div className="relative">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="h-11 pl-3 pr-7 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                style={{ minWidth: "88px" }}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="#6b7280" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <Input
                type="tel"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                inputSize="md"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <a href="#" className="text-sm font-medium hover:underline" style={{ color: "#3730d4" }}>
              Forgot Password?
            </a>
          </div>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            inputSize="md"
          />

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 mt-3">{error}</p>
          )}

          {/* CTA */}
          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-2 font-semibold mt-6"
            style={{ background: "#3730d4" }}
          >
            Sign In
            {!loading && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="#fff" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            )}
          </Button>

          {/* Divider */}
          <div className="border-t border-gray-100 my-6" />

          {/* Signup link */}
          <p className="text-center text-sm text-gray-500">
            New to ChatPulse?{" "}
            <button
              type="button"
              onClick={onSignupClick}
              className="font-semibold hover:underline"
              style={{ color: "#3730d4" }}
            >
              Create an account
            </button>
          </p>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-4">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
            ChatPulse Inc.
          </span>
          <nav className="flex gap-5 text-xs text-gray-400">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Security</a>
            <a href="#" className="hover:underline">Status</a>
          </nav>
          <span className="text-xs text-gray-400">
            © 2024 ChatPulse Inc. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}