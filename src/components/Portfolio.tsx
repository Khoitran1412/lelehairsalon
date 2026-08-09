'use client';

import Image from 'next/image';
import { useState } from 'react';
import { HiArrowRight, HiChevronLeft, HiChevronRight, HiX } from 'react-icons/hi';
import siteContent, { type PortfolioItem } from '@/data/content';
import { useLanguage } from '@/i18n/useLanguage';
import BackToHome from './BackToHome';
import ScrollReveal from './ScrollReveal';

const portfolioFilters = ['all', 'LAYER', 'BOB', 'CURL', 'COLOR', 'WOLFCUT', 'TRANSFORMATION'] as const;

export default function Portfolio() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<(typeof portfolioFilters)[number]>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredPortfolio = activeFilter === 'all'
    ? siteContent.portfolio
    : siteContent.portfolio.filter((item) => item.categories.includes(activeFilter));
  const lightboxItem: PortfolioItem | null = lightboxIndex === null ? null : filteredPortfolio[lightboxIndex] ?? null;
  const getImageAlt = (item: PortfolioItem) =>
    t.portfolio.imageAlts[item.id as keyof typeof t.portfolio.imageAlts] ?? item.imageAlt;
  const getTitle = (item: PortfolioItem) =>
    t.portfolio.titles[item.id as keyof typeof t.portfolio.titles] ?? item.title;

  const closeLightbox = () => setLightboxIndex(null);
  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (lightboxIndex === null) return;
    const nextIndex = direction === 'prev'
      ? (lightboxIndex - 1 + filteredPortfolio.length) % filteredPortfolio.length
      : (lightboxIndex + 1) % filteredPortfolio.length;
    setLightboxIndex(nextIndex);
  };

  return (
    <section className="section-padding bg-ivory" aria-labelledby="portfolio-title">
      <div className="container-custom">
        <div className="mb-12 text-center md:mb-16">
          <ScrollReveal>
            <p className="section-label">{t.portfolio.eyebrow}</p>
            <h1 id="portfolio-title" className="section-heading mb-5">{t.portfolio.heading}</h1>
            <p className="mx-auto mt-5 max-w-2xl font-body leading-relaxed text-charcoal/60">
              {t.portfolio.description}
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <div className="mb-10 text-center md:mb-12">
            <BackToHome />
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="-mx-4 mb-10 overflow-x-auto px-4 pb-2 md:mb-12" role="tablist" aria-label={t.portfolio.filterLabel}>
            <div className="flex min-w-max justify-start gap-2 md:justify-center">
              {portfolioFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-2 font-body text-sm transition-all duration-300 ${
                    activeFilter === filter
                      ? 'bg-burgundy text-white'
                      : 'bg-cream text-muted hover:text-burgundy'
                  }`}
                >
                  {t.portfolio.filters[filter]}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {filteredPortfolio.map((item, index) => (
            <ScrollReveal key={item.id} delay={(index % 2 === 0 ? 1 : 2) as 1 | 2}>
              <button
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="group relative w-full overflow-hidden text-left"
                aria-label={`${t.portfolio.openImage}: ${getTitle(item)}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-beige/20">
                  <Image
                    src={item.image}
                    alt={getImageAlt(item)}
                    fill
                    sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent p-4 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
                  <div className="flex w-full items-end justify-between gap-3">
                    <div>
                    <p className="font-display text-sm text-white md:text-base">{getTitle(item)}</p>
                    <p className="mt-1 font-body text-[0.6rem] uppercase tracking-[0.14em] text-white/65">{item.categories.join(' · ')}</p>
                    </div>
                    <HiArrowRight className="mb-1 shrink-0 text-white" size={18} aria-hidden="true" />
                  </div>
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>

      </div>

      {lightboxItem && lightboxIndex !== null && (
        <div className="lightbox-overlay" role="dialog" aria-modal="true" aria-label={`${t.portfolio.dialogLabel}: ${getTitle(lightboxItem)}`} onClick={closeLightbox}>
          <button type="button" onClick={closeLightbox} className="absolute right-4 top-4 z-10 p-2 text-white/80 hover:text-white" aria-label={t.portfolio.close}>
            <HiX size={32} />
          </button>
          <button type="button" onClick={(event) => { event.stopPropagation(); navigateLightbox('prev'); }} className="absolute left-2 top-1/2 z-10 -translate-y-1/2 p-2 text-white/80 hover:text-white md:left-4" aria-label={t.portfolio.previous}>
            <HiChevronLeft size={40} />
          </button>
          <button type="button" onClick={(event) => { event.stopPropagation(); navigateLightbox('next'); }} className="absolute right-2 top-1/2 z-10 -translate-y-1/2 p-2 text-white/80 hover:text-white md:right-4" aria-label={t.portfolio.next}>
            <HiChevronRight size={40} />
          </button>
          <div className="relative aspect-[4/3] max-h-[82vh] w-[min(78vw,56rem)] overflow-hidden" onClick={(event) => event.stopPropagation()}>
            <Image
              src={lightboxItem.image}
              alt={getImageAlt(lightboxItem)}
              fill
              sizes="78vw"
              className="object-contain"
            />
          </div>
          <p className="absolute bottom-5 text-center font-body text-xs uppercase tracking-[0.16em] text-white/65">
            {getTitle(lightboxItem)} · {lightboxIndex + 1} / {filteredPortfolio.length}
          </p>
        </div>
      )}
    </section>
  );
}
