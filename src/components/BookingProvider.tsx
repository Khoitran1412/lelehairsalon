'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from 'react';
import { HiX } from 'react-icons/hi';
import { translations } from '@/i18n/translations';
import { useLanguage } from '@/i18n/useLanguage';

const DEALER_PATTERN = /^DL(?:00[1-9]|01\d|020)$/;
const DEALER_SUBMISSION_KEY = 'lele-dealer-lead-submitted:';
const SUCCESS_CLOSE_DELAY_MS = 1200;
const DEALER_POPUP_DELAY_MS = 5000;

type BookingServiceKey = keyof typeof translations.en.bookingPopup.services;

const bookingServices: ReadonlyArray<{ key: BookingServiceKey; value: string }> = [
  { key: 'haircut', value: 'Haircut' },
  { key: 'perm', value: 'Perm' },
  { key: 'color', value: 'Color' },
  { key: 'straightening', value: 'Straightening' },
  { key: 'hairRecovery', value: 'Hair Recovery' },
  { key: 'washStyling', value: 'Wash & Styling' },
  { key: 'balayageOmbre', value: 'Balayage / Ombre' },
  { key: 'consultation', value: 'Consultation' },
  { key: 'other', value: 'Other' },
];

type AppointmentForm = {
  fullName: string;
  phone: string;
  bookingDate: string;
  bookingTime: string;
  service: string;
  note: string;
};

const createEmptyAppointmentForm = (): AppointmentForm => ({
  fullName: '',
  phone: '',
  bookingDate: '',
  bookingTime: '',
  service: '',
  note: '',
});

function hasRequiredAppointmentFields(form: AppointmentForm) {
  return Boolean(form.fullName.trim() && form.phone.trim() && form.bookingDate && form.bookingTime && form.service);
}

function isSuccessfulResponse(value: unknown): value is { success: true } {
  return typeof value === 'object' && value !== null && 'success' in value && value.success === true;
}

