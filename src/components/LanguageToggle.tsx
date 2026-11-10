// src/components/LanguageToggle.tsx
import { useLocaleStore } from '../store/localeStore';

export const LanguageToggle = () => {
  const { locale, toggleLocale } = useLocaleStore();

  return (
    <button
      onClick={toggleLocale}
      className="px-2.5 py-1 text-xs font-mono rounded border border-white/20 bg-slate-900/80 hover:bg-slate-800 text-slate-200 transition-colors shadow-sm flex items-center gap-1.5"
    >
      <span className={locale === 'zh' ? 'text-sky-400 font-bold' : 'text-slate-400'}>中</span>
      <span className="text-slate-600">/</span>
      <span className={locale === 'en' ? 'text-sky-400 font-bold' : 'text-slate-400'}>EN</span>
    </button>
  );
};
