import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BookingSubmissionError,
  createBookingRequestBody,
  createBookingSubmissionGuard,
  submitBookingRequest,
  type BookingFormValues,
} from '../src/lib/booking/booking-submission.ts';

const form: BookingFormValues = {
  fullName: 'Nguyen An',
  phone: '0975489317',
  bookingDate: '2026-08-29',
  bookingTime: '14:30',
  service: 'Haircut',
  note: 'Please keep the length.',
  notificationConsent: true,
};

test('shows a website confirmation only after a genuine successful booking response', async () => {
  const body = createBookingRequestBody(form, 'vi', 'https://lelehairsalon.info/');
  const confirmation = await submitBookingRequest(body, async (input, init) => {
    assert.equal(input, '/api/booking');
    assert.equal(init.method, 'POST');
    return new Response(JSON.stringify({ success: true, bookingReference: 'LELE-20260828-AB12CD34', bookingStatus: 'PENDING' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  assert.deepEqual(confirmation, { bookingReference: 'LELE-20260828-AB12CD34', bookingStatus: 'PENDING' });
});

test('failed booking requests leave the entered details intact', async () => {
  const enteredValues = structuredClone(form);
  const body = createBookingRequestBody(enteredValues, 'en', 'https://lelehairsalon.info/');

  await assert.rejects(
    submitBookingRequest(body, async () => new Response(JSON.stringify({ success: false }), { status: 422 })),
    BookingSubmissionError,
  );
  assert.deepEqual(enteredValues, form);
});

test('the synchronous submission guard prevents duplicate clicks before React rerenders', () => {
  const guard = createBookingSubmissionGuard();

  assert.equal(guard.acquire(), true);
  assert.equal(guard.acquire(), false);
  assert.equal(guard.isLocked(), true);
  guard.release();
  assert.equal(guard.acquire(), true);
});

test('consent is included accurately without making it required for a booking', () => {
  const consentOn = createBookingRequestBody(form, 'en', 'https://lelehairsalon.info/');
  const consentOff = createBookingRequestBody({ ...form, notificationConsent: false }, 'en', 'https://lelehairsalon.info/');

  assert.equal(consentOn.notificationConsent, true);
  assert.equal(consentOff.notificationConsent, false);
});
