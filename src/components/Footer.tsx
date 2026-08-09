'use client';

import Image from 'next/image';
import Link from 'next/link';
import siteContent from '@/data/content';
import { useLanguage } from '@/i18n/useLanguage';

export default function Footer() {
  const { language, t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-burgundy bg-espresso pb-[calc(3.5rem+env(safe-area-inset-bottom))] text-white lg:pb-0" role="contentinfo">
      <div className="container-custom flex flex-col gap-3 py-7 text-xs text-white/62 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" aria-label="LeLe Hair Design - Home" className="relative block h-12 w-28 shrink-0 overflow-hidden">
          <Image
            src="/logo/lele-logo.png"
            alt="LeLe Hair Design"
            fill
            sizes="112px"
            className="object-cover object-center"
          />
        </Link>
        <p className="font-body">© {currentYear}</p>
        <a
          href={siteContent.contact.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body transition-colors hover:text-white"
        >
          {siteContent.contact.address[language]}
        </a>
        <p className="font-body">{t.footer.tagline}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 font-body uppercase tracking-[0.1em] text-beige">
          <a href={siteContent.contact.phoneHref} className="transition-colors hover:text-white">{t.common.call}</a>
          <a href={siteContent.contact.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="LeLe Hair Design Instagram" className="transition-colors hover:text-white">{t.common.instagram}</a>
          <a href={siteContent.contact.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="LeLe Hair Design Facebook" className="transition-colors hover:text-white">{t.common.facebook}</a>
          <a href={siteContent.contact.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">{t.common.directions}</a>
        </div>
      </div>
    </footer>
  );
}
