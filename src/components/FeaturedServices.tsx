'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import siteContent, { type Service, type ServiceCategory } from '@/data/content';
import useHorizontalWheelScroll from '@/hooks/useHorizontalWheelScroll';
import { useLanguage } from '@/i18n/useLanguage';
import { BookingTrigger } from './BookingProvider';
import ScrollReveal from './ScrollReveal';

type ActiveCategory = 'all' | ServiceCategory;

const numberLabel = (value: number) => String(value).padStart(2, '0');
const allServices: readonly Service[] = siteContent.services;

export default function FeaturedServices() {
  const { t } = useLanguage();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>('all');
  const [activeIndex, setActiveIndex] = useState(0);

  const services = useMemo(
    () => activeCategory === 'all'
      ? allServices
      : allServices.filter((service) => service.categories.includes(activeCategory)),
    [activeCategory]
  );
  const hasServices = services.length > 0;

  useHorizontalWheelScroll(viewportRef, [activeCategory]);

  const updateActiveIndex = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const cards = Array.from(viewport.querySelectorAll<HTMLElement>('[data-service-card]'));
    if (!cards.length) return;

    const referencePoint = viewport.scrollLeft + viewport.clientWidth * 0.42;
    const nextIndex = cards.reduce((closestIndex, card, index) => {
      const closestCard = cards[closestIndex];
      const closestDistance = Math.abs(closestCard.offsetLeft + closestCard.offsetWidth / 2 - referencePoint);
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - referencePoint);
      return distance < closestDistance ? index : closestIndex;
    }, 0);

    setActiveIndex((currentIndex) => currentIndex === nextIndex ? currentIndex : nextIndex);
  }, []);

  const scrollToIndex = useCallback((targetIndex: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const cards = Array.from(viewport.querySelectorAll<HTMLElement>('[data-service-card]'));
    const index = Math.min(Math.max(targetIndex, 0), cards.length - 1);
    const targetCard = cards[index];
    if (!targetCard) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    viewport.scrollTo({ left: targetCard.offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.scrollTo({ left: 0, behavior: 'auto' });
    setActiveIndex(0);
  }, [activeCategory]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let frame = 0;
    const requestIndexUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateActiveIndex();
      });
    };

    const observer = new ResizeObserver(requestIndexUpdate);
    observer.observe(viewport);
    viewport.addEventListener('scroll', requestIndexUpdate, { passive: true });
    requestIndexUpdate();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      viewport.removeEventListener('scroll', requestIndexUpdate);
    };
  }, [activeCategory, updateActiveIndex]);

  const handleCarouselKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollToIndex(activeIndex + 1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollToIndex(activeIndex - 1);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      scrollToIndex(0);
    }
    if (event.key === 'End') {
      event.preventDefault();
      scrollToIndex(services.length - 1);
    }
  };

  return (
    <section id="services" className="section-padding scroll-mt-[90px] overflow-hidden bg-ivory" aria-labelledby="services-title">
      <div className="container-custom">
        <div className="mb-10 max-w-4xl md:mb-12">
          <ScrollReveal>
            <p className="section-label">{t.services.eyebrow}</p>
            <h2 id="services-title" className="section-heading mb-6">{t.services.heading}</h2>
            <p className="font-body leading-relaxed text-charcoal/60">
              {t.services.description}
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={1}>
          <div className="scrollbar-hidden -mx-4 mb-8 overflow-x-auto px-4 pb-2 md:mb-10" role="tablist" aria-label={t.services.filterLabel}>
            <div className="flex min-w-max gap-2 lg:flex-wrap">
              {siteContent.serviceFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === filter.id}
                  aria-controls="service-carousel"
                  onClick={() => setActiveCategory(filter.id)}
                  className={`border px-4 py-2.5 font-body text-sm transition-colors ${
                    activeCategory === filter.id
                      ? 'border-burgundy bg-burgundy text-white'
                      : 'border-beige/50 bg-cream text-muted hover:border-burgundy hover:text-espresso'
                  }`}
                >
                  {t.services.categories[filter.id]}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={2}>
          {hasServices ? (
            <div
              id="service-carousel"
              ref={viewportRef}
              tabIndex={0}
              role="region"
              aria-label={t.services.carouselLabel}
              onKeyDown={handleCarouselKeyDown}
              className="scrollbar-hidden -mx-4 overflow-x-auto overscroll-x-contain pb-2 scroll-smooth snap-x snap-mandatory md:mx-0"
            >
              <div className="flex w-max gap-4 pr-10 md:gap-6 md:pr-14">
                {services.map((service, index) => {
                  const imageFirst = index % 2 === 0;
                  const imageAlt = t.services.imageAlts[service.id as keyof typeof t.services.imageAlts] ?? service.imageAlt;
                  const serviceName = t.services.names[service.id as keyof typeof t.services.names] ?? service.name;

                  return (
                    <article
                      key={service.id}
                      data-service-card
                      aria-roledescription="slide"
                      aria-label={`${numberLabel(index + 1)} ${t.services.position} ${numberLabel(services.length)}: ${serviceName}`}
                      className={`flex basis-[86vw] snap-start flex-col overflow-hidden border border-beige/45 ${imageFirst ? 'bg-white' : 'bg-cream'} sm:basis-[82vw] lg:grid lg:min-h-[34rem] lg:basis-[74vw] lg:max-w-[68.75rem] lg:grid-cols-[1.12fr_0.88fr]`}
                    >
                      <div className={`group relative aspect-[4/3] overflow-hidden bg-beige/20 lg:aspect-auto ${imageFirst ? 'lg:order-1' : 'lg:order-2'}`}>
                        <Image
                          src={service.image}
                          alt={imageAlt}
                          fill
                          priority={index === 0}
                          sizes="(max-width: 639px) 86vw, (max-width: 1023px) 82vw, 42vw"
                          className="object-cover object-center transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                        />
                      </div>
                      <div className={`flex min-w-0 flex-1 flex-col p-6 sm:p-8 lg:p-10 ${imageFirst ? 'lg:order-2' : 'lg:order-1'}`}>
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-body text-[0.62rem] uppercase tracking-[0.18em] text-burgundy">{service.categories.map((category) => t.services.categories[category]).join(' · ')}</p>
                          <span className="shrink-0 font-body text-[0.65rem] tracking-[0.13em] text-charcoal/40" aria-hidden="true">
                            {numberLabel(index + 1)} / {numberLabel(services.length)}
                          </span>
                        </div>
                        <h3 className="mt-5 font-body text-2xl font-medium leading-tight text-charcoal sm:text-3xl">{serviceName}</h3>
                        <p className="mt-4 max-w-md font-body text-sm leading-relaxed text-charcoal/65 sm:text-base">{t.services.descriptions[service.id as keyof typeof t.services.descriptions] ?? service.description}</p>
                        <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-beige/35 pt-6">
                          <BookingTrigger className="font-body text-xs uppercase tracking-[0.14em] text-burgundy transition-colors hover:text-espresso">
                            {t.common.consultation}
                          </BookingTrigger>
                          <BookingTrigger className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.14em] text-espresso transition-colors hover:text-burgundy">
                            {t.common.bookAppointment} <HiArrowRight size={15} aria-hidden="true" />
                          </BookingTrigger>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            <div id="service-carousel" role="status" className="border-y border-beige/45 py-10">
              <p className="max-w-xl font-body leading-relaxed text-charcoal/65">
                {t.services.empty}
              </p>
              <BookingTrigger className="mt-5 inline-flex font-body text-xs uppercase tracking-[0.14em] text-burgundy transition-colors hover:text-espresso">
                {t.common.bookConsultation}
              </BookingTrigger>
            </div>
          )}
        </ScrollReveal>

        {hasServices && (
          <div className="mt-7 flex items-center gap-4 md:mt-9">
            <span className="w-7 font-body text-xs tracking-[0.14em] text-charcoal/60">{numberLabel(activeIndex + 1)}</span>
            <div
              className="h-px flex-1 overflow-hidden bg-beige/60"
              role="progressbar"
              aria-label={t.services.progress}
              aria-valuemin={1}
              aria-valuemax={services.length}
              aria-valuenow={activeIndex + 1}
            >
              <div
                className="h-full bg-burgundy transition-[width] duration-300 motion-reduce:transition-none"
                style={{ width: `${((activeIndex + 1) / services.length) * 100}%` }}
              />
            </div>
            <span className="w-7 text-right font-body text-xs tracking-[0.14em] text-charcoal/60">{numberLabel(services.length)}</span>
            <div className="ml-1 hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => scrollToIndex(activeIndex - 1)}
                disabled={activeIndex === 0}
                aria-label={t.services.previous}
                className="inline-flex h-10 w-10 items-center justify-center border border-beige/60 text-espresso transition-colors hover:border-burgundy hover:text-burgundy disabled:cursor-not-allowed disabled:opacity-35"
              >
                <HiArrowLeft size={17} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollToIndex(activeIndex + 1)}
                disabled={activeIndex === services.length - 1}
                aria-label={t.services.next}
                className="inline-flex h-10 w-10 items-center justify-center border border-beige/60 text-espresso transition-colors hover:border-burgundy hover:text-burgundy disabled:cursor-not-allowed disabled:opacity-35"
              >
                <HiArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
