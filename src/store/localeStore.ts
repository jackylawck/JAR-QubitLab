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

// DRY: 抽離 I/O 寫入與靜默失敗防護
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
    
    // 🌟 優化 1：智慧回退升級 (Smart Fallback)
    // 現代瀏覽器支援 navigator.languages 陣列，能更精準反映使用者的多語系優先級
    const userLangs = navigator.languages || [navigator.language || ''];
    const pref = userLangs.find(lang => lang.toLowerCase().startsWith('en') || lang.toLowerCase().startsWith('zh'));
    
    if (pref && pref.toLowerCase().startsWith('en')) return 'en';
  } catch (e) {
    console.warn('[JAR-QubitLab] localStorage access denied in privacy mode.');
  }
  return 'zh'; // 最終安全回退值
};

const initialLocale = getInitialLocale();

export const useLocaleStore = create<LocaleState>((set) => {
  // 🌟 優化 2：跨分頁狀態同步 (Cross-Tab Synchronization)
  // 企業級 PWA 標配：當使用者在 Tab A 切換語系時，Tab B 會瞬間無縫更新，無需重新整理
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === LOCALE_KEY && (e.newValue === 'zh' || e.newValue === 'en')) {
        set({ 
          locale: e.newValue as Locale, 
          t: translations[e.newValue as Locale] 
        });
      }
    });
  }

  return {
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
  };
});
