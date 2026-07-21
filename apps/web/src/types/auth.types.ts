// ─── Auth Types ───────────────────────────────────────────────────────────────

export type AuthType = "NORMAL" | "SDK";

// ─── Request Bodies ───────────────────────────────────────────────────────────

export interface PreRegisterBody {
  type: AuthType;
  phone_number: string;
}

export interface RegisterBody {
  type: AuthType;
  phone_number: string;
  password: string;
  confirm_password: string;
}

export interface LoginBody {
  type: AuthType;
  phone_number: string;
  password: string;
}

export interface VerifyOtpBody {
  type: AuthType;
  phone_number: string;
  otp: string;
}

export interface ResendOtpBody {
  type: AuthType;
  phone_number: string;
}

// ─── API Response Shape ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  phone_number: string;
  full_name?: string;
  avatar?: string;
  tenant_id?: string;
  refresh_token?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ─── Navigation State shared between PreSignup → VerifyOtp → Signup ───────────

export interface PreSignupState {
  phone_number: string;
  otpVerified?: boolean;
}

export const OTP_LENGTH = 6;
export const RESEND_COOLDOWN_SECONDS = 60;
