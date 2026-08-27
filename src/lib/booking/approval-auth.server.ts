const encoder = new TextEncoder();
const FIVE_MINUTES_MS = 5 * 60 * 1000;

type TimingSafeSubtleCrypto = SubtleCrypto & {
  timingSafeEqual?: (left: BufferSource, right: BufferSource) => boolean;
};

function hexToBytes(value: string) {
  if (!/^[0-9a-f]{64}$/i.test(value)) return null;

  const bytes = new Uint8Array(32);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return crypto.subtle.sign('HMAC', key, encoder.encode(value));
}

function fallbackConstantTimeEqual(left: Uint8Array, right: Uint8Array) {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

async function timingSafeSignatureEqual(expected: ArrayBuffer, received: Uint8Array | null) {
  // Hash both inputs first so malformed signature lengths cannot influence the
  // comparison timing. Workers uses the native timing-safe implementation.
  const receivedBytes = received ? Uint8Array.from(received) : new Uint8Array();
  const [expectedHash, receivedHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', expected),
    crypto.subtle.digest('SHA-256', receivedBytes),
  ]);
  const subtle = crypto.subtle as TimingSafeSubtleCrypto;

  if (typeof subtle.timingSafeEqual === 'function') {
    return subtle.timingSafeEqual(expectedHash, receivedHash);
  }

  return fallbackConstantTimeEqual(new Uint8Array(expectedHash), new Uint8Array(receivedHash));
}

export async function createApprovalWebhookSignature(secret: string, timestamp: string, rawBody: string) {
  return toHex(await hmacSha256(secret, `${timestamp}.${rawBody}`));
}

export async function verifyApprovalWebhookSignature({
  secret,
  timestamp,
  signature,
  rawBody,
  now = Date.now(),
}: {
  secret: string | undefined;
  timestamp: string | null;
  signature: string | null;
  rawBody: string;
  now?: number;
}) {
  if (!secret?.trim() || !timestamp || !signature) return false;

  const timestampMs = Number(timestamp);
  if (!Number.isSafeInteger(timestampMs) || Math.abs(now - timestampMs) > FIVE_MINUTES_MS) return false;

  const expected = await hmacSha256(secret, `${timestamp}.${rawBody}`);
  return timingSafeSignatureEqual(expected, hexToBytes(signature));
}
