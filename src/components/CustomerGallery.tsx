'use client';

import Image from 'next/image';
import siteContent from '@/data/content';
import { useLanguage } from '@/i18n/useLanguage';
import ScrollReveal from './ScrollReveal';

const desktopLayout = [
  'lg:col-span-7',
  'lg:col-span-5',
  'lg:col-span-5',
  'lg:col-span-7',
] as const;

export default function CustomerGallery() {
  const { language, t } = useLanguage();

  return (
    <section
      id="customers"
      className="scroll-mt-[90px] bg-ivory pt-16 pb-32 md:pt-24 md:pb-40 lg:pt-28"
      aria-labelledby="customer-gallery-title"
    >
      <div className="mx-auto max-w-[1440px] px-5 md:px-8 xl:px-12">
        <div className="max-w-2xl">
          <ScrollReveal>
            <p className="section-label">{t.customerGallery.eyebrow}</p>
            <h2 id="customer-gallery-title" className="section-heading">
              {t.customerGallery.heading}
            </h2>
            <p className="mt-5 max-w-xl font-body leading-relaxed text-muted">
              {t.customerGallery.description}
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={1} className="mt-10 md:mt-14">
          <div className="scrollbar-hidden overflow-x-auto overscroll-x-contain md:overflow-visible">
            <div className="flex w-max snap-x snap-mandatory gap-4 pr-5 md:grid md:w-auto md:grid-cols-2 md:gap-6 md:pr-0 lg:grid-cols-12 lg:gap-8">
              {siteContent.customerGallery.map((item, index) => (
                <figure
                  key={item.id}
                  className={`group w-[86vw] shrink-0 snap-start scroll-mb-24 border border-burgundy/15 bg-white md:w-auto md:shrink ${desktopLayout[index % desktopLayout.length]}`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.alt[language]}
                      fill
                      sizes="(max-width: 767px) 86vw, (max-width: 1023px) 50vw, (max-width: 1439px) 60vw, 780px"
                      className="object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-[1.02] motion-reduce:transition-none"
                    />
                    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-espresso/45 to-transparent opacity-70 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100" />
                    <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
                      <p className="font-body text-[0.6rem] uppercase tracking-[0.2em] text-beige">{t.customerGallery.eyebrow}</p>
                      <p className="mt-2 font-display text-2xl leading-none">{item.title[language]}</p>
                    </figcaption>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={2} className="mt-9 md:mt-12">
          <a
            href={siteContent.contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex font-body text-xs font-medium tracking-[0.14em] text-burgundy transition-colors hover:text-espresso"
          >
            {t.customerGallery.instagramCta}
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
