// ─── PreSignup (Step 1 of 2) ──────────────────────────────────────────────────
// User enters their phone number. On success, navigates to Signup (step 2).

import { useState } from "react";
import { Input } from "../common/input";
import Button from "../common/button";
import { preRegister } from "../../services/auth.service";
import type { PreSignupState } from "../../types/auth.types";
import { AUTH_ROLE } from "@repo/types";


// Country codes list — extend as needed
const COUNTRY_CODES = [
  { code: "+977", flag: "🇳🇵", name: "NP" },
  { code: "+1",   flag: "🇺🇸", name: "US" },
  { code: "+44",  flag: "🇬🇧", name: "GB" },
  { code: "+91",  flag: "🇮🇳", name: "IN" },
  { code: "+61",  flag: "🇦🇺", name: "AU" },
  { code: "+81",  flag: "🇯🇵", name: "JP" },
];

interface PreSignupProps {
  onVerified: (state: PreSignupState) => void; // navigate to Step 2
  onLoginClick: () => void;                    // navigate to Login
}

export default function PreSignup({ onVerified, onLoginClick }: PreSignupProps) {
  const [countryCode, setCountryCode] = useState("+977");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Full E.164-style number sent to backend
  const fullNumber = `${countryCode}${phone.replace(/\D/g, "")}`;

  async function handleSend() {
    setError("");

    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 6) {
      setError("Please enter a valid phone number.");
      return;
    }

    try {
      setLoading(true);
      await preRegister({
        type : AUTH_ROLE.NORMAL, 
        phone_number : fullNumber
      });
      onVerified({ phone_number: fullNumber });
    } catch (error: any) {
      setError((error instanceof Error) ? error.message : "something went wrong")
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #eef0f8 0%, #e8eaf6 100%)" }}
    >

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md px-8 py-10">

          {/* Logo icon */}
          <div className="flex justify-center mb-5">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: "#3730d4" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 2L4.09 12.82a1 1 0 0 0 .77 1.63H11l-1 7.55L19.91 11.18A1 1 0 0 0 19.14 9.55H13l1-7.55z"
                  fill="#ffffff"
                  stroke="#ffffff"
                  strokeWidth="0.5"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-1">
            Join ChatPulse
          </h1>
          <p className="text-center text-sm text-gray-500 mb-6">
            Verify your number to start chatting.
          </p>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <span
                className="text-sm font-semibold"
                style={{ color: "#3730d4" }}
              >
                Step 1: Phone
              </span>
              <span className="text-sm text-gray-400">33% complete</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-200">
              <div
                className="h-1.5 rounded-full"
                style={{ width: "33%", background: "#3730d4" }}
              />
            </div>
          </div>

          {/* SMS info banner */}
          <div className="flex gap-3 items-start bg-gray-50 border border-gray-200 rounded-xl p-3.5 mb-5">
            <div className="mt-0.5 shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              We'll send a 6-digit verification code to your phone via SMS to
              secure your account. Standard rates may apply.
            </p>
          </div>

          {/* Phone number label */}
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone Number
          </label>

          {/* Phone row: country code + number */}
          <div className="flex gap-2 mb-1">
            {/* Country code selector */}
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
              {/* Chevron */}
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="#6b7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Number field */}
            <div className="flex-1">
              <Input
                type="tel"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError("");
                }}
                error={error || undefined}
                inputSize="md"
              />
            </div>
          </div>

          {/* CTA */}
          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={handleSend}
            className="w-full flex items-center justify-center gap-2 font-semibold mt-4"
            style={{ background: "#3730d4" }}
          >
            Send Verification Code
            {!loading && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </Button>

          {/* Sign-in link */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onLoginClick}
              className="font-semibold hover:underline"
              style={{ color: "#3730d4" }}
            >
              Sign in
            </button>
          </p>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-4 flex flex-col items-center gap-2">
        {/* <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium tracking-wide uppercase">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <rect
              x="3" y="11" width="18" height="11" rx="2" ry="2"
              stroke="#9ca3af" strokeWidth="2"
            />
            <path
              d="M7 11V7a5 5 0 0 1 10 0v4"
              stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"
            />
          </svg>
         
        </div> */}
        <nav className="flex gap-5 text-xs text-gray-400">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Support</a>
        </nav>
      </footer>
    </div>
  );
}