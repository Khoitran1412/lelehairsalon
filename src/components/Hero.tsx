'use client';

import Image from 'next/image';
import { HiChevronDown } from 'react-icons/hi';
import { useLanguage } from '@/i18n/useLanguage';
import { BookingTrigger } from './BookingProvider';
import ScrollReveal from './ScrollReveal';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] scroll-mt-20 items-center justify-center overflow-hidden"
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0">
        <Image
          src="/images/hero/lele-hero-salon.png"
          alt="LeLe Hair Design salon interior in Hanoi"
          fill
          preload
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(35, 26, 23, 0.52) 0%, rgba(35, 26, 23, 0.25) 35%, rgba(35, 26, 23, 0.05) 65%, rgba(35, 26, 23, 0) 100%)' }}
        />
      </div>

      <div className="container-custom relative z-10 py-28 text-left md:py-32">
        <ScrollReveal>
          <p className="mb-6 font-body text-xs uppercase tracking-[0.35em] text-white/85 md:mb-8 md:text-sm">
            {t.hero.eyebrow}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={1}>
          <h1 id="hero-title" className="mb-8 whitespace-pre-line font-display text-hero text-white text-balance md:mb-10">
            {t.hero.heading}
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={2}>
          <p className="mb-11 max-w-xl font-body text-hero-sub leading-relaxed text-white/85 text-balance md:mb-14">
            {t.hero.description}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={3}>
          <div className="mb-10 flex flex-col items-start justify-start gap-4 sm:flex-row sm:items-center md:mb-12">
            <BookingTrigger className="btn-primary border-0 px-10 py-4 text-base">
              {t.common.bookAppointment}
            </BookingTrigger>
            <a href="#about" className="btn-outline border-white/75 px-10 py-4 text-base text-white hover:border-white hover:bg-white/10 hover:text-white">
              {t.common.discover}
            </a>
          </div>
        </ScrollReveal>

      </div>

      <a href="#about" aria-label={t.hero.discoverLabel} className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 animate-bounce text-white/40 md:block">
        <HiChevronDown size={28} />
      </a>
    </section>
  );
}
