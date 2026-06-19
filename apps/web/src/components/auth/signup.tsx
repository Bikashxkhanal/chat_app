// ─── Signup (Step 2 of 2) ─────────────────────────────────────────────────────
// User creates their password after phone number was verified in PreSignup.

import { useState } from "react";
import { Input } from "../common/input";
import Button from "../common/button";
import { register } from "../../services/auth.service";
import type { PreSignupState } from "../../types/auth.types";

interface PasswordRules {
  minLength: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  hasUppercase: boolean;
}

function checkRules(pw: string): PasswordRules {
  return {
    minLength:   pw.length >= 8,
    hasNumber:   /\d/.test(pw),
    hasSymbol:   /[^a-zA-Z0-9]/.test(pw),
    hasUppercase:/[A-Z]/.test(pw),
  };
}

interface SignupProps {
  preSignupState: PreSignupState;  // phone_number passed from PreSignup
  onSuccess: () => void;           // navigate to Login (or home) after registration
}

export default function Signup({ preSignupState, onSuccess }: SignupProps) {
  const { phone_number } = preSignupState;

  const [password, setPassword]         = useState("");
  const [confirmPw, setConfirmPw]       = useState("");
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);

  const rules = checkRules(password);
  const allRulesMet = Object.values(rules).every(Boolean);

  // Mask phone for display: show country code + last 4 digits
  function maskPhone(num: string) {
    const digits = num.replace(/\D/g, "");
    const last4  = digits.slice(-4);
    const prefix = num.replace(/\d{4}$/, "");
    return `${prefix}••••${last4}`;
  }

  async function handleComplete() {
    setError("");

    if (!allRulesMet) {
      setError("Password does not meet all requirements.");
      return;
    }
    if (password !== confirmPw) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await register(phone_number, password, confirmPw);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  // ── Rule chip ────────────────────────────────────────────────────────────────
  function RuleChip({ met, label }: { met: boolean; label: string }) {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
          style={{
            borderColor: met ? "#3730d4" : "#d1d5db",
            background:  met ? "#3730d4" : "transparent",
          }}
        >
          {met && (
            <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span
          className="text-xs"
          style={{ color: met ? "#3730d4" : "#9ca3af" }}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f0f1f8" }}
    >
      {/* ── Top nav ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <span className="text-lg font-bold" style={{ color: "#3730d4" }}>
          ChatPulse
        </span>
        <span className="text-sm text-gray-400 font-medium">Step 2 of 2</span>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md px-8 py-10">

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-7">
            {/* Step 1 — completed */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "#3730d4" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#fff" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Connector line */}
            <div
              className="h-0.5 w-10 rounded-full"
              style={{ background: "#3730d4" }}
            />

            {/* Step 2 — current */}
            <div
              className="w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-sm"
              style={{ borderColor: "#3730d4", color: "#3730d4" }}
            >
              2
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-2">
            Secure Your Account
          </h1>

          {/* Verified phone badge */}
          <div className="flex items-center justify-center gap-1.5 mb-7">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                stroke="#0d9488" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="#0d9488" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm" style={{ color: "#0d9488" }}>
              Phone number {maskPhone(phone_number)} verified
            </span>
          </div>

          {/* Create Password */}
          <div className="mb-2">
            <Input
              type="password"
              label="Create Password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              inputSize="md"
            />
          </div>

          {/* Password rules grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-5 px-1">
            <RuleChip met={rules.minLength}   label="8+ Characters"    />
            <RuleChip met={rules.hasSymbol}   label="Special Symbol"   />
            <RuleChip met={rules.hasNumber}   label="At least 1 Number"/>
            <RuleChip met={rules.hasUppercase}label="Uppercase Letter"  />
          </div>

          {/* Confirm Password */}
          <div className="mb-1">
            <Input
              type="password"
              label="Confirm Password"
              placeholder="Repeat your password"
              value={confirmPw}
              onChange={(e) => { setConfirmPw(e.target.value); setError(""); }}
              error={
                confirmPw && confirmPw !== password
                  ? "Passwords do not match"
                  : undefined
              }
              success={
                confirmPw && confirmPw === password && allRulesMet
                  ? "Passwords match"
                  : undefined
              }
              inputSize="md"
            />
          </div>

          {/* Generic error */}
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}

          {/* CTA */}
          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={handleComplete}
            className="w-full flex items-center justify-center gap-2 font-semibold mt-5"
            style={{ background: "#3730d4" }}
          >
            Complete Registration
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

          {/* Legal note */}
          <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
            By completing registration, you agree to our{" "}
            <a href="#" className="underline" style={{ color: "#3730d4" }}>
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline" style={{ color: "#3730d4" }}>
              Privacy Policy
            </a>
          </p>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-4">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
            ©️ 2024 ChatPulse Inc. All rights reserved.
          </span>
          <nav className="flex gap-5 text-xs text-gray-400">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Security</a>
            <a href="#" className="hover:underline">Status</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}