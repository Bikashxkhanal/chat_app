import type { SmsProvider } from "./sms.provider.interface";

/**
 * Development provider — logs OTP to the server console.
 * Free, no external service required. Replace via SMS_PROVIDER env var.
 */
export class ConsoleSmsProvider implements SmsProvider {
  async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    console.log(`[SMS:Console] OTP for ${phoneNumber}: ${otp}`);
  }
}
