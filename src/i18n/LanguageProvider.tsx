'use client';

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { translations, type Language, type Translation } from './translations';

const LANGUAGE_STORAGE_KEY = 'lele-language';
const LANGUAGE_CHANGE_EVENT = 'lele-language-change';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return value === 'en' || value === 'vi';
}

function getStoredLanguage(): Language {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguage(savedLanguage) ? savedLanguage : 'en';
}

function subscribeToLanguage(callback: () => void) {
  window.addEventListener(LANGUAGE_CHANGE_EVENT, callback);
  return () => window.removeEventListener(LANGUAGE_CHANGE_EVENT, callback);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore<Language>(subscribeToLanguage, getStoredLanguage, () => 'en');

  useLayoutEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage;
    window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  }, [language, setLanguage]);

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t: translations[language] }),
    [language, setLanguage, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}
