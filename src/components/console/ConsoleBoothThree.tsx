// src/components/console/ConsoleBoothThree.tsx
import { useMemo, useEffect } from 'react';
import { useTensorStore } from '../../store/tensorStore';
import { useLocaleStore } from '../../store/localeStore';
import { sound } from '../../audio/soundEngine';

const BASIS_LABELS = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'] as const;

interface ConsoleBoothThreeProps {
  isExplaining: boolean;
  setIsExplaining: (v: boolean) => void;
}

export const ConsoleBoothThree = ({ isExplaining, setIsExplaining }: ConsoleBoothThreeProps) => {
  const { applyH, applyCNOT, sample20x, reset, isSampling, isEntangled, sampleHistory, amplitudes } = useTensorStore();

  const t = useLocaleStore((s) => s.t);
  const locale = useLocaleStore((s) => s.locale);

  // 🌟 優化 1：使用 useMemo 封裝衍生狀態，並修復 TS2532 嚴格索引報錯
  const stats = useMemo(() => {
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < sampleHistory.length; i++) {
      const idx = sampleHistory[i];
      if (idx !== undefined && idx >= 0 && idx < 4) {
        // 安全累加：消滅 Object is possibly 'undefined'
        counts[idx] = (counts[idx] ?? 0) + 1; 
      }
    }
    return counts;
  }, [sampleHistory]);

  const historyLen = sampleHistory.length;

  // 🌟 優化 2：精簡 useEffect 音效邏輯，並修復 TS7030 確保所有路徑皆有回傳
  useEffect(() => {
    if (historyLen > 0 && historyLen < 20) {
      sound.playTick(historyLen - 1);
    } else if (historyLen === 20) {
      sound.playTick(19); // 補齊最後一下滴答聲
      const timer = setTimeout(() => sound.playVictoryChord(), 150);
      return () => clearTimeout(timer);
    }
    
    // 明確宣告未觸發 Cleanup 的路徑回傳 undefined
    return undefined; 
  }, [historyLen]);

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col pointer-events-auto transition-all">
      {/* 頂部狀態列 */}
      <div className="flex justify-between items-end mb-2 sm:mb-4 px-2">
        <div className="flex items-baseline gap-4 text-xs font-mono">
          <span className="text-slate-400">STATE:</span>
          {amplitudes.map((amp, i) => (
            <span key={i} className={amp.modulus > 0.01 ? (isEntangled ? 'text-purple-400 font-bold' : 'text-sky-400 font-bold') : 'text-slate-600'}>
              {amp.label} {Math.round(amp.probability * 100)}%
            </span>
          ))}
        </div>
      </div>

      {!isExplaining ? (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1">
          <button
            onClick={() => { sound.playLever(); applyH(0); }}
            disabled={isSampling}
            className="flex flex-col items-center justify-center bg-slate-900 border border-slate-700 rounded-xl hover:border-sky-500 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="text-sm font-bold text-sky-400 mb-1">H Gate (q0)</span>
            <span className="text-[10px] text-slate-500">Superposition</span>
          </button>

          <button
            onClick={() => { sound.playMerge(); applyCNOT(0, 1); }}
            disabled={isSampling}
            className="flex flex-col items-center justify-center bg-slate-900 border border-slate-700 rounded-xl hover:border-purple-500 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
          >
            {isEntangled && <div className="absolute inset-0 bg-purple-500/10 animate-pulse" />}
            <span className="text-sm font-bold text-purple-400 mb-1 relative z-10">CNOT (q0→q1)</span>
            <span className="text-[10px] text-slate-500 relative z-10">Entanglement</span>
          </button>

          <button
            onClick={sample20x}
            disabled={isSampling}
            className="flex flex-col items-center justify-center bg-slate-900 border border-amber-700/50 rounded-xl hover:border-amber-500 hover:bg-amber-950/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="text-sm font-bold text-amber-500 mb-1">
              {isSampling ? 'SAMPLING...' : 'Sample (20x)'}
            </span>
            <span className="text-[10px] text-slate-500">Observe Distribution</span>
          </button>
        </div>
      ) : (
        <div className="text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[140px] py-1 px-2 font-sans flex-1 border border-slate-800/60 rounded-xl bg-slate-900/40">
          <p>{t.boothThree.explanation}</p>
        </div>
      )}

      {/* 統計結果小面板 */}
      {sampleHistory.length > 0 && !isExplaining && (
        <div className="mt-2 h-6 flex items-center justify-center gap-4 text-[10px] font-mono bg-slate-900/50 rounded border border-slate-800">
          <span className="text-amber-500">RESULT ({sampleHistory.length}/20):</span>
          {stats.map((count, i) => (
            <span key={i} className={count > 0 ? 'text-slate-200' : 'text-slate-600'}>
              {BASIS_LABELS[i] ?? '|??⟩'}: {count}
            </span>
          ))}
        </div>
      )}

      {/* 底部控制列 */}
      <div className="flex justify-between items-center mt-2 px-2">
        <button
          onClick={() => setIsExplaining(!isExplaining)}
          className="text-[10px] text-sky-400 hover:text-sky-300 font-mono transition-colors active:scale-95"
        >
          [ {isExplaining ? (locale === 'zh' ? '關閉解析' : 'CLOSE THEORY') : (locale === 'zh' ? '原理解析' : 'THEORY')} ]
        </button>
        <button
          onClick={() => { sound.playLever(); reset(); }}
          disabled={isSampling}
          className="text-[10px] text-slate-500 hover:text-white transition-colors font-mono disabled:opacity-30 active:scale-95"
        >
          [ RESET SYSTEM ]
        </button>
      </div>
    </div>
  );
};
