import type { BookingLanguage } from './booking-utils';

export type BookingFormValues = {
  fullName: string;
  phone: string;
  bookingDate: string;
  bookingTime: string;
  service: string;
  note: string;
  notificationConsent: boolean;
};

export type BookingConfirmation = {
  bookingReference: string;
  bookingStatus: 'PENDING';
};

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

type BookingSuccessResponse = {
  success: true;
  bookingReference: string;
  bookingStatus?: unknown;
};

export class BookingSubmissionError extends Error {
  constructor() {
    super('Booking submission failed.');
    this.name = 'BookingSubmissionError';
  }
}

export function createBookingRequestBody(
  form: BookingFormValues,
  language: BookingLanguage,
  sourcePage: string,
) {
  return {
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    bookingDate: form.bookingDate,
    bookingTime: form.bookingTime,
    service: form.service,
    note: form.note.trim(),
    notificationConsent: form.notificationConsent,
    language,
    sourcePage,
  };
}

function isSuccessfulBookingResponse(value: unknown): value is BookingSuccessResponse {
  if (typeof value !== 'object' || value === null) return false;

  const response = value as Record<string, unknown>;
  return response.success === true && typeof response.bookingReference === 'string' && response.bookingReference.trim().length > 0;
}

export async function submitBookingRequest(
  body: ReturnType<typeof createBookingRequestBody>,
  fetchImpl: FetchLike = fetch,
): Promise<BookingConfirmation> {
  const response = await fetchImpl('/api/booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result: unknown = await response.json().catch(() => null);

  if (!response.ok || !isSuccessfulBookingResponse(result)) {
    throw new BookingSubmissionError();
  }

  return {
    bookingReference: result.bookingReference.trim(),
    bookingStatus: 'PENDING',
  };
}

/** A synchronous lock that closes the tiny gap before React disables a button. */
export function createBookingSubmissionGuard() {
  let locked = false;

  return {
    acquire() {
      if (locked) return false;
      locked = true;
      return true;
    },
    release() {
      locked = false;
    },
    isLocked() {
      return locked;
    },
  };
}
