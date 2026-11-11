// src/store/localeStore.ts
import { create } from 'zustand';
import { Locale, translations, TranslationSchema } from '../i18n/translations';

// 🌟 1. 消除魔法字串 (Magic String)：將 Storage Key 抽離為常數，避免改錯或漏改
// (若專案有統一的 constants.ts，強烈建議改由 import { STORAGE_KEYS } from '../constants' 引入)
const LOCALE_KEY = 'jar_locale';

interface LocaleState {
  locale: Locale;
  t: TranslationSchema;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return 'zh';
  try {
    const saved = localStorage.getItem(LOCALE_KEY) as Locale | null;
    if (saved === 'zh' || saved === 'en') return saved;
  } catch (e) {
    // 🌟 2. 隱私模式防護 (Incognito Guard)：防堵 iOS Safari 無痕模式下，存取 localStorage 拋出 SecurityError 導致整個 App 白畫面
    console.warn('[JAR-QubitLab] localStorage access denied in privacy mode.');
  }
  return 'zh';
};

// 🌟 3. 消除多餘 I/O 開銷：暫存初始化結果，避免 create 內部呼叫兩次 getInitialLocale() 導致兩次磁碟讀取
const initialLocale = getInitialLocale();

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: initialLocale,
  t: translations[initialLocale],

  setLocale: (locale) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCALE_KEY, locale);
      } catch (e) {} // 隱私模式寫入防護
    }
    set({ locale, t: translations[locale] });
  },

  toggleLocale: () => {
    set((state) => {
      const next: Locale = state.locale === 'zh' ? 'en' : 'zh';
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCALE_KEY, next);
        } catch (e) {} // 隱私模式寫入防護
      }
      return { locale: next, t: translations[next] };
    });
  },
}));
