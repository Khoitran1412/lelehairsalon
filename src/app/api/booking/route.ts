type BookingPayload = {
  fullName: string;
  phone: string;
  bookingDate: string;
  bookingTime: string;
  service: string;
  note: string;
  language: string;
  sourcePage: string;
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

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

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
    language: readOptionalString(payload.language) || 'en',
    sourcePage: readOptionalString(payload.sourcePage),
  };

  return requiredFields.every((field) => booking[field]) ? booking : null;
}

function responseMessage(value: UpstreamResponse, fallback: string) {
  return typeof value.message === 'string' && value.message.trim() ? value.message : fallback;
}

export async function POST(request: Request) {
  console.info('Booking request received');

  let payload: BookingPayload | null;
  try {
    payload = parseBookingPayload(await request.json());
  } catch {
    return Response.json({ success: false, message: 'Invalid booking request.' }, { status: 400 });
  }

  if (!payload) {
    return Response.json({ success: false, message: 'Missing required booking fields.' }, { status: 400 });
  }

  const endpoint = process.env.NEXT_PUBLIC_BOOKING_ENDPOINT;
  console.info(`Booking endpoint configured: ${Boolean(endpoint)}`);

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

  try {
    const upstreamResponse = await fetch(endpoint, {
      method: 'POST',
      body: params,
      redirect: 'follow',
      cache: 'no-store',
    });
    console.info(`Booking upstream HTTP status: ${upstreamResponse.status}`);

    const upstreamText = await upstreamResponse.text();
    let upstream: UpstreamResponse;
    try {
      upstream = JSON.parse(upstreamText) as UpstreamResponse;
    } catch {
      console.info('Booking upstream success: false');
      return Response.json({ success: false, message: 'Booking service returned an invalid response.' }, { status: 502 });
    }

    const upstreamSuccess = upstream.success === true;
    console.info(`Booking upstream success: ${upstreamSuccess}`);

    if (!upstreamResponse.ok || !upstreamSuccess) {
      return Response.json(
        { success: false, message: responseMessage(upstream, 'Booking service could not process the request.') },
        { status: upstreamResponse.ok ? 422 : 502 },
      );
    }

    return Response.json({ success: true, message: responseMessage(upstream, 'Booking request received.') });
  } catch {
    console.info('Booking upstream success: false');
    return Response.json({ success: false, message: 'Booking service is temporarily unavailable.' }, { status: 502 });
  }
}
