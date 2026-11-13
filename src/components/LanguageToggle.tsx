// src/components/LanguageToggle.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Description: Global Language Toggle (Academic UI)
 */
import { useCallback } from 'react';
import { useLocaleStore } from '../store/localeStore';
import { sound } from '../audio/soundEngine';

export const LanguageToggle = () => {
  // 🌟 1. 精準訂閱 (Selector)：避免全量解構，防止未來 localeStore 擴充時觸發無效重繪
  const locale = useLocaleStore((s) => s.locale);
  const toggleLocale = useLocaleStore((s) => s.toggleLocale);

  // 🌟 2. 效能與型別安全：使用 useCallback 防止每次 Render 重建函式
  const handleToggle = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); 
    sound.unlock();      
    sound.playTick(2);   
    
    // 防堵極端 Webview / Safari 環境下 navigator.vibrate 的存取報錯
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10); 
      }
    } catch (error) {
      // 忽略不支援的環境
    }
    
    toggleLocale();
  }, [toggleLocale]);

  // 🌟 3. 徹底阻絕 3D 視角穿透：攔截 PointerDown / PointerUp，避免轉動背後的三維星空
  const handlePointer = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  }, []);

  return (
    <button
      type="button"
      onClick={handleToggle}
      onPointerDown={handlePointer}
      onPointerUp={handlePointer}
      aria-label={locale === 'zh' ? '切換為英文' : 'Switch to Chinese'}
      title={locale === 'zh' ? '切換為英文' : 'Switch to Chinese'}
      className="group relative flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] min-w-[72px] rounded-md font-mono font-bold text-sm bg-slate-800/80 backdrop-blur-md border border-slate-700 hover:bg-slate-700 hover:border-slate-500 active:scale-95 transition-all duration-200 shadow-lg select-none touch-manipulation cursor-pointer"
    >
      <span 
        className={`transition-all duration-300 ${
          locale === 'zh' 
            ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]' 
            : 'text-slate-500 group-hover:text-slate-400'
        }`}
      >
        中
      </span>
      
      <span className="text-slate-600 font-light">/</span>
      
      <span 
        className={`transition-all duration-300 ${
          locale === 'en' 
            ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]' 
            : 'text-slate-500 group-hover:text-slate-400'
        }`}
      >
        EN
      </span>
    </button>
  );
};
