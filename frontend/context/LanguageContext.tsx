'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en';
import { fr } from '../locales/fr';
import { ar } from '../locales/ar';

export type Language = 'en' | 'fr' | 'ar';

const dictionaries = { en, fr, ar };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && ['en', 'fr', 'ar'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isArabic = language === 'ar';
      document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.');
    const dict = dictionaries[language];
    let current: any = dict;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English if key missing in FR/AR
        let fallback: any = en;
        for (const fKey of keys) {
          if (fallback && typeof fallback === 'object' && fKey in fallback) {
            fallback = fallback[fKey];
          } else {
            fallback = path;
            break;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') {
      return path;
    }

    if (params) {
      let result = current;
      Object.entries(params).forEach(([key, val]) => {
        result = result.replace(new RegExp(`{${key}}`, 'g'), String(val));
      });
      return result;
    }

    return current;
  };

  const isRtl = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
