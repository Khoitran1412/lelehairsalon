import assert from 'node:assert/strict';
import test from 'node:test';
import { createApprovalWebhookSignature, verifyApprovalWebhookSignature } from '../src/lib/booking/approval-auth.server.ts';

test('accepts a fresh HMAC-SHA256 signed approval payload and rejects replay-window violations', async () => {
  const secret = 'test-only-shared-secret';
  const timestamp = '1787920200000';
  const rawBody = '{"bookingReference":"LELE-20260828-AB12CD34"}';
  const signature = await createApprovalWebhookSignature(secret, timestamp, rawBody);

  assert.equal(await verifyApprovalWebhookSignature({ secret, timestamp, signature, rawBody, now: Number(timestamp) + 60_000 }), true);
  assert.equal(await verifyApprovalWebhookSignature({ secret, timestamp, signature, rawBody, now: Number(timestamp) + 300_001 }), false);
  assert.equal(await verifyApprovalWebhookSignature({ secret, timestamp, signature: '0'.repeat(64), rawBody, now: Number(timestamp) }), false);
});
