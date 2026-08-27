import { hasNotificationConsent, readBookingLanguage, readString } from '@/lib/booking/booking-utils';
import { verifyApprovalWebhookSignature } from '@/lib/booking/approval-auth.server';
import { claimApprovalEvent, completeApprovalEvent, sendBookingConfirmed } from '@/lib/booking/notification-runtime.server';

const MAX_APPROVAL_BODY_LENGTH = 32_768;

type ApprovalPayload = {
  bookingReference: string;
  fullName: string;
  phone: string;
  bookingDate: string;
  bookingTime: string;
  service: string;
  language: 'en' | 'vi';
  notificationConsent: boolean;
};

function parseApprovalPayload(value: unknown): ApprovalPayload | null {
  if (typeof value !== 'object' || value === null) return null;

  const payload = value as Record<string, unknown>;
  const parsed: ApprovalPayload = {
    bookingReference: readString(payload.bookingReference),
    fullName: readString(payload.fullName),
    phone: readString(payload.phone),
    bookingDate: readString(payload.bookingDate),
    bookingTime: readString(payload.bookingTime),
    service: readString(payload.service),
    language: readBookingLanguage(payload.language),
    notificationConsent: hasNotificationConsent(payload.notificationConsent),
  };

  return parsed.bookingReference && parsed.fullName && parsed.phone && parsed.bookingDate && parsed.bookingTime && parsed.service
    ? parsed
    : null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (rawBody.length > MAX_APPROVAL_BODY_LENGTH) {
    return Response.json({ success: false, message: 'Request body is too large.' }, { status: 413 });
  }

  const signatureValid = await verifyApprovalWebhookSignature({
    secret: process.env.BOOKING_APPROVAL_WEBHOOK_SECRET,
    timestamp: request.headers.get('x-lele-timestamp'),
    signature: request.headers.get('x-lele-signature'),
    rawBody,
  });
  if (!signatureValid) {
    return Response.json({ success: false, message: 'Unauthorised approval request.' }, { status: 401 });
  }

  let rawPayload: unknown;
  try {
    rawPayload = JSON.parse(rawBody) as unknown;
  } catch {
    return Response.json({ success: false, message: 'Invalid approval request.' }, { status: 400 });
  }

  const payload = parseApprovalPayload(rawPayload);
  if (!payload) {
    return Response.json({ success: false, message: 'Missing approval fields.' }, { status: 400 });
  }

  let approvalClaim;
  try {
    approvalClaim = await claimApprovalEvent(payload.bookingReference);
  } catch {
    console.error(JSON.stringify({ event: 'booking_approval_ledger_unavailable', reference: payload.bookingReference }));
    return Response.json({ success: false, message: 'Approval service is temporarily unavailable.' }, { status: 503 });
  }

  if (!approvalClaim.acquired) {
    return Response.json({ success: true, duplicate: true, bookingReference: payload.bookingReference });
  }

  const notification = await sendBookingConfirmed({
    reference: payload.bookingReference,
    phone: payload.phone,
    bookingDate: payload.bookingDate,
    bookingTime: payload.bookingTime,
    service: payload.service,
    language: payload.language,
    notificationConsent: payload.notificationConsent,
  });

  const hasFailure = notification.channels.some((channel) => channel.outcome === 'failed' || channel.outcome === 'unknown');
  try {
    await completeApprovalEvent(payload.bookingReference, {
      outcome: hasFailure ? 'failed' : 'sent',
      completedAt: new Date().toISOString(),
    });
  } catch {
    // The initial approval claim remains persisted, which prevents a replay from
    // sending the booking confirmation a second time.
    console.error(JSON.stringify({ event: 'booking_approval_completion_unavailable', reference: payload.bookingReference }));
  }

  return Response.json({
    success: true,
    duplicate: false,
    bookingReference: payload.bookingReference,
    notification,
  });
}
