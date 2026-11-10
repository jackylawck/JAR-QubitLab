// src/store/localeStore.ts
import { create } from 'zustand';
import { Locale, translations, TranslationSchema } from '../i18n/translations';

interface LocaleState {
  locale: Locale;
  t: TranslationSchema;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const getInitialLocale = (): Locale => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('jar_locale') as Locale;
    if (saved === 'zh' || saved === 'en') return saved;
  }
  return 'zh'; // 預設繁體中文
};

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: getInitialLocale(),
  t: translations[getInitialLocale()],

  setLocale: (locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jar_locale', locale);
    }
    set({ locale, t: translations[locale] });
  },

  toggleLocale: () => {
    set((state) => {
      const next: Locale = state.locale === 'zh' ? 'en' : 'zh';
      if (typeof window !== 'undefined') {
        localStorage.setItem('jar_locale', next);
      }
      return { locale: next, t: translations[next] };
    });
  },
}));
