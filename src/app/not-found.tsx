'use client';

import Link from 'next/link';
import { useLanguage } from '@/i18n/useLanguage';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <div className="text-center px-4">
        <h1 className="font-display text-6xl md:text-8xl text-charcoal mb-4">404</h1>
        <p className="font-body text-charcoal/60 mb-8">
          {t.notFound.description}
        </p>
        <Link href="/" className="btn-primary">
          {t.notFound.cta}
        </Link>
      </div>
    </div>
  );
}
