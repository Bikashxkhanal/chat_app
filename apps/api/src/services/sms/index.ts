import type { SmsProvider } from "./sms.provider.interface";
import { ConsoleSmsProvider } from "./console.sms.provider";
import { TextbeltSmsProvider } from "./textbelt.sms.provider";

let smsProvider: SmsProvider | null = null;

export function getSmsProvider(): SmsProvider {
  if (!smsProvider) {
    const provider = (process.env.SMS_PROVIDER ?? "console").toLowerCase();
    switch (provider) {
      case "textbelt":
        smsProvider = new TextbeltSmsProvider();
        break;
      default:
        smsProvider = new ConsoleSmsProvider();
    }
  }
  return smsProvider;
}
