import assert from 'node:assert/strict';
import test from 'node:test';
import { createBookingReference, normalizeVietnameseMobile } from '../src/lib/booking/booking-utils.ts';

test('normalizes supported Vietnamese mobile formats to E.164', () => {
  const cases = [
    ['0975489317', '+84975489317'],
    ['0975 489 317', '+84975489317'],
    ['+84 975 489 317', '+84975489317'],
    ['84975489317', '+84975489317'],
    ['0084975489317', '+84975489317'],
  ] as const;

  for (const [phone, expected] of cases) {
    assert.equal(normalizeVietnameseMobile(phone), expected, phone);
  }
});

test('does not treat invalid, landline, or malformed values as a messageable Vietnamese mobile', () => {
  for (const phone of ['', '0212345678', '+84975489317+', '+84123456789', 'not a phone']) {
    assert.equal(normalizeVietnameseMobile(phone), null, phone);
  }
});

test('creates a readable booking reference using the Vietnam calendar date and secure UUID text', () => {
  assert.equal(
    createBookingReference(new Date('2026-08-28T12:00:00.000Z'), 'ab12cd34-5678-90ab-cdef-1234567890ab'),
    'LELE-20260828-AB12CD34',
  );
});
