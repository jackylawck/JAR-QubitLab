// src/store/localeStore.ts
import { create } from 'zustand';
import { Locale, translations, TranslationSchema } from '../i18n/translations';

const LOCALE_KEY = 'jar_locale';

interface LocaleState {
  locale: Locale;
  t: TranslationSchema;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

// 🌟 優化 1：DRY (Don't Repeat Yourself) - 抽離 I/O 寫入與防護邏輯
// 消滅 setLocale 與 toggleLocale 中重複的 try-catch boilerplate
const saveLocale = (locale: Locale) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch (e) {
    // 隱私模式寫入防護 (靜默失敗，維持 RAM 狀態運行)
  }
};

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return 'zh';
  try {
    const saved = localStorage.getItem(LOCALE_KEY) as Locale | null;
    if (saved === 'zh' || saved === 'en') return saved;
    
    // 🌟 優化 2：智慧回退 (Smart Fallback) - 提升初次訪問 UX
    // 若 localStorage 無紀錄，則根據使用者的系統/瀏覽器偏好設定給予預設語系
    if (navigator.language.toLowerCase().startsWith('en')) return 'en';
  } catch (e) {
    console.warn('[JAR-QubitLab] localStorage access denied in privacy mode.');
  }
  return 'zh'; // 最終安全回退值
};

const initialLocale = getInitialLocale();

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: initialLocale,
  t: translations[initialLocale],

  setLocale: (locale) => {
    saveLocale(locale);
    set({ locale, t: translations[locale] });
  },

  toggleLocale: () => {
    set((state) => {
      const next: Locale = state.locale === 'zh' ? 'en' : 'zh';
      saveLocale(next);
      return { locale: next, t: translations[next] };
    });
  },
}));