interface BookingContextValue {
  openBooking: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

function getToday() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function getValidDealerCode() {
  const params = new URLSearchParams(window.location.search);
  const dealerCode = (params.get('dealer') || '').trim().toUpperCase();
  return DEALER_PATTERN.test(dealerCode) ? dealerCode : null;
}

function PopupShell({
  isOpen,
  onClose,
  dialogLabel,
  closeLabel,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  dialogLabel: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      window.removeEventListener('keydown', onKeyDown);

      const focusTarget = previouslyFocusedElementRef.current;
      previouslyFocusedElementRef.current = null;
      if (focusTarget?.isConnected) {
        window.requestAnimationFrame(() => focusTarget.focus());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-end justify-center bg-espresso/65 p-3 sm:items-center sm:p-6" role="presentation" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={dialogLabel}
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto border border-beige/60 bg-ivory p-5 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-8"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex justify-end">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex size-11 items-center justify-center border border-beige/70 text-espresso transition-colors hover:border-burgundy hover:bg-burgundy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
            aria-label={closeLabel}
          >
            <HiX size={22} aria-hidden="true" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function BookingPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { language, t } = useLanguage();
  const [form, setForm] = useState<AppointmentForm>(createEmptyAppointmentForm);
  const [message, setMessage] = useState<'idle' | 'success' | 'error' | 'required'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const close = useCallback(() => {
    clearCloseTimer();
    setMessage('idle');
    setForm(createEmptyAppointmentForm());
    onClose();
  }, [clearCloseTimer, onClose]);

  const scheduleCloseAfterSuccess = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      close();
    }, SUCCESS_CLOSE_DELAY_MS);
  }, [clearCloseTimer, close]);

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!hasRequiredAppointmentFields(form)) {
      setMessage('required');
      return;
    }

    setIsSubmitting(true);
    setMessage('idle');

    const body = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      bookingDate: form.bookingDate,
      bookingTime: form.bookingTime,
      service: form.service,
      note: form.note.trim(),
      language,
      sourcePage: window.location.href,
    };

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result: unknown = await response.json().catch(() => null);

      if (!response.ok || !isSuccessfulResponse(result)) {
        throw new Error('Booking submission failed');
      }

      setMessage('success');
      scheduleCloseAfterSuccess();
    } catch {
      setMessage('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PopupShell isOpen={isOpen} onClose={close} dialogLabel={t.bookingPopup.dialogLabel} closeLabel={t.bookingPopup.close}>
      <p className="section-label">{t.booking.eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl leading-tight text-charcoal sm:text-4xl">{t.bookingPopup.title}</h2>
      <p className="mt-3 font-body leading-relaxed text-charcoal/65">{t.bookingPopup.description}</p>

      <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
        <AppointmentFields form={form} setForm={setForm} />

        <FormMessage message={message} messages={t.bookingPopup} />
        <button type="submit" className="btn-primary w-full border-0 px-5 py-3.5" disabled={isSubmitting || message === 'success'}>
          {isSubmitting ? t.bookingPopup.submitting : t.bookingPopup.submit}
        </button>
      </form>
    </PopupShell>
  );
}

function AppointmentFields({
  form,
  setForm,
}: {
  form: AppointmentForm;
  setForm: Dispatch<SetStateAction<AppointmentForm>>;
}) {
  const { t } = useLanguage();

  return (
    <>
      <FormField label={t.bookingPopup.fullName} required>
        <input
          name="fullName"
          value={form.fullName}
          onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
          autoComplete="name"
          className={inputClassName}
          required
        />
      </FormField>
      <FormField label={t.bookingPopup.phone} required>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          value={form.phone}
          onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          autoComplete="tel"
          className={inputClassName}
          required
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t.bookingPopup.bookingDate} required>
          <input
            name="bookingDate"
            type="date"
            min={getToday()}
            value={form.bookingDate}
            onChange={(event) => setForm((current) => ({ ...current, bookingDate: event.target.value }))}
            className={inputClassName}
            required
          />
        </FormField>
        <FormField label={t.bookingPopup.bookingTime} required>
          <input
            name="bookingTime"
            type="time"
            value={form.bookingTime}
            onChange={(event) => setForm((current) => ({ ...current, bookingTime: event.target.value }))}
            className={inputClassName}
            required
          />
        </FormField>
      </div>
      <FormField label={t.bookingPopup.service} required>
        <select
          name="service"
          value={form.service}
          onChange={(event) => setForm((current) => ({ ...current, service: event.target.value }))}
          className={inputClassName}
          required
        >
          <option value="">{t.bookingPopup.servicePlaceholder}</option>
          {bookingServices.map((service) => (
            <option key={service.value} value={service.value}>{t.bookingPopup.services[service.key]}</option>
          ))}
        </select>
      </FormField>
      <FormField label={t.bookingPopup.note}>
        <textarea
          name="note"
          value={form.note}
          onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
          rows={3}
          className={`${inputClassName} resize-y`}
        />
      </FormField>
    </>
  );
}

function DealerLeadPopup({ dealerCode, isOpen, onClose }: { dealerCode: string | null; isOpen: boolean; onClose: () => void }) {
  const { language, t } = useLanguage();
  const [form, setForm] = useState<AppointmentForm>(createEmptyAppointmentForm);
  const [message, setMessage] = useState<'idle' | 'success' | 'error' | 'required'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const close = useCallback(() => {
    clearCloseTimer();
    setMessage('idle');
    setForm(createEmptyAppointmentForm());
    onClose();
  }, [clearCloseTimer, onClose]);

  const scheduleCloseAfterSuccess = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      close();
    }, SUCCESS_CLOSE_DELAY_MS);
  }, [clearCloseTimer, close]);

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!dealerCode || !hasRequiredAppointmentFields(form)) {
      setMessage('required');
      return;
    }

    setIsSubmitting(true);
    setMessage('idle');

    const body = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      bookingDate: form.bookingDate,
      bookingTime: form.bookingTime,
      service: form.service,
      note: form.note.trim(),
      dealerCode,
      language,
      sourcePage: window.location.href,
    };

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result: unknown = await response.json().catch(() => null);

      if (!response.ok || !isSuccessfulResponse(result)) {
        throw new Error('Dealer lead submission failed');
      }

      window.sessionStorage.setItem(`${DEALER_SUBMISSION_KEY}${dealerCode}`, 'true');
      setMessage('success');
      scheduleCloseAfterSuccess();
    } catch {
      setMessage('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PopupShell isOpen={isOpen} onClose={close} dialogLabel={t.dealerLead.dialogLabel} closeLabel={t.dealerLead.close}>
      <p className="section-label">LELE HAIR DESIGN</p>
      <h2 className="mt-3 font-display text-3xl leading-tight text-charcoal sm:text-4xl">{t.dealerLead.title}</h2>
      <p className="mt-3 font-body leading-relaxed text-charcoal/65">{t.dealerLead.description}</p>

      <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
        <AppointmentFields form={form} setForm={setForm} />

        <FormMessage message={message} messages={t.dealerLead} />
        <button type="submit" className="btn-primary w-full border-0 px-5 py-3.5" disabled={isSubmitting || message === 'success'}>
          {isSubmitting ? t.dealerLead.submitting : t.dealerLead.submit}
        </button>
      </form>
    </PopupShell>
  );
}

