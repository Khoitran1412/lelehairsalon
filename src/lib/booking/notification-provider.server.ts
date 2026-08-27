import { normalizeVietnameseMobile, type BookingLanguage } from './booking-utils.ts';
import type { LedgerCompletion, NotificationLedger } from './notification-ledger';

export type BookingNotification = {
  reference: string;
  phone: string;
  bookingDate: string;
  bookingTime: string;
  service: string;
  language: BookingLanguage;
  notificationConsent: boolean;
};

export type NotificationKind = 'received' | 'confirmed';
export type NotificationChannel = 'sms' | 'whatsapp';
export type NotificationOutcome = 'sent' | 'failed' | 'skipped' | 'duplicate' | 'unknown';

export type NotificationChannelResult = {
  channel: NotificationChannel;
  outcome: NotificationOutcome;
  reason?: string;
  httpStatus?: number;
};

export type NotificationDeliveryResult = {
  kind: NotificationKind;
  reference: string;
  channels: [NotificationChannelResult, NotificationChannelResult];
};

export type MessagingEnvironment = {
  messagingEnabled?: string;
  accountSid?: string;
  authToken?: string;
  smsFrom?: string;
  whatsappFrom?: string;
  receivedContentSid?: string;
  confirmedContentSid?: string;
};

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

const receivedSms = (booking: BookingNotification) =>
  `[LeLe Hair Design] Da nhan yeu cau dat lich ${booking.reference} vao ${booking.bookingTime} ${booking.bookingDate}. Lich chua duoc xac nhan. Salon se phan hoi som.`;

const confirmedSms = (booking: BookingNotification) =>
  `[LeLe Hair Design] Lich hen ${booking.reference} da duoc xac nhan vao ${booking.bookingTime} ${booking.bookingDate}. Vui long den dung gio.`;

/**
 * These are the bilingual Unicode bodies to register in Twilio Content
 * Templates. WhatsApp sends their Content SID rather than a browser-provided
 * message body.
 */
export const whatsappTemplateCopy = {
  received: {
    vi: 'LeLe Hair Design đã nhận yêu cầu đặt lịch {{1}} vào {{2}} {{3}}. Lịch hẹn chưa được xác nhận. Salon sẽ thông báo sau khi kiểm tra lịch.',
    en: 'LeLe Hair Design has received your booking request {{1}} for {{2}} {{3}}. Your appointment is not confirmed yet. We will notify you after reviewing availability.',
  },
  confirmed: {
    vi: 'LeLe Hair Design xác nhận lịch hẹn {{1}} vào {{2}} {{3}}. Vui lòng đến đúng giờ.',
    en: 'LeLe Hair Design has confirmed appointment {{1}} for {{2}} {{3}}. Please arrive on time.',
  },
} as const;

function isMessagingEnabled(environment: MessagingEnvironment) {
  return environment.messagingEnabled === 'true';
}

function hasBaseTwilioCredentials(environment: MessagingEnvironment) {
  return Boolean(environment.accountSid?.trim() && environment.authToken?.trim());
}

function basicAuthorization(environment: MessagingEnvironment) {
  return `Basic ${btoa(`${environment.accountSid}:${environment.authToken}`)}`;
}

function withWhatsappPrefix(value: string) {
  return value.startsWith('whatsapp:') ? value : `whatsapp:${value}`;
}

function skipped(channel: NotificationChannel, reason: string): NotificationChannelResult {
  return { channel, outcome: 'skipped', reason };
}

function failed(channel: NotificationChannel, reason: string, httpStatus?: number): NotificationChannelResult {
  return { channel, outcome: 'failed', reason, ...(httpStatus ? { httpStatus } : {}) };
}

function completionFor(result: NotificationChannelResult): LedgerCompletion {
  return {
    outcome: result.outcome === 'sent' ? 'sent' : result.outcome === 'unknown' ? 'unknown' : result.outcome === 'skipped' ? 'skipped' : 'failed',
    ...(result.reason ? { reason: result.reason } : {}),
    completedAt: new Date().toISOString(),
  };
}

function contentSidFor(kind: NotificationKind, environment: MessagingEnvironment) {
  return kind === 'received' ? environment.receivedContentSid?.trim() : environment.confirmedContentSid?.trim();
}

