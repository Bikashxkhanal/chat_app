import { ApiError } from "@repo/utils";
import { getRedisClient } from "../config/redis";
import { getSmsProvider } from "./sms/index";
import { normalizePhoneNumber } from "../utils/phone.validation";

const OTP_LENGTH = 6;
const OTP_TTL_SECONDS = 300;
const VERIFIED_TTL_SECONDS = 1800;
const RESEND_COOLDOWN_SECONDS = 60;

function otpKey(phone: string) {
  return `otp:${phone}`;
}

function verifiedKey(phone: string) {
  return `verified:${phone}`;
}

function cooldownKey(phone: string) {
  return `otp:cooldown:${phone}`;
}

function generateOtp(): string {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

export async function sendOtpToPhone(phoneNumber: string): Promise<void> {
  const phone = normalizePhoneNumber(phoneNumber);
  const redis = getRedisClient();

  const cooldown = await redis.ttl(cooldownKey(phone));
  if (cooldown > 0) {
    throw new ApiError(429, `Please wait ${cooldown} seconds before requesting a new code`);
  }

  const alreadyVerified = await redis.get(verifiedKey(phone));
  if (alreadyVerified) {
    throw new ApiError(400, "Phone number is already verified");
  }

  const otp = generateOtp();

  await redis.set(otpKey(phone), otp, "EX", OTP_TTL_SECONDS);
  await redis.set(cooldownKey(phone), "1", "EX", RESEND_COOLDOWN_SECONDS);

  await getSmsProvider().sendOtp(phone, otp);
}

export async function verifyOtp(phoneNumber: string, otp: string): Promise<void> {
  const phone = normalizePhoneNumber(phoneNumber);
  const redis = getRedisClient();

  if (!otp || otp.length !== OTP_LENGTH || !/^\d+$/.test(otp)) {
    throw new ApiError(400, `OTP must be exactly ${OTP_LENGTH} digits`);
  }

  const alreadyVerified = await redis.get(verifiedKey(phone));
  if (alreadyVerified) {
    throw new ApiError(400, "Phone number is already verified");
  }

  const storedOtp = await redis.get(otpKey(phone));

  if (!storedOtp) {
    throw new ApiError(400, "OTP has expired. Please request a new code");
  }

  if (storedOtp !== otp.trim()) {
    throw new ApiError(400, "Incorrect OTP");
  }

  await redis.del(otpKey(phone));
  await redis.set(verifiedKey(phone), "1", "EX", VERIFIED_TTL_SECONDS);
}

export async function isPhoneVerified(phoneNumber: string): Promise<boolean> {
  const phone = normalizePhoneNumber(phoneNumber);
  const redis = getRedisClient();
  const verified = await redis.get(verifiedKey(phone));
  return verified === "1";
}

export async function clearPhoneVerification(phoneNumber: string): Promise<void> {
  const phone = normalizePhoneNumber(phoneNumber);
  const redis = getRedisClient();
  await redis.del(verifiedKey(phone));
  await redis.del(otpKey(phone));
  await redis.del(cooldownKey(phone));
}

export { OTP_LENGTH, RESEND_COOLDOWN_SECONDS };
