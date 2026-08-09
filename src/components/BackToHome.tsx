'use client';

import Link from 'next/link';
import { useLanguage } from '@/i18n/useLanguage';

export default function BackToHome() {
  const { t } = useLanguage();

  return (
    <Link href="/" className="text-link inline-flex font-body text-xs uppercase tracking-[0.14em]">
      ← {t.common.backToHome}
    </Link>
  );
}
