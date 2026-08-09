'use client';

import {
  bleachingPricing,
  chemicalPricing,
  haircutPricing,
  hairSizes,
  otherServicesPricing,
  recoveryPricing,
  technicalColorPricing,
  type HairSize,
} from '@/data/pricing';
import { useLanguage } from '@/i18n/useLanguage';
import ScrollReveal from './ScrollReveal';

type SizePrices = Record<HairSize, string>;

function SizePriceGrid({ prices }: { prices: SizePrices }) {
  return (
    <dl className="mt-6 grid grid-cols-4 border-t border-burgundy/15">
      {hairSizes.map(({ size }) => (
        <div key={size} className="border-r border-burgundy/15 px-2 py-4 text-center last:border-r-0 sm:px-3">
          <dt className="font-body text-[0.62rem] uppercase tracking-[0.16em] text-charcoal/45">{size}</dt>
          <dd className="pricing-price mt-2 text-sm text-charcoal sm:text-base">{prices[size]}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Pricing() {
  const { t } = useLanguage();

  return (
    <section id="pricing" className="section-padding scroll-mt-20 bg-cream" aria-labelledby="pricing-title">
      <div className="container-custom">
        <div className="mb-12 text-center md:mb-16">
          <ScrollReveal>
            <p className="section-label pricing-eyebrow">{t.pricing.eyebrow}</p>
            <h2 id="pricing-title" className="section-heading pricing-title mb-6">{t.pricing.heading}</h2>
            <p className="mx-auto max-w-2xl font-body leading-relaxed text-charcoal/60">
              {t.pricing.description}
            </p>
            <p className="mt-5 font-body text-xs uppercase tracking-[0.12em] text-burgundy">
              {t.pricing.guide}
            </p>
          </ScrollReveal>
        </div>

        <div className="space-y-14 md:space-y-20">
          <section aria-labelledby="haircut-pricing-title">
            <ScrollReveal>
              <div className="mb-7 flex flex-col gap-2 border-b border-burgundy/15 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <h3 id="haircut-pricing-title" className="font-display text-2xl text-charcoal md:text-3xl">{t.pricing.haircut.title}</h3>
                <p className="font-body text-sm text-burgundy">{t.pricing.haircut.note}</p>
              </div>
            </ScrollReveal>
            <div className="grid gap-4 md:grid-cols-3">
              {haircutPricing.services.map((service, index) => (
                <ScrollReveal key={service.name} delay={((index % 3) + 1) as 1 | 2 | 3}>
                  <article className="flex h-full flex-col justify-between border border-burgundy/15 bg-ivory p-6 md:p-7">
                    <div>
                      <h4 className="pricing-service-name text-sm tracking-[0.05em] text-charcoal">{t.pricing.haircut.services[index]?.[0] ?? service.name}</h4>
                      {(t.pricing.haircut.services[index]?.[1] ?? service.description) && <p className="mt-3 font-body text-sm text-charcoal/55">{t.pricing.haircut.services[index]?.[1] ?? service.description}</p>}
                    </div>
                    <p className="pricing-price mt-8 text-3xl text-charcoal">{service.price}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </section>

          <section aria-labelledby="chemical-pricing-title">
            <ScrollReveal>
              <div className="mb-7 border-b border-burgundy/15 pb-5">
                <h3 id="chemical-pricing-title" className="font-display text-2xl text-charcoal md:text-3xl">{t.pricing.chemical.title}</h3>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <div className="overflow-x-auto border border-burgundy/15 bg-ivory">
                <table className="min-w-[620px] w-full border-collapse text-left">
                  <thead className="border-b border-burgundy/15">
                    <tr>
                      <th scope="col" className="px-6 py-4 font-body text-[0.65rem] uppercase tracking-[0.16em] text-charcoal/45">{t.pricing.chemical.serviceType}</th>
                      {chemicalPricing.sizes.map((size) => (
                        <th key={size} scope="col" className="px-4 py-4 text-center font-body text-[0.65rem] uppercase tracking-[0.16em] text-charcoal/45">{size}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chemicalPricing.rows.map((row, index) => (
                      <tr key={row.name} className="border-b border-burgundy/12 last:border-b-0">
                        <th scope="row" className="pricing-service-name px-6 py-5 text-sm tracking-[0.05em] text-charcoal">{t.pricing.chemical.rows[index] ?? row.name}</th>
                        {chemicalPricing.sizes.map((size) => (
                          <td key={size} className="pricing-price px-4 py-5 text-center text-lg text-charcoal">{row.prices[size]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 font-body text-sm text-burgundy">{t.pricing.chemical.note}</p>
            </ScrollReveal>
          </section>

          <section aria-labelledby="recovery-pricing-title">
            <ScrollReveal>
              <div className="mb-7 border-b border-burgundy/15 pb-5">
                <h3 id="recovery-pricing-title" className="font-display text-2xl text-charcoal md:text-3xl">{t.pricing.recovery.title}</h3>
              </div>
            </ScrollReveal>
            <div className="grid gap-5 md:grid-cols-2">
              {recoveryPricing.map((service, index) => (
                <ScrollReveal key={service.name} delay={((index % 2) + 1) as 1 | 2}>
                  <article className="h-full border border-burgundy/15 bg-white p-6 md:p-7">
                    <h4 className="pricing-service-name text-sm tracking-[0.06em] text-charcoal">{service.name}</h4>
                    {(t.pricing.recovery.subtitles[index] ?? service.subtitle) && <p className="mt-2 font-body text-sm text-charcoal/55">{t.pricing.recovery.subtitles[index] ?? service.subtitle}</p>}
                    <SizePriceGrid prices={service.prices} />
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </section>

          <div className="grid gap-14 md:grid-cols-2 md:gap-8">
            <section aria-labelledby="technical-color-pricing-title">
              <ScrollReveal>
                <div className="mb-7 border-b border-burgundy/15 pb-5">
                  <h3 id="technical-color-pricing-title" className="font-display text-2xl text-charcoal md:text-3xl">{t.pricing.technical.title}</h3>
                </div>
              </ScrollReveal>
              <div className="divide-y divide-burgundy/15 border-y border-burgundy/15">
                {technicalColorPricing.map((service, index) => (
                  <ScrollReveal key={service.name} delay={((index % 3) + 1) as 1 | 2 | 3}>
                    <article className="flex items-end justify-between gap-5 py-5">
                      <div>
                        <h4 className="pricing-service-name text-sm tracking-[0.05em] text-charcoal">{service.name}</h4>
                        {(t.pricing.technical.subtitles[index] ?? service.subtitle) && <p className="mt-2 font-body text-sm text-charcoal/55">{t.pricing.technical.subtitles[index] ?? service.subtitle}</p>}
                      </div>
                      <p className="pricing-price shrink-0 text-lg text-charcoal">{service.price}</p>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            </section>

            <section aria-labelledby="bleaching-pricing-title">
              <ScrollReveal>
                <div className="mb-7 border-b border-burgundy/15 pb-5">
                  <h3 id="bleaching-pricing-title" className="font-display text-2xl text-charcoal md:text-3xl">{t.pricing.bleaching.title}</h3>
                </div>
              </ScrollReveal>
              <div className="space-y-5">
                {bleachingPricing.sizedServices.map((service, index) => (
                  <ScrollReveal key={service.name} delay={((index % 2) + 1) as 1 | 2}>
                    <article className="border border-burgundy/15 bg-ivory p-6">
                      <h4 className="pricing-service-name text-sm tracking-[0.05em] text-charcoal">{t.pricing.bleaching.services[index] ?? service.name}</h4>
                      <SizePriceGrid prices={service.prices} />
                    </article>
                  </ScrollReveal>
                ))}
                <ScrollReveal delay={3}>
                  <article className="border border-burgundy/15 bg-white p-6">
                    <h4 className="pricing-service-name text-sm tracking-[0.05em] text-charcoal">{t.pricing.bleaching.roots}</h4>
                    <dl className="mt-5 space-y-3">
                      {bleachingPricing.rootBleaching.map((item, index) => (
                        <div key={item.label} className="flex items-baseline justify-between gap-4 border-b border-burgundy/12 pb-3 last:border-b-0 last:pb-0">
                          <dt className="font-body text-sm text-charcoal/60">{t.pricing.bleaching.rootItems[index] ?? item.label}</dt>
                          <dd className="pricing-price shrink-0 text-lg text-charcoal">{item.price}</dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                </ScrollReveal>
              </div>
            </section>
          </div>

          <section aria-labelledby="other-pricing-title">
            <ScrollReveal>
              <div className="mb-7 border-b border-burgundy/15 pb-5">
                <h3 id="other-pricing-title" className="font-display text-2xl text-charcoal md:text-3xl">{t.pricing.other.title}</h3>
              </div>
            </ScrollReveal>
            <div className="grid border-l border-t border-burgundy/15 sm:grid-cols-2 lg:grid-cols-3">
              {otherServicesPricing.map((service, index) => (
                <ScrollReveal key={service.name} delay={((index % 3) + 1) as 1 | 2 | 3}>
                  <article className="flex min-h-32 flex-col justify-between border-b border-r border-burgundy/15 bg-white p-5">
                    <div>
                      <h4 className="pricing-service-name text-sm tracking-[0.05em] text-charcoal">{t.pricing.other.services[index] ?? service.name}</h4>
                      {(t.pricing.other.subtitles[index] ?? service.subtitle) && <p className="mt-2 font-body text-sm text-charcoal/55">{t.pricing.other.subtitles[index] ?? service.subtitle}</p>}
                    </div>
                    <p className="pricing-price mt-5 text-xl text-charcoal">{service.price}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </section>

          <section aria-labelledby="hair-size-title" className="border-t border-burgundy/15 pt-14 md:pt-20">
            <ScrollReveal>
              <div className="text-center">
                <h3 id="hair-size-title" className="font-display text-2xl text-charcoal md:text-3xl">{t.pricing.lengthGuide}</h3>
              </div>
            </ScrollReveal>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {hairSizes.map(({ size, description }, index) => (
                <ScrollReveal key={size} delay={((index % 4) + 1) as 1 | 2 | 3 | 4}>
                  <article className="relative min-h-44 overflow-hidden border border-burgundy/15 bg-ivory p-6">
                    <span className="absolute -right-2 -top-7 font-display text-9xl leading-none text-beige/35">{size}</span>
                    <div className="relative">
                      <p className="font-body text-xs uppercase tracking-[0.17em] text-burgundy">SIZE {size}</p>
                      <p className="mt-5 max-w-40 font-display text-xl leading-snug text-charcoal">{t.pricing.sizes[index] ?? description}</p>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
