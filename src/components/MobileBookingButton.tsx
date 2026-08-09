'use client';

import { HiCalendar } from 'react-icons/hi';
import { useLanguage } from '@/i18n/useLanguage';
import { BookingTrigger } from './BookingProvider';
import { useMobileMenu } from './MobileMenuProvider';

export default function MobileBookingButton() {
  const { t } = useLanguage();
  const { isMobileMenuOpen } = useMobileMenu();

  if (isMobileMenuOpen) return null;

  return (
    <>
      <BookingTrigger
        className="fixed bottom-6 right-6 z-40 hidden items-center justify-center gap-2 bg-burgundy px-5 py-3 font-body text-xs font-medium tracking-[0.1em] text-white shadow-lg transition-colors hover:bg-burgundy-deep lg:inline-flex"
      >
        <HiCalendar size={17} /> {t.common.bookNow}
      </BookingTrigger>
      <BookingTrigger
        className="booking-bar-shadow fixed inset-x-0 bottom-0 z-40 flex h-[calc(3.5rem+env(safe-area-inset-bottom))] items-center justify-center gap-2 bg-burgundy px-5 pb-[env(safe-area-inset-bottom)] font-body text-sm font-medium tracking-[0.08em] text-white transition-colors hover:bg-burgundy-deep lg:hidden"
      >
        <HiCalendar size={18} /> {t.common.bookNow}
      </BookingTrigger>
    </>
  );
}
