'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';
import siteContent from '@/data/content';
import { useLanguage } from '@/i18n/useLanguage';
import LanguageSwitcher from './LanguageSwitcher';
import { BookingTrigger } from './BookingProvider';
import { useMobileMenu } from './MobileMenuProvider';

export default function Header() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasMobileMenuOpen = useRef(false);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      wasMobileMenuOpen.current = true;
      window.requestAnimationFrame(() => closeButtonRef.current?.focus());
      return;
    }

    if (wasMobileMenuOpen.current) {
      menuButtonRef.current?.focus();
      wasMobileMenuOpen.current = false;
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, setIsMobileMenuOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024 || desktopQuery.matches) setIsMobileMenuOpen(false);
    };

    closeOnDesktop();
    desktopQuery.addEventListener('change', closeOnDesktop);
    window.addEventListener('resize', closeOnDesktop);
    return () => {
      desktopQuery.removeEventListener('change', closeOnDesktop);
      window.removeEventListener('resize', closeOnDesktop);
    };
  }, [setIsMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const navigationHref = (href: string) => href.startsWith('/') ? href : `/${href}`;

  return (
    <header className="site-header-solid fixed inset-x-0 top-0 z-50 py-3 transition-all duration-500">
      <div className="container-custom flex items-center justify-between gap-4">
        <Link href="/" aria-label="LeLe Hair Design - Home" className="relative z-50 block h-[58px] w-32 shrink-0 overflow-hidden">
          <Image
            src="/logo/lele-logo.png"
            alt="LeLe Hair Design"
            fill
            sizes="128px"
            preload
            className="object-cover object-center"
          />
        </Link>

        <nav className="hidden lg:flex items-center justify-center gap-4 xl:gap-5" aria-label={t.header.primaryNavigation}>
          {siteContent.navigation.map((item, index) => (
            <Link
              key={item.href}
              href={navigationHref(item.href)}
              className="font-body text-[0.62rem] tracking-[0.08em] text-espresso/75 transition-colors hover:text-burgundy xl:text-[0.69rem] xl:tracking-[0.1em]"
            >
              {t.navigation[index]}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-0 lg:gap-3">
          <BookingTrigger className="btn-book relative z-50 hidden shrink-0 text-xs lg:inline-flex" aria-label={t.common.bookAppointment}>
            {t.common.bookAppointment}
          </BookingTrigger>
          <LanguageSwitcher tone="dark" />

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="relative z-10 inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-espresso transition-colors lg:hidden"
            aria-label={isMobileMenuOpen ? t.header.closeMenu : t.header.openMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? <HiX size={28} /> : <HiMenu size={28} />}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isMobileMenuOpen}
        aria-labelledby="mobile-navigation-title"
        className={`fixed inset-0 z-[9999] flex h-[100dvh] w-screen flex-col overflow-hidden bg-espresso px-5 py-4 transition-[opacity,transform] duration-300 motion-reduce:transition-none sm:px-8 sm:py-6 lg:hidden ${
          isMobileMenuOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
        }`}
      >
        <div className="relative z-[10000] flex shrink-0 items-center justify-between gap-5">
          <Link href="/" onClick={closeMobileMenu} aria-label="LeLe Hair Design - Home" className="relative block h-14 w-32 shrink-0">
            <Image
              src="/logo/lele-logo.png"
              alt="LeLe Hair Design"
              fill
              sizes="128px"
              className="object-contain object-left"
            />
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeMobileMenu}
            className="inline-flex size-11 shrink-0 items-center justify-center border border-white/25 text-white transition-colors hover:border-burgundy hover:bg-burgundy focus-visible:outline-white"
            aria-label={t.header.closeMenu}
          >
            <HiX size={25} aria-hidden="true" />
          </button>
        </div>

        <nav className="scrollbar-hidden relative z-[10000] min-h-0 flex-1 overflow-y-auto py-5" aria-label={t.header.mobileNavigation}>
          <div className="flex min-h-full flex-col items-center justify-center gap-2 py-2 sm:gap-3">
            <h2 id="mobile-navigation-title" className="sr-only">{t.header.mobileNavigation}</h2>
            {siteContent.navigation.map((item, index) => (
              <Link
                key={item.href}
                href={navigationHref(item.href)}
                onClick={closeMobileMenu}
                className="px-3 py-1 font-body text-xl font-medium text-white transition-colors hover:text-burgundy focus-visible:outline-white sm:text-2xl"
                style={{ transitionDelay: isMobileMenuOpen ? `${index * 35}ms` : '0ms' }}
              >
                {t.navigation[index]}
              </Link>
            ))}
          </div>
        </nav>

        <div className="relative z-[10000] flex shrink-0 flex-col items-center gap-4 border-t border-white/15 pt-5">
          <div className="flex flex-col items-center gap-2">
            <span className="font-body text-[0.6rem] uppercase tracking-[0.24em] text-white/45">{t.language.label}</span>
            <LanguageSwitcher tone="light" menu />
          </div>
          <BookingTrigger onClick={closeMobileMenu} className="btn-book px-8 py-3.5 text-sm sm:px-10 sm:py-4 sm:text-base">
            {t.common.bookAppointment}
          </BookingTrigger>
        </div>
      </div>
    </header>
  );
}
