export type BookingLanguage = 'en' | 'vi';

const VIETNAMESE_MOBILE_PATTERN = /^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/;
const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

export function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function readBookingLanguage(value: unknown): BookingLanguage {
  return value === 'vi' ? 'vi' : 'en';
}

/**
 * Consent is deliberately strict: only an actual boolean true authorises a
 * notification. Values such as "true", 1, or a missing field do not.
 */
export function hasNotificationConsent(value: unknown) {
  return value === true;
}

/**
 * Converts a Vietnamese mobile number to E.164 without changing the original
 * value that is submitted to the established booking endpoint.
 */
export function normalizeVietnameseMobile(phone: string): string | null {
  const compact = phone.trim().replace(/[\s().-]/g, '');

  if (!compact || (compact.includes('+') && !compact.startsWith('+'))) return null;

  const international = compact.startsWith('0084') ? `+84${compact.slice(4)}` : compact;
  if (!VIETNAMESE_MOBILE_PATTERN.test(international)) return null;

  if (international.startsWith('+84')) return international;
  if (international.startsWith('84')) return `+${international}`;
  return `+84${international.slice(1)}`;
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '***';

  const start = digits.slice(0, Math.min(3, digits.length));
  const end = digits.length > 3 ? digits.slice(-2) : '';
  return `${start}***${end}`;
}

function vietnamDateStamp(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: VIETNAM_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}${values.month}${values.day}`;
}

/** Generates a concise, non-secret reference with cryptographically secure entropy. */
export function createBookingReference(date = new Date(), randomUuid = crypto.randomUUID()) {
  const suffix = randomUuid.replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase();
  return `LELE-${vietnamDateStamp(date)}-${suffix}`;
}
