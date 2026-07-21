export interface SmsProvider {
  sendOtp(phoneNumber: string, otp: string): Promise<void>;
}
