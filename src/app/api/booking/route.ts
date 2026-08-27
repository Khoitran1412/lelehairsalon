import { createBookingReference, hasNotificationConsent, maskPhone, normalizeVietnameseMobile, readBookingLanguage, readString } from '@/lib/booking/booking-utils';
import { scheduleBookingReceived } from '@/lib/booking/notification-runtime.server';

type BookingPayload = {
  fullName: string;
  phone: string;
  bookingDate: string;
  bookingTime: string;
  service: string;
  note: string;
  language: 'en' | 'vi';
  sourcePage: string;
  notificationConsent: boolean;
};

type UpstreamResponse = {
  success?: unknown;
  message?: unknown;
};

const requiredFields: ReadonlyArray<keyof Pick<BookingPayload, 'fullName' | 'phone' | 'bookingDate' | 'bookingTime' | 'service'>> = [
  'fullName',
  'phone',
  'bookingDate',
  'bookingTime',
  'service',
];

function readOptionalString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseBookingPayload(value: unknown): BookingPayload | null {
  if (typeof value !== 'object' || value === null) return null;

  const payload = value as Record<string, unknown>;
  const booking: BookingPayload = {
    fullName: readString(payload.fullName),
    phone: readString(payload.phone),
    bookingDate: readString(payload.bookingDate),
    bookingTime: readString(payload.bookingTime),
    service: readString(payload.service),
    note: readOptionalString(payload.note),
    language: readBookingLanguage(payload.language),
    sourcePage: readOptionalString(payload.sourcePage),
    notificationConsent: hasNotificationConsent(payload.notificationConsent),
  };

  return requiredFields.every((field) => booking[field]) ? booking : null;
}

function responseMessage(value: UpstreamResponse, fallback: string) {
  return typeof value.message === 'string' && value.message.trim() ? value.message : fallback;
}

export async function POST(request: Request) {
  let payload: BookingPayload | null;
  try {
    payload = parseBookingPayload(await request.json());
  } catch {
    return Response.json({ success: false, message: 'Invalid booking request.' }, { status: 400 });
  }

  if (!payload) {
    return Response.json({ success: false, message: 'Missing required booking fields.' }, { status: 400 });
  }

  const endpoint = process.env.BOOKING_ENDPOINT || process.env.NEXT_PUBLIC_BOOKING_ENDPOINT;
  const bookingReference = createBookingReference();
  const normalizedPhone = normalizeVietnameseMobile(payload.phone);

  console.info(JSON.stringify({
    event: 'booking_request_received',
    reference: bookingReference,
    phone: maskPhone(payload.phone),
    notificationConsent: payload.notificationConsent,
    hasNormalizedVietnameseMobile: Boolean(normalizedPhone),
    endpointConfigured: Boolean(endpoint),
  }));

  if (!endpoint) {
    return Response.json({ success: false, message: 'Booking service is unavailable.' }, { status: 500 });
  }

  const params = new URLSearchParams();
  params.set('fullName', payload.fullName);
  params.set('phone', payload.phone);
  params.set('bookingDate', payload.bookingDate);
  params.set('bookingTime', payload.bookingTime);
  params.set('service', payload.service);
  params.set('note', payload.note);
  params.set('language', payload.language);
  params.set('sourcePage', payload.sourcePage);
  // Additive metadata: the established Apps Script fields above remain exactly
  // as they were, including the customer's original phone number.
  params.set('booking_reference', bookingReference);
  params.set('notification_consent', String(payload.notificationConsent));
  params.set('booking_status', 'PENDING');

  try {
    const upstreamResponse = await fetch(endpoint, {
      method: 'POST',
      body: params,
      redirect: 'follow',
      cache: 'no-store',
    });
    console.info(JSON.stringify({ event: 'booking_upstream_response', reference: bookingReference, status: upstreamResponse.status }));

    const upstreamText = await upstreamResponse.text();
    let upstream: UpstreamResponse;
    try {
      upstream = JSON.parse(upstreamText) as UpstreamResponse;
    } catch {
      console.info(JSON.stringify({ event: 'booking_upstream_invalid_response', reference: bookingReference }));
      return Response.json({ success: false, message: 'Booking service returned an invalid response.' }, { status: 502 });
    }

    const upstreamSuccess = upstream.success === true;
    console.info(JSON.stringify({ event: 'booking_upstream_result', reference: bookingReference, success: upstreamSuccess }));

    if (!upstreamResponse.ok || !upstreamSuccess) {
      return Response.json(
        { success: false, message: responseMessage(upstream, 'Booking service could not process the request.') },
        { status: upstreamResponse.ok ? 422 : 502 },
      );
    }

    // Messaging is intentionally non-fatal: a disabled, unconfigured, or
    // partially failed provider never changes the real booking result.
    await scheduleBookingReceived({
      reference: bookingReference,
      phone: payload.phone,
      bookingDate: payload.bookingDate,
      bookingTime: payload.bookingTime,
      service: payload.service,
      language: payload.language,
      notificationConsent: payload.notificationConsent,
    });

    return Response.json({
      success: true,
      message: responseMessage(upstream, 'Booking request received.'),
      bookingReference,
      bookingStatus: 'PENDING',
    });
  } catch {
    console.info(JSON.stringify({ event: 'booking_upstream_unavailable', reference: bookingReference }));
    return Response.json({ success: false, message: 'Booking service is temporarily unavailable.' }, { status: 502 });
  }
}
