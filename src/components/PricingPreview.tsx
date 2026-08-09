'use client';

import Link from 'next/link';
import { useLanguage } from '@/i18n/useLanguage';
import ScrollReveal from './ScrollReveal';

export default function PricingPreview() {
  const { t } = useLanguage();

  return (
    <section id="pricing" className="section-padding bg-cream" aria-labelledby="pricing-preview-title">
      <div className="container-custom">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <ScrollReveal>
            <p className="section-label pricing-eyebrow">{t.pricingPreview.eyebrow}</p>
            <h2 id="pricing-preview-title" className="section-heading pricing-title">{t.pricingPreview.heading}</h2>
            <Link href="/bang-gia" className="btn-primary mt-8">
              {t.pricingPreview.cta}
            </Link>
          </ScrollReveal>
          <dl className="divide-y divide-burgundy/15 border-y border-burgundy/15">
            {t.pricingPreview.rows.map(([label, price], index) => (
              <ScrollReveal key={label} delay={((index % 3) + 1) as 1 | 2 | 3}>
                <div className="flex items-baseline justify-between gap-5 py-5">
                  <dt className="pricing-service-name text-sm text-charcoal/65 md:text-base">{label}</dt>
                  <dd className="pricing-price shrink-0 text-xl text-charcoal md:text-2xl">{price}</dd>
                </div>
              </ScrollReveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