const inputClassName = 'mt-2 w-full border border-beige/70 bg-white px-3 py-3 font-body text-base text-charcoal outline-none transition-colors focus:border-burgundy focus:ring-1 focus:ring-burgundy';

function FormField({ label, required = false, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block font-body text-sm font-medium text-charcoal">
      {label}{required ? <span className="ml-1 text-burgundy" aria-hidden="true">*</span> : null}
      {children}
    </label>
  );
}

function FormMessage({
  message,
  messages,
}: {
  message: 'idle' | 'success' | 'error' | 'required';
  messages: { success: string; error: string; required: string };
}) {
  if (message === 'idle') return null;

  const isSuccess = message === 'success';
  const text = isSuccess ? messages.success : message === 'required' ? messages.required : messages.error;

  return <p role={isSuccess ? 'status' : 'alert'} className={`font-body text-sm ${isSuccess ? 'text-green-800' : 'text-burgundy'}`}>{text}</p>;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [dealerCode, setDealerCode] = useState<string | null>(null);
  const [isLeadOpen, setIsLeadOpen] = useState(false);

  useEffect(() => {
    let popupTimer: number | null = null;

    const clearPopupTimer = () => {
      if (popupTimer !== null) {
        window.clearTimeout(popupTimer);
        popupTimer = null;
      }
    };

    const syncDealerPopup = () => {
      clearPopupTimer();
      const validDealerCode = getValidDealerCode();
      setDealerCode(validDealerCode);
      setIsLeadOpen(false);

      if (!validDealerCode || window.sessionStorage.getItem(`${DEALER_SUBMISSION_KEY}${validDealerCode}`)) return;

      popupTimer = window.setTimeout(() => {
        popupTimer = null;

        if (
          getValidDealerCode() === validDealerCode
          && !window.sessionStorage.getItem(`${DEALER_SUBMISSION_KEY}${validDealerCode}`)
        ) {
          setIsLeadOpen(true);
        }
      }, DEALER_POPUP_DELAY_MS);
    };

    const frame = window.requestAnimationFrame(syncDealerPopup);
    window.addEventListener('popstate', syncDealerPopup);

    return () => {
      window.cancelAnimationFrame(frame);
      clearPopupTimer();
      window.removeEventListener('popstate', syncDealerPopup);
    };
  }, []);

  const openBooking = useCallback(() => setIsBookingOpen(true), []);

  return (
    <BookingContext.Provider value={{ openBooking }}>
      {children}
      <BookingPopup isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      <DealerLeadPopup dealerCode={dealerCode} isOpen={isLeadOpen} onClose={() => setIsLeadOpen(false)} />
    </BookingContext.Provider>
  );
}

export function BookingTrigger({ children, onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error('BookingTrigger must be used within BookingProvider.');
  }

  return (
    <button
      {...props}
      type="button"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.openBooking();
      }}
    >
      {children}
    </button>
  );
}
