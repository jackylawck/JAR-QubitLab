// src/store/localeStore.ts
import { create } from 'zustand';
import { Locale, translations, TranslationSchema } from '../i18n/translations';

const LOCALE_KEY = 'jar_locale';

// 🌟 優化 1：動態推導支援語系，建立嚴格型別守衛 (杜絕硬編碼與 LocalStorage 污染)
const SUPPORTED_LOCALES = Object.keys(translations) as Locale[];
const isSupportedLocale = (val: string | null): val is Locale => 
  SUPPORTED_LOCALES.includes(val as Locale);

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
    const saved = localStorage.getItem(LOCALE_KEY);
    // 透過守衛嚴格檢驗，即使 LocalStorage 被外部竄改為 "fr" 也能安全攔截
    if (isSupportedLocale(saved)) return saved;
    
    // 🌟 優化 2：O(n) 提早短路的語系匹配，效能優於 array.find
    const userLangs = navigator.languages || [navigator.language || ''];
    for (const lang of userLangs) {
      const lowerLang = lang.toLowerCase();
      if (lowerLang.startsWith('en')) return 'en';
      if (lowerLang.startsWith('zh')) return 'zh';
    }
  } catch (e) {
    console.warn('[JAR-QubitLab] localStorage access denied in privacy mode.');
  }
  return 'zh'; // 最終安全回退值
};

const initialLocale = getInitialLocale();

export const useLocaleStore = create<LocaleState>((set, get) => {
  // 跨分頁狀態同步 (Cross-Tab Synchronization)
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      // 🌟 同樣復用型別守衛，確保跨分頁同步的資料是合法的
      if (e.key === LOCALE_KEY && isSupportedLocale(e.newValue)) {
        set({ 
          locale: e.newValue, 
          t: translations[e.newValue] 
        });
      }
    });
  }

  return {
    locale: initialLocale,
    t: translations[initialLocale],

    setLocale: (locale) => {
      // 🌟 優化 3：提前短路 (Short-Circuit)，避免相同語系重複設定觸發 React 深度重渲染
      if (get().locale === locale) return;
      
      saveLocale(locale);
      set({ locale, t: translations[locale] });
    },

    toggleLocale: () => {
      set((state) => {
        // 針對雙語博物館展台的優化：O(1) 的切換邏輯
        const next: Locale = state.locale === 'zh' ? 'en' : 'zh';
        saveLocale(next);
        return { locale: next, t: translations[next] };
      });
    },
  };
});