async function postToTwilio(
  environment: MessagingEnvironment,
  parameters: URLSearchParams,
  fetchImpl: FetchLike,
): Promise<Response> {
  return fetchImpl(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(environment.accountSid ?? '')}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: basicAuthorization(environment),
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: parameters.toString(),
  });
}

export function createBookingNotificationProvider({
  environment,
  ledger,
  fetchImpl = fetch,
}: {
  environment: MessagingEnvironment;
  ledger: NotificationLedger;
  fetchImpl?: FetchLike;
}) {
  async function deliver(
    channel: NotificationChannel,
    key: string,
    send: () => Promise<Response>,
  ): Promise<NotificationChannelResult> {
    let claim;
    try {
      claim = await ledger.claim(key);
    } catch {
      return failed(channel, 'idempotency_unavailable');
    }

    if (!claim.acquired) return { channel, outcome: 'duplicate', reason: claim.status };

    let result: NotificationChannelResult;
    try {
      const response = await send();
      result = response.ok ? { channel, outcome: 'sent' } : failed(channel, 'provider_rejected', response.status);
    } catch {
      result = failed(channel, 'provider_unavailable');
    }

    try {
      await ledger.complete(key, completionFor(result));
      return result;
    } catch {
      // The prior claim remains durable, so an ambiguous third-party attempt is
      // never automatically retried and cannot produce a duplicate message.
      return { channel, outcome: 'unknown', reason: 'result_persistence_failed' };
    }
  }

  async function send(kind: NotificationKind, booking: BookingNotification): Promise<NotificationDeliveryResult> {
    if (!isMessagingEnabled(environment)) {
      return {
        kind,
        reference: booking.reference,
        channels: [skipped('sms', 'messaging_disabled'), skipped('whatsapp', 'messaging_disabled')],
      };
    }

    if (!booking.notificationConsent) {
      return {
        kind,
        reference: booking.reference,
        channels: [skipped('sms', 'consent_not_given'), skipped('whatsapp', 'consent_not_given')],
      };
    }

    const phone = normalizeVietnameseMobile(booking.phone);
    if (!phone) {
      return {
        kind,
        reference: booking.reference,
        channels: [skipped('sms', 'invalid_vietnamese_mobile'), skipped('whatsapp', 'invalid_vietnamese_mobile')],
      };
    }

    if (!hasBaseTwilioCredentials(environment)) {
      return {
        kind,
        reference: booking.reference,
        channels: [skipped('sms', 'twilio_credentials_missing'), skipped('whatsapp', 'twilio_credentials_missing')],
      };
    }

    const smsFrom = environment.smsFrom?.trim();
    const whatsappFrom = environment.whatsappFrom?.trim();
    const contentSid = contentSidFor(kind, environment);
    const smsBody = kind === 'received' ? receivedSms(booking) : confirmedSms(booking);

    const sms = smsFrom
      ? deliver('sms', `${kind}:${booking.reference}:sms`, async () => {
          const parameters = new URLSearchParams({ To: phone, From: smsFrom, Body: smsBody });
          return postToTwilio(environment, parameters, fetchImpl);
        })
      : Promise.resolve(skipped('sms', 'sms_sender_missing'));

    const whatsapp = whatsappFrom && contentSid
      ? deliver('whatsapp', `${kind}:${booking.reference}:whatsapp`, async () => {
          const parameters = new URLSearchParams({
            To: withWhatsappPrefix(phone),
            From: withWhatsappPrefix(whatsappFrom),
            ContentSid: contentSid,
            ContentVariables: JSON.stringify({
              1: booking.reference,
              2: booking.bookingTime,
              3: booking.bookingDate,
              4: booking.service,
              5: booking.language,
            }),
          });
          return postToTwilio(environment, parameters, fetchImpl);
        })
      : Promise.resolve(skipped('whatsapp', whatsappFrom ? 'whatsapp_content_sid_missing' : 'whatsapp_sender_missing'));

    const channels = await Promise.all([sms, whatsapp]);
    return { kind, reference: booking.reference, channels: [channels[0], channels[1]] };
  }

  return {
    sendBookingReceived: (booking: BookingNotification) => send('received', booking),
    sendBookingConfirmed: (booking: BookingNotification) => send('confirmed', booking),
  };
}
