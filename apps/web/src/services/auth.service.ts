// ─── Auth Service ─────────────────────────────────────────────────────────────
// All auth-related API calls. Reads base URL from env so you only set it once.

import type {
  PreRegisterBody,
  RegisterBody,
  LoginBody,
  ApiResponse,
  User,
} from "../types/auth.types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const AUTH_BASE = `${BASE_URL}/api/v1/auth`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function post<TBody, TData>(
  endpoint: string,
  body: TBody
): Promise<ApiResponse<TData>> {
  const res = await fetch(`${AUTH_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // needed for httpOnly cookies
    body: JSON.stringify(body),
  });

  const data: ApiResponse<TData> = await res.json();

  // Treat 4xx / 5xx as thrown errors so callers can just catch
  if (!res.ok) {
    throw new Error(data.message ?? "Something went wrong");
  }

  return data;
}

// ─── Pre-Register (Step 1 of signup) ─────────────────────────────────────────
// Checks that the phone number is not already registered.
// Backend: POST /api/v1/auth/pre-register

export async function preRegister(
  phone_number: string
): Promise<ApiResponse<{ isUser: boolean; otpVerified: boolean }>> {
  const body: PreRegisterBody = { type: "NORMAL", phone_number };
  return post("/pre-register", body);
}

// ─── Register (Step 2 of signup) ─────────────────────────────────────────────
// Creates the account with phone + password.
// Backend: POST /api/v1/auth/register

export async function register(
  phone_number: string,
  password: string,
  confirm_password: string
): Promise<ApiResponse<User>> {
  const body: RegisterBody = {
    type: "NORMAL",
    phone_number,
    password,
    confirm_password,
  };
  return post("/register", body);
}

// ─── Login ────────────────────────────────────────────────────────────────────
// Authenticates and sets httpOnly cookies via the backend.
// Backend: POST /api/v1/auth/login

export async function login(
  phone_number: string,
  password: string
): Promise<ApiResponse<{ user: User }>> {
  const body: LoginBody = { type: "NORMAL", phone_number, password };
  return post("/login", body);
}