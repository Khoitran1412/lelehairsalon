import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createApprovalWebhookSignature } from './approval-auth.server';
import { hasNotificationConsent, normalizeVietnameseMobile } from './booking-utils';
import type { LedgerCompletion, NotificationLedger } from './notification-ledger';
import {
  createBookingNotificationProvider,
  type BookingNotification,
  type MessagingEnvironment,
  type NotificationDeliveryResult,
  type NotificationKind,
} from './notification-provider.server';

const unavailableLedger: NotificationLedger = {
  async claim() {
    throw new Error('Notification ledger is unavailable.');
  },
  async complete() {
    throw new Error('Notification ledger is unavailable.');
  },
};

function messagingEnvironment(): MessagingEnvironment {
  return {
    messagingEnabled: process.env.MESSAGING_ENABLED,
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    smsFrom: process.env.TWILIO_SMS_FROM,
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM,
    receivedContentSid: process.env.TWILIO_CONTENT_SID_RECEIVED,
    confirmedContentSid: process.env.TWILIO_CONTENT_SID_CONFIRMED,
  };
}

function canAttemptDelivery(environment: MessagingEnvironment, booking: BookingNotification, kind: NotificationKind) {
  if (environment.messagingEnabled !== 'true' || !hasNotificationConsent(booking.notificationConsent)) return false;
  if (!normalizeVietnameseMobile(booking.phone)) return false;
  if (!environment.accountSid?.trim() || !environment.authToken?.trim()) return false;

  const contentSid = kind === 'received' ? environment.receivedContentSid : environment.confirmedContentSid;
  return Boolean(environment.smsFrom?.trim() || (environment.whatsappFrom?.trim() && contentSid?.trim()));
}

async function getLedger() {
  const { env } = await getCloudflareContext({ async: true });
  const namespace = env.BOOKING_NOTIFICATION_LEDGER;
  return {
    claim: (key: string) => namespace.getByName(key).claim(),
    complete: (key: string, completion: LedgerCompletion) => namespace.getByName(key).complete(completion),
  } satisfies NotificationLedger;
}

function unavailableDelivery(kind: NotificationKind, booking: BookingNotification): NotificationDeliveryResult {
  return {
    kind,
    reference: booking.reference,
    channels: [
      { channel: 'sms', outcome: 'failed', reason: 'idempotency_unavailable' },
      { channel: 'whatsapp', outcome: 'failed', reason: 'idempotency_unavailable' },
    ],
  };
}

async function send(kind: NotificationKind, booking: BookingNotification): Promise<NotificationDeliveryResult> {
  const environment = messagingEnvironment();
  let ledger = unavailableLedger;

  if (canAttemptDelivery(environment, booking, kind)) {
    try {
      ledger = await getLedger();
    } catch {
      console.error(JSON.stringify({ event: 'booking_notification_ledger_unavailable', kind, reference: booking.reference }));
      return unavailableDelivery(kind, booking);
    }
  }

  const provider = createBookingNotificationProvider({ environment, ledger });
  const result = kind === 'received'
    ? await provider.sendBookingReceived(booking)
    : await provider.sendBookingConfirmed(booking);

  console.info(JSON.stringify({
    event: 'booking_notification_processed',
    kind,
    reference: booking.reference,
    channels: result.channels.map(({ channel, outcome, reason }) => ({ channel, outcome, ...(reason ? { reason } : {}) })),
  }));
  return result;
}

/** Server-only entrypoint used after a genuine booking submission succeeds. */
export function sendBookingReceived(booking: BookingNotification) {
  return send('received', booking);
}

/** Server-only entrypoint used only by the authenticated approval webhook. */
export function sendBookingConfirmed(booking: BookingNotification) {
  return send('confirmed', booking);
}

/**
 * Keeps receipt notification work out of the customer-facing response while
 * retaining it for the Worker lifetime. The booking response is already valid
 * once the established Apps Script has succeeded.
 */
export async function scheduleBookingReceived(booking: BookingNotification) {
  try {
    const { ctx } = await getCloudflareContext({ async: true });
    ctx.waitUntil((async () => {
      try {
        const result = await sendBookingReceived(booking);
        await recordReceivedNotificationResult(result);
      } catch {
        console.error(JSON.stringify({ event: 'booking_received_notification_unavailable', reference: booking.reference }));
      }
    })());
  } catch {
    console.error(JSON.stringify({ event: 'booking_received_notification_schedule_unavailable', reference: booking.reference }));
  }
}

export async function claimApprovalEvent(reference: string) {
  const ledger = await getLedger();
  return ledger.claim(`approval:${reference}:confirmed`);
}

export async function completeApprovalEvent(reference: string, outcome: LedgerCompletion) {
  const ledger = await getLedger();
  await ledger.complete(`approval:${reference}:confirmed`, outcome);
}

/**
 * Optional authenticated callback used only after the companion Apps Script is
 * installed. It mirrors receipt channel outcomes into the existing Sheet
 * without exposing customer details or changing the working booking request.
 */
export async function recordReceivedNotificationResult(result: NotificationDeliveryResult) {
  const endpoint = process.env.BOOKING_NOTIFICATION_RESULT_WEBHOOK_URL?.trim();
  const secret = process.env.BOOKING_APPROVAL_WEBHOOK_SECRET;
  if (!endpoint || !secret?.trim()) return;

  const notification = {
    action: 'record_received_notification_result',
    bookingReference: result.reference,
    notification: {
      kind: result.kind,
      channels: result.channels.map(({ channel, outcome, reason }) => ({ channel, outcome, ...(reason ? { reason } : {}) })),
    },
  };
  const rawNotification = JSON.stringify(notification);
  const timestamp = String(Date.now());
  const signature = await createApprovalWebhookSignature(secret, timestamp, rawNotification);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp, signature, rawNotification }),
    });
    if (!response.ok) {
      console.error(JSON.stringify({ event: 'booking_received_notification_result_rejected', reference: result.reference, status: response.status }));
    }
  } catch {
    console.error(JSON.stringify({ event: 'booking_received_notification_result_unavailable', reference: result.reference }));
  }
}
