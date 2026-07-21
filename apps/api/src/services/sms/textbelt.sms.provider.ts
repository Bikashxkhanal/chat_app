import type { SmsProvider } from "./sms.provider.interface";

/**
 * TextBelt — free tier allows 1 SMS per day per IP (key: "textbelt").
 * https://textbelt.com/
 * Replace with a paid provider by implementing SmsProvider.
 */
export class TextbeltSmsProvider implements SmsProvider {
  async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    const key = process.env.TEXTBELT_API_KEY ?? "textbelt";
    const response = await fetch("https://textbelt.com/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: phoneNumber,
        message: `Your ChatPulse verification code is: ${otp}`,
        key,
      }),
    });

    const result = (await response.json()) as { success: boolean; error?: string };
    if (!result.success) {
      throw new Error(result.error ?? "Failed to send SMS via TextBelt");
    }
  }
}
