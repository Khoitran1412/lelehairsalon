'use client';

import Image from 'next/image';
import siteContent from '@/data/content';
import { useLanguage } from '@/i18n/useLanguage';
import BackToHome from './BackToHome';
import ScrollReveal from './ScrollReveal';

export default function HairCareJournal() {
  const { t } = useLanguage();
  const articles = siteContent.journalArticles;

  return (
    <section className="section-padding bg-white" aria-labelledby="journal-title">
      <div className="container-custom">
        <div className="mb-12 max-w-2xl md:mb-16">
          <ScrollReveal>
            <p className="section-label">{t.journal.eyebrow}</p>
            <h1 id="journal-title" className="section-heading mb-5">{t.journal.heading}</h1>
            <p className="font-body leading-relaxed text-charcoal/60">
              {t.journal.description}
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <div className="mb-10 md:mb-12">
            <BackToHome />
          </div>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <ScrollReveal key={article.id} delay={((index % 3) + 1) as 1 | 2 | 3}>
              <article className="group flex h-full flex-col border border-burgundy/15 bg-cream transition-colors hover:border-burgundy/50">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={article.image}
                    alt={t.journal.imageAlts[index] ?? article.imageAlt}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 bg-white/90 px-2.5 py-1 font-body text-[0.6rem] uppercase tracking-[0.12em] text-burgundy backdrop-blur-sm">
                    {t.journal.categories[index]}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl leading-snug text-charcoal">{t.journal.titles[index]}</h3>
                  <p className="mt-4 font-body text-sm leading-relaxed text-charcoal/60">{t.journal.summaries[index]}</p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
