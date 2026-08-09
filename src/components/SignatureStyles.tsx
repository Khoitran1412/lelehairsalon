'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import siteContent from '@/data/content';
import useHorizontalWheelScroll from '@/hooks/useHorizontalWheelScroll';
import { useLanguage } from '@/i18n/useLanguage';
import ScrollReveal from './ScrollReveal';

const numberLabel = (value: number) => String(value).padStart(2, '0');

export default function SignatureStyles() {
  const { t } = useLanguage();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const styles = siteContent.signatureHighlights;

  useHorizontalWheelScroll(viewportRef, [styles.length]);

  const updateActiveIndex = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const cards = Array.from(viewport.querySelectorAll<HTMLElement>('[data-signature-card]'));
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

    const cards = Array.from(viewport.querySelectorAll<HTMLElement>('[data-signature-card]'));
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
  }, [updateActiveIndex]);

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
      scrollToIndex(styles.length - 1);
    }
  };

  return (
    <section id="signature" className="section-padding scroll-mt-20 overflow-hidden bg-dark-salon text-white" aria-labelledby="signature-title">
      <div className="container-custom">
        <div className="mb-12 max-w-2xl md:mb-16">
          <ScrollReveal>
            <p className="section-label text-stone">{t.signature.eyebrow}</p>
            <h2 id="signature-title" className="font-display text-section-title leading-[1.2] text-white">
              {t.signature.heading}
            </h2>
            <p className="mt-5 max-w-xl font-body leading-relaxed text-white/70">
              {t.signature.description}
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={1}>
          <div
            ref={viewportRef}
            tabIndex={0}
            role="region"
            aria-label={t.signature.carouselLabel}
            onKeyDown={handleCarouselKeyDown}
            className="scrollbar-hidden -mr-4 overflow-x-auto overscroll-x-contain pb-2 scroll-smooth snap-x snap-mandatory sm:-mr-6 lg:-mr-8 motion-reduce:scroll-auto"
          >
            <div className="flex w-max gap-4 pr-10 sm:gap-5 sm:pr-14 lg:gap-6 lg:pr-20">
              {styles.map((style, index) => {
                const imageFirst = index % 2 === 0;

                return (
                  <article
                    key={style.name}
                    data-signature-card
                    aria-roledescription="slide"
                    aria-label={`${numberLabel(index + 1)} ${t.services.position} ${numberLabel(styles.length)}: ${style.name}`}
                    className="flex shrink-0 basis-[82vw] snap-start snap-always flex-col overflow-hidden border border-white/20 bg-secondary-dark lg:min-h-[36rem] lg:basis-[clamp(47.5rem,82vw,68.75rem)] lg:grid lg:grid-cols-[1.65fr_0.9fr]"
                  >
                    <div className={`group relative aspect-[4/3] overflow-hidden bg-secondary-dark lg:aspect-auto ${imageFirst ? 'lg:order-1' : 'lg:order-2'}`}>
                      <Image
                        src={style.image}
                        alt={style.imageAlt}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 1023px) 82vw, 54vw"
                        className="object-cover object-[center_35%] transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                        style={{ objectPosition: 'center 35%' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-espresso/45 via-transparent to-transparent" />
                    </div>
                    <div className={`flex min-w-0 flex-1 flex-col justify-between p-7 sm:p-9 lg:p-12 ${imageFirst ? 'lg:order-2' : 'lg:order-1'}`}>
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-body text-[0.62rem] uppercase tracking-[0.2em] text-stone">{t.signature.cardLabel}</p>
                          <span className="font-body text-[0.65rem] tracking-[0.14em] text-white/40" aria-hidden="true">
                            {numberLabel(index + 1)} / {numberLabel(styles.length)}
                          </span>
                        </div>
                        <h3 className="mt-8 font-display text-3xl leading-tight text-white sm:text-4xl">{style.name}</h3>
                        <p className="mt-5 max-w-sm font-body text-sm leading-relaxed text-white/65 sm:text-base">{t.signature.styles[style.name as keyof typeof t.signature.styles] ?? style.description}</p>
                      </div>
                      <a href="/portfolio" className="mt-10 inline-flex w-fit items-center gap-2 font-body text-xs uppercase tracking-[0.14em] text-beige transition-colors hover:text-white">
                        {t.signature.explore} <HiArrowRight size={15} aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-7 flex items-center gap-4 md:mt-9">
          <span className="w-7 font-body text-xs tracking-[0.14em] text-white/60">{numberLabel(activeIndex + 1)}</span>
          <div
            className="h-px flex-1 overflow-hidden bg-white/15"
            role="progressbar"
            aria-label={t.signature.progress}
            aria-valuemin={1}
            aria-valuemax={styles.length}
            aria-valuenow={activeIndex + 1}
          >
            <div
                className="h-full bg-beige transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${((activeIndex + 1) / styles.length) * 100}%` }}
            />
          </div>
          <span className="w-7 text-right font-body text-xs tracking-[0.14em] text-white/60">{numberLabel(styles.length)}</span>
          <div className="ml-1 hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
                aria-label={t.signature.previous}
              className="inline-flex h-10 w-10 items-center justify-center border border-white/25 text-white transition-colors hover:border-burgundy hover:bg-burgundy disabled:cursor-not-allowed disabled:opacity-35"
            >
              <HiArrowLeft size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={activeIndex === styles.length - 1}
                aria-label={t.signature.next}
              className="inline-flex h-10 w-10 items-center justify-center border border-white/25 text-white transition-colors hover:border-burgundy hover:bg-burgundy disabled:cursor-not-allowed disabled:opacity-35"
            >
              <HiArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
