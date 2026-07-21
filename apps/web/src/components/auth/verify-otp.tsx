import { useEffect, useRef, useState } from "react";
import { Input } from "../common/input";
import Button from "../common/button";
import { verifyOtp, resendOtp } from "../../services/auth.service";
import type { PreSignupState } from "../../types/auth.types";
import { OTP_LENGTH, RESEND_COOLDOWN_SECONDS } from "../../types/auth.types";
import { AUTH_ROLE } from "@repo/types";

interface VerifyOtpProps {
  preSignupState: PreSignupState;
  onVerified: (state: PreSignupState) => void;
  onBack: () => void;
}

function maskPhone(num: string) {
  const digits = num.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  const prefix = num.replace(/\d{4}$/, "");
  return `${prefix}****${last4}`;
}

export default function VerifyOtp({ preSignupState, onVerified, onBack }: VerifyOtpProps) {
  const { phone_number } = preSignupState;
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  async function handleVerify() {
    setError("");
    setSuccess("");

    if (!phone_number) {
      setError("Phone number is missing. Please go back and enter your number.");
      return;
    }

    if (!otp.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    if (otp.trim().length !== OTP_LENGTH || !/^\d+$/.test(otp.trim())) {
      setError(`Verification code must be exactly ${OTP_LENGTH} digits.`);
      return;
    }

    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      setLoading(true);
      await verifyOtp({
        type: AUTH_ROLE.NORMAL,
        phone_number,
        otp: otp.trim(),
      });
      setSuccess("Phone number verified successfully!");
      onVerified({ phone_number, otpVerified: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  }

  async function handleResend() {
    setError("");
    setSuccess("");

    if (!phone_number) {
      setError("Phone number is missing.");
      return;
    }

    if (countdown > 0 || resendLoading) return;

    try {
      setResendLoading(true);
      const response = await resendOtp({
        type: AUTH_ROLE.NORMAL,
        phone_number,
      });
      setCountdown(response.data.resendCooldownSeconds ?? RESEND_COOLDOWN_SECONDS);
      setSuccess("A new verification code has been sent.");
      setOtp("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #eef0f8 0%, #e8eaf6 100%)" }}
    >
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md px-8 py-10">

          <div className="flex justify-center mb-5">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: "#3730d4" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold text-gray-900 mb-1">
            Verify Your Number
          </h1>
          <p className="text-center text-sm text-gray-500 mb-6">
            Enter the {OTP_LENGTH}-digit code sent to {maskPhone(phone_number)}
          </p>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold" style={{ color: "#3730d4" }}>
                Step 2: Verification
              </span>
              <span className="text-sm text-gray-400">66% complete</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-200">
              <div
                className="h-1.5 rounded-full"
                style={{ width: "66%", background: "#3730d4" }}
              />
            </div>
          </div>

          <div className="mb-1">
            <Input
              type="text"
              inputMode="numeric"
              label="Verification Code"
              placeholder={`Enter ${OTP_LENGTH}-digit code`}
              value={otp}
              maxLength={OTP_LENGTH}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
                setOtp(val);
                setError("");
              }}
              error={error || undefined}
              inputSize="md"
            />
          </div>

          {success && (
            <p className="text-sm mt-2" style={{ color: "#0d9488" }}>{success}</p>
          )}

          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={handleVerify}
            className="w-full flex items-center justify-center gap-2 font-semibold mt-4"
            style={{ background: "#3730d4" }}
          >
            Verify Code
          </Button>

          <div className="mt-4 text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-400">
                Resend code in {countdown}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-sm font-semibold hover:underline disabled:opacity-50"
                style={{ color: "#3730d4" }}
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </button>
            )}
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            <button
              type="button"
              onClick={onBack}
              className="font-semibold hover:underline"
              style={{ color: "#3730d4" }}
            >
              Change phone number
            </button>
          </p>
        </div>
      </main>

      <footer className="py-4 flex flex-col items-center gap-2">
        <nav className="flex gap-5 text-xs text-gray-400">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Support</a>
        </nav>
      </footer>
    </div>
  );
}
