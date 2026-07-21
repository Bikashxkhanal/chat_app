const E164_REGEX = /^\+[1-9]\d{6,14}$/;

export function validatePhoneNumber(phone: string): boolean {
  return E164_REGEX.test(phone.trim());
}

export function normalizePhoneNumber(phone: string): string {
  return phone.trim();
}
