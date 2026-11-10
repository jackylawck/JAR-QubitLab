// src/components/LanguageToggle.tsx
import { useLocaleStore } from '../store/localeStore';
import { sound } from '../audio/soundEngine';

export const LanguageToggle = () => {
  const { locale, toggleLocale } = useLocaleStore();

  const handleToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // 防止點擊穿透到 3D 畫布
    sound.unlock();      // 確保 iOS Safari 喚醒音頻
    sound.playTick(2);   // 播放清脆的 UI 切換音效 (稍微調高一點音調)
    
    // 如果支援震動，給予輕微的觸覺回饋
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(10); 
    }
    
    toggleLocale();
  };

  return (
    <button
      onClick={handleToggle}
      onPointerDown={(e) => e.stopPropagation()} // 攔截 Pointer 避免 R3F 射線誤判
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
