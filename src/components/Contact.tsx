'use client';

import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { HiArrowRight, HiClock, HiLocationMarker, HiPhone } from 'react-icons/hi';
import siteContent from '@/data/content';
import { useLanguage } from '@/i18n/useLanguage';
import { BookingTrigger } from './BookingProvider';
import ScrollReveal from './ScrollReveal';

export default function Contact() {
  const { language, t } = useLanguage();

  return (
    <section id="contact" className="section-padding scroll-mt-20 bg-cream" aria-labelledby="contact-title">
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <ScrollReveal>
            <p className="section-label">{t.contact.eyebrow}</p>
            <h2 id="contact-title" className="font-display text-section-title leading-[1.15] text-charcoal">{t.contact.heading}</h2>
            <p className="mt-6 max-w-md font-body leading-relaxed text-charcoal/65">
              {t.contact.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <BookingTrigger className="btn-primary">{t.common.bookConsultation}</BookingTrigger>
              <a href={siteContent.contact.phoneHref} className="btn-outline bg-white">{t.common.callNow}</a>
            </div>
          </ScrollReveal>

          <dl className="border-y border-beige/45">
            <ScrollReveal delay={1}>
              <div className="flex gap-4 border-b border-beige/45 py-6">
                <HiLocationMarker className="mt-1 shrink-0 text-burgundy" size={20} />
                <div>
                  <dt className="font-body text-[0.65rem] uppercase tracking-[0.18em] text-charcoal/45">{t.contact.addressLabel}</dt>
                  <dd className="mt-2 font-display text-xl leading-snug text-charcoal">{siteContent.contact.address[language]}</dd>
                  <a href={siteContent.contact.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.13em] text-burgundy transition-colors hover:text-espresso">
                    {t.common.directions} <HiArrowRight size={15} />
                  </a>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={2}>
              <div className="flex gap-4 border-b border-beige/45 py-6">
                <HiPhone className="mt-1 shrink-0 text-burgundy" size={20} />
                <div>
                  <dt className="font-body text-[0.65rem] uppercase tracking-[0.18em] text-charcoal/45">{t.contact.phoneLabel}</dt>
                  <dd className="mt-2 font-display text-xl leading-snug text-charcoal"><a href={siteContent.contact.phoneHref}>{siteContent.contact.phone}</a></dd>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={3}>
              <div className="flex gap-4 border-b border-beige/45 py-6">
                <HiClock className="mt-1 shrink-0 text-burgundy" size={20} />
                <div>
                  <dt className="font-body text-[0.65rem] uppercase tracking-[0.18em] text-charcoal/45">{t.contact.hoursLabel}</dt>
                  <dd className="mt-2 font-display text-xl leading-snug text-charcoal">{siteContent.contact.hours}</dd>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={4}>
              <div className="flex gap-4 border-b border-beige/45 py-6">
                <FaInstagram className="mt-1 shrink-0 text-burgundy" size={16} />
                <div>
                  <dt className="font-body text-[0.65rem] uppercase tracking-[0.18em] text-charcoal/45">{t.contact.instagramLabel}</dt>
                  <dd className="mt-2"><a href={siteContent.contact.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="LeLe Hair Design Instagram" className="font-body text-sm text-charcoal transition-colors hover:text-burgundy">{t.contact.instagramName}</a></dd>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={5}>
              <div className="flex gap-4 py-6">
                <FaFacebookF className="mt-1 shrink-0 text-burgundy" size={16} />
                <div>
                  <dt className="font-body text-[0.65rem] uppercase tracking-[0.18em] text-charcoal/45">{t.contact.facebookLabel}</dt>
                  <dd className="mt-2"><a href={siteContent.contact.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="LeLe Hair Design Facebook" className="font-body text-sm text-charcoal transition-colors hover:text-burgundy">{t.contact.facebookName}</a></dd>
                </div>
              </div>
            </ScrollReveal>
          </dl>
        </div>
      </div>
    </section>
  );
}
