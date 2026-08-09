'use client';

import Image from 'next/image';
import { useLanguage } from '@/i18n/useLanguage';
import ScrollReveal from './ScrollReveal';

export default function BrandIntro() {
  const { t } = useLanguage();

  return (
    <section id="about" className="section-padding scroll-mt-24 bg-white" aria-labelledby="about-title">
      <div className="container-custom">
        <div className="grid items-center gap-12 lg:grid-cols-[1.35fr_0.9fr] lg:gap-20">
          <ScrollReveal className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/5] overflow-hidden bg-beige/20">
              <Image
                src="/images/about/lele-about.jpg"
                alt={t.about.imageAlt}
                fill
                sizes="(max-width: 1023px) 100vw, 45vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-charcoal/5" />
            </div>
          </ScrollReveal>

          <div className="order-1 max-w-xl lg:order-2">
            <ScrollReveal>
              <p className="section-label">{t.about.eyebrow}</p>
              <h2 id="about-title" className="section-heading mb-8">
                {t.about.heading}
              </h2>
            </ScrollReveal>
            <div className="space-y-5">
              {t.about.paragraphs.map((paragraph, index) => (
                <ScrollReveal key={paragraph} delay={index + 1}>
                  <p className="font-body leading-relaxed text-charcoal/70 text-balance">{paragraph}</p>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal delay={4}>
              <p className="mt-8 border-l-2 border-burgundy pl-5 font-body text-xs uppercase tracking-[0.24em] text-burgundy">
                {t.about.label}
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
