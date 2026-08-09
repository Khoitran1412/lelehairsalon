'use client';

import { HiPhone } from 'react-icons/hi';
import siteContent from '@/data/content';
import { useLanguage } from '@/i18n/useLanguage';
import { BookingTrigger } from './BookingProvider';
import ScrollReveal from './ScrollReveal';

export default function BookingSection() {
  const { t } = useLanguage();

  return (
    <section id="booking" className="section-padding scroll-mt-20 bg-burgundy text-white" aria-labelledby="booking-title">
      <div className="container-custom max-w-4xl text-center">
        <ScrollReveal>
          <p className="section-label text-stone">{t.booking.eyebrow}</p>
          <h2 id="booking-title" className="font-display text-section-title leading-[1.2] text-white">{t.booking.heading}</h2>
          <p className="mx-auto mt-6 max-w-2xl font-body leading-relaxed text-white/78">
            {t.booking.description}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={1}>
          <div className="mx-auto mt-10 flex max-w-xl flex-col justify-center gap-4 sm:flex-row">
            <BookingTrigger
              className="btn-light gap-2 border-0 px-8 text-burgundy"
            >
              {t.booking.instagram}
            </BookingTrigger>
            <a href={siteContent.contact.phoneHref} className="btn-outline gap-2 border-white/55 px-8 text-white hover:border-white hover:bg-white hover:text-espresso">
              <HiPhone size={17} /> {t.booking.call} {siteContent.contact.phone}
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
