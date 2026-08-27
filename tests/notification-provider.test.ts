import assert from 'node:assert/strict';
import test from 'node:test';
import type { NotificationLedger } from '../src/lib/booking/notification-ledger.ts';
import {
  createBookingNotificationProvider,
  type BookingNotification,
  type MessagingEnvironment,
} from '../src/lib/booking/notification-provider.server.ts';

const booking: BookingNotification = {
  reference: 'LELE-20260828-AB12CD34',
  phone: '0975489317',
  bookingDate: '2026-08-29',
  bookingTime: '14:30',
  service: 'Haircut',
  language: 'vi',
  notificationConsent: true,
};

const readyEnvironment: MessagingEnvironment = {
  messagingEnabled: 'true',
  accountSid: 'account-sid-for-test',
  authToken: 'auth-token-for-test',
  smsFrom: '+15005550006',
  whatsappFrom: '+14155238886',
  receivedContentSid: 'HXreceivedtemplate',
  confirmedContentSid: 'HXconfirmedtemplate',
};

function memoryLedger() {
  const claimed = new Set<string>();
  const completions = new Map<string, string>();
  const ledger: NotificationLedger = {
    async claim(key) {
      if (claimed.has(key)) return { acquired: false, status: 'completed' as const };
      claimed.add(key);
      return { acquired: true, status: 'claimed' as const };
    },
    async complete(key, completion) {
      completions.set(key, completion.outcome);
    },
  };

  return { ledger, completions };
}

test('disabled messaging performs no Twilio request and leaves the booking path usable', async () => {
  const { ledger } = memoryLedger();
  let fetches = 0;
  const provider = createBookingNotificationProvider({
    environment: { ...readyEnvironment, messagingEnabled: '' },
    ledger,
    fetchImpl: async () => {
      fetches += 1;
      throw new Error('Messaging must not call this when disabled.');
    },
  });

  const result = await provider.sendBookingReceived(booking);
  assert.equal(fetches, 0);
  assert.deepEqual(result.channels.map((channel) => channel.outcome), ['skipped', 'skipped']);
});

test('no consent blocks both external channels without blocking a valid booking', async () => {
  const { ledger } = memoryLedger();
  let fetches = 0;
  const provider = createBookingNotificationProvider({
    environment: readyEnvironment,
    ledger,
    fetchImpl: async () => {
      fetches += 1;
      return new Response(null, { status: 201 });
    },
  });

  const result = await provider.sendBookingReceived({ ...booking, notificationConsent: false });
  assert.equal(fetches, 0);
  assert.deepEqual(result.channels.map((channel) => channel.reason), ['consent_not_given', 'consent_not_given']);
});

test('SMS and WhatsApp channel failures are recorded independently', async () => {
  const { ledger, completions } = memoryLedger();
  const provider = createBookingNotificationProvider({
    environment: readyEnvironment,
    ledger,
    fetchImpl: async (_url, init) => {
      const fields = new URLSearchParams(String(init.body));
      return fields.get('To')?.startsWith('whatsapp:')
        ? new Response(null, { status: 503 })
        : new Response(null, { status: 201 });
    },
  });

  const result = await provider.sendBookingConfirmed(booking);
  assert.deepEqual(result.channels.map((channel) => channel.outcome), ['sent', 'failed']);
  assert.equal(completions.get('confirmed:LELE-20260828-AB12CD34:sms'), 'sent');
  assert.equal(completions.get('confirmed:LELE-20260828-AB12CD34:whatsapp'), 'failed');
});

test('a repeated notification key cannot produce duplicate Twilio requests', async () => {
  const { ledger } = memoryLedger();
  let fetches = 0;
  const provider = createBookingNotificationProvider({
    environment: readyEnvironment,
    ledger,
    fetchImpl: async () => {
      fetches += 1;
      return new Response(null, { status: 201 });
    },
  });

  await provider.sendBookingReceived(booking);
  const repeated = await provider.sendBookingReceived(booking);

  assert.equal(fetches, 2);
  assert.deepEqual(repeated.channels.map((channel) => channel.outcome), ['duplicate', 'duplicate']);
});
