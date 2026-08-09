'use client';

import { useLanguage } from '@/i18n/useLanguage';

interface LanguageSwitcherProps {
  tone?: 'light' | 'dark';
  menu?: boolean;
}

export default function LanguageSwitcher({ tone = 'dark', menu = false }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();
  const activeClass = tone === 'light' ? 'text-white' : 'text-burgundy';
  const inactiveClass = tone === 'light' ? 'text-white/45 hover:text-white/80' : 'text-muted hover:text-espresso';

  return (
    <div className={`flex items-center ${menu ? 'gap-1' : 'gap-0.5'} font-body text-xs tracking-[0.12em]`} role="group" aria-label={t.language.change}>
      <button
        type="button"
        aria-pressed={language === 'en'}
        aria-label={t.language.english}
        onClick={() => setLanguage('en')}
        className={`min-h-10 min-w-10 rounded-sm px-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy ${language === 'en' ? `${activeClass} font-semibold` : inactiveClass}`}
      >
        EN
      </button>
      <span aria-hidden="true" className={tone === 'light' ? 'text-white/35' : 'text-muted/45'}>|</span>
      <button
        type="button"
        aria-pressed={language === 'vi'}
        aria-label={t.language.vietnamese}
        onClick={() => setLanguage('vi')}
        className={`min-h-10 min-w-10 rounded-sm px-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy ${language === 'vi' ? `${activeClass} font-semibold` : inactiveClass}`}
      >
        VI
      </button>
    </div>
  );
}
