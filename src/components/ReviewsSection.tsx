'use client';

import Link from 'next/link';
import { FaGoogle } from 'react-icons/fa';
import { HiArrowRight, HiStar } from 'react-icons/hi';
import siteContent, { type CustomerReview } from '@/data/content';
import { useLanguage } from '@/i18n/useLanguage';
import type { Translation } from '@/i18n/translations';
import BackToHome from './BackToHome';
import ScrollReveal from './ScrollReveal';

type ReviewsVariant = 'preview' | 'full';

interface ReviewsSectionProps {
  variant: ReviewsVariant;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function StarRating({ value, label }: { value: number; label: string }) {
  const roundedValue = Math.round(value);

  return (
    <div className="flex items-center gap-1 text-stone" aria-label={`${value} ${label}`}>
      {Array.from({ length: 5 }, (_, index) => (
        <HiStar key={index} size={16} aria-hidden="true" className={index < roundedValue ? 'opacity-100' : 'opacity-25'} />
      ))}
    </div>
  );
}

function ReviewCard({ review, preview, ratingLabel }: { review: CustomerReview; preview: boolean; ratingLabel: string }) {
  return (
    <article className="flex min-h-full flex-col border border-ivory/15 bg-ivory/[0.07] p-6 transition-colors duration-300 hover:border-stone/50 hover:bg-ivory/[0.1] sm:p-7">
      <header className="flex items-center gap-4">
        <div aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-stone/50 font-body text-sm font-medium tracking-[0.08em] text-stone">
          {initials(review.name)}
        </div>
        <div className="min-w-0">
          <h3 className="font-body text-sm font-medium text-white">{review.name}</h3>
          {review.location && <p className="mt-1 font-body text-xs text-white/60">{review.location}</p>}
        </div>
      </header>

      <div className="mt-6">
        <StarRating value={review.rating} label={ratingLabel} />
      </div>

      <blockquote className={`mt-5 font-body text-sm leading-relaxed text-white/80 ${preview ? 'line-clamp-3' : ''}`}>
        {review.text}
      </blockquote>

      {(review.date || review.source) && (
        <footer className="mt-6 flex flex-wrap gap-x-3 gap-y-1 font-body text-xs text-white/55">
          {review.date && <span>{review.date}</span>}
          {review.source && <span>{review.source}</span>}
        </footer>
      )}
    </article>
  );
}

function ReviewSummary({ compact, t }: { compact: boolean; t: Translation }) {
  const { averageRating, reviewCount } = siteContent.reviews.summary;
  const hasAverageRating = averageRating !== undefined && averageRating > 0;
  const hasReviewCount = reviewCount !== undefined && reviewCount > 0;

  if (!hasAverageRating && !hasReviewCount) return null;

  return (
    <div className={`mt-7 ${compact ? '' : 'mt-8'} text-center`}>
      <p className="font-body text-xs uppercase tracking-[0.18em] text-white/60">{t.reviews.summary}</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {hasAverageRating && <StarRating value={averageRating} label={t.reviews.rating} />}
        {hasAverageRating && <span className="font-display text-2xl text-white">{averageRating}</span>}
        {hasReviewCount && <span className="font-body text-sm text-white/70">{reviewCount} {t.reviews.reviewCount}</span>}
      </div>
    </div>
  );
}

function GoogleLink({ t }: { t: Translation }) {
  return (
    <a
      href={siteContent.contact.googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 border border-ivory/35 px-6 py-3 font-body text-xs font-medium tracking-[0.12em] text-white transition-colors hover:border-burgundy hover:bg-burgundy"
    >
      <FaGoogle size={15} aria-hidden="true" /> {t.reviews.google}
    </a>
  );
}

function EmptyState({ t, showAll }: { t: Translation; showAll: boolean }) {
  return (
    <div className="mx-auto mt-10 max-w-2xl border border-ivory/15 bg-ivory/[0.07] px-6 py-10 text-center sm:px-10 sm:py-12">
      <h3 className="font-display text-2xl leading-tight text-white">{t.reviews.emptyHeading}</h3>
      <p className="mx-auto mt-5 max-w-xl font-body text-sm leading-relaxed text-white/72">
        {t.reviews.emptyDescription}
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <GoogleLink t={t} />
        {showAll && (
          <Link href="/danh-gia" className="inline-flex items-center justify-center border border-burgundy bg-burgundy px-6 py-3 font-body text-xs font-medium tracking-[0.12em] text-white transition-colors hover:border-ivory hover:bg-transparent hover:text-white">
            {t.reviews.viewAll}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ReviewsSection({ variant }: ReviewsSectionProps) {
  const { t } = useLanguage();
  const isPreview = variant === 'preview';
  const reviews = isPreview ? siteContent.reviews.verifiedReviews.slice(0, 3) : siteContent.reviews.verifiedReviews;
  const Heading = isPreview ? 'h2' : 'h1';

  return (
    <section
      id={isPreview ? 'reviews' : undefined}
      className="section-padding scroll-mt-24 border-t border-ivory/15 bg-dark-salon text-white"
      aria-labelledby="reviews-title"
    >
      <div className={`container-custom ${isPreview ? 'max-w-7xl' : 'max-w-6xl'}`}>
        {!isPreview && (
          <ScrollReveal>
            <BackToHome />
          </ScrollReveal>
        )}

        <div className={`mx-auto text-center ${isPreview ? '' : 'mt-10'}`}>
          <ScrollReveal>
            <p className="section-label text-beige">{t.reviews.eyebrow}</p>
            <Heading id="reviews-title" className="font-display text-section-title leading-[1.2] text-white">
              {t.reviews.heading}
            </Heading>
            <p className="mx-auto mt-5 max-w-2xl font-body leading-relaxed text-white/72">
              {isPreview ? t.reviews.description : t.reviews.fullDescription}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <ReviewSummary compact={isPreview} t={t} />
          </ScrollReveal>
        </div>

        {reviews.length > 0 ? (
          <>
            <div className="scrollbar-hidden -mr-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pr-4 sm:-mr-6 sm:gap-5 sm:pr-6 md:mr-0 md:grid md:grid-cols-3 md:overflow-visible md:pr-0 lg:mt-12 lg:gap-6">
              {reviews.map((review, index) => (
                <ScrollReveal key={review.id} delay={((index % 3) + 1) as 1 | 2 | 3} className="w-[90%] shrink-0 snap-start md:w-auto md:shrink">
                  <ReviewCard review={review} preview={isPreview} ratingLabel={t.reviews.rating} />
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={3} className="mt-10 text-center">
              {isPreview ? (
                <Link href="/danh-gia" className="inline-flex items-center gap-2 font-body text-xs font-medium tracking-[0.14em] text-beige transition-colors hover:text-white">
                  {t.reviews.viewAll} <HiArrowRight size={16} aria-hidden="true" />
                </Link>
              ) : (
                <GoogleLink t={t} />
              )}
            </ScrollReveal>
          </>
        ) : (
          <ScrollReveal delay={2}>
            <EmptyState t={t} showAll={isPreview} />
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
