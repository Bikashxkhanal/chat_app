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
  tenant_id?: string;
  refresh_token?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Navigation State shared between PreSignup → Signup ───────────────────────

export interface PreSignupState {
  phone_number: string;
  // extend here when OTP is wired up
}