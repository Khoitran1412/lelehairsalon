type DealerLeadPayload = {
  fullName: string;
  phone: string;
  bookingDate: string;
  bookingTime: string;
  service: string;
  note: string;
  dealerCode: string;
  language: string;
  sourcePage: string;
};

type UpstreamResponse = {
  success?: unknown;
  message?: unknown;
};

const DEALER_PATTERN = /^DL(?:00[1-9]|01\d|020)$/;
const requiredFields: ReadonlyArray<keyof Pick<DealerLeadPayload, 'fullName' | 'phone' | 'bookingDate' | 'bookingTime' | 'service' | 'dealerCode'>> = [
  'fullName',
  'phone',
  'bookingDate',
  'bookingTime',
  'service',
  'dealerCode',
];

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseDealerLeadPayload(value: unknown): DealerLeadPayload | null {
  if (typeof value !== 'object' || value === null) return null;

  const payload = value as Record<string, unknown>;
  const dealerCode = readString(payload.dealerCode).toUpperCase();
  const lead: DealerLeadPayload = {
    fullName: readString(payload.fullName),
    phone: readString(payload.phone),
    bookingDate: readString(payload.bookingDate),
    bookingTime: readString(payload.bookingTime),
    service: readString(payload.service),
    note: readString(payload.note),
    dealerCode,
    language: readString(payload.language) || 'en',
    sourcePage: readString(payload.sourcePage),
  };

  return requiredFields.every((field) => lead[field]) && DEALER_PATTERN.test(dealerCode) ? lead : null;
}

function responseMessage(value: UpstreamResponse, fallback: string) {
  return typeof value.message === 'string' && value.message.trim() ? value.message : fallback;
}

export async function POST(request: Request) {
  console.info('Dealer lead request received');

  let payload: DealerLeadPayload | null;
  try {
    payload = parseDealerLeadPayload(await request.json());
  } catch {
    return Response.json({ success: false, message: 'Invalid dealer lead request.' }, { status: 400 });
  }

  if (!payload) {
    return Response.json({ success: false, message: 'Missing required dealer lead fields.' }, { status: 400 });
  }

  const endpoint = process.env.NEXT_PUBLIC_LEAD_ENDPOINT;
  console.info(`Dealer lead endpoint configured: ${Boolean(endpoint)}`);

  if (!endpoint) {
    return Response.json({ success: false, message: 'Dealer lead service is unavailable.' }, { status: 500 });
  }

  const params = new URLSearchParams();
  params.set('fullName', payload.fullName);
  params.set('phone', payload.phone);
  params.set('bookingDate', payload.bookingDate);
  params.set('bookingTime', payload.bookingTime);
  params.set('service', payload.service);
  params.set('note', payload.note);
  params.set('dealerCode', payload.dealerCode);
  params.set('language', payload.language);
  params.set('sourcePage', payload.sourcePage);

  try {
    const upstreamResponse = await fetch(endpoint, {
      method: 'POST',
      body: params,
      redirect: 'follow',
      cache: 'no-store',
    });
    console.info(`Dealer lead upstream HTTP status: ${upstreamResponse.status}`);

    const upstreamText = await upstreamResponse.text();
    let upstream: UpstreamResponse;
    try {
      upstream = JSON.parse(upstreamText) as UpstreamResponse;
    } catch {
      console.info('Dealer lead upstream success: false');
      return Response.json({ success: false, message: 'Dealer lead service returned an invalid response.' }, { status: 502 });
    }

    const upstreamSuccess = upstream.success === true;
    console.info(`Dealer lead upstream success: ${upstreamSuccess}`);

    if (!upstreamResponse.ok || !upstreamSuccess) {
      return Response.json(
        { success: false, message: responseMessage(upstream, 'Dealer lead service could not process the request.') },
        { status: upstreamResponse.ok ? 422 : 502 },
      );
    }

    return Response.json({ success: true, message: responseMessage(upstream, 'Dealer lead received.') });
  } catch {
    console.info('Dealer lead upstream success: false');
    return Response.json({ success: false, message: 'Dealer lead service is temporarily unavailable.' }, { status: 502 });
  }
}
