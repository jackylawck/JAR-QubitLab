// src/components/console/ConsoleBoothThree.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Description: Booth 3 Two-Qubit Entanglement & Bell State Control Console
 */
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

  const stats = useMemo(() => {
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < sampleHistory.length; i++) {
      const idx = sampleHistory[i];
      if (idx !== undefined && idx >= 0 && idx < 4) {
        counts[idx] = (counts[idx] ?? 0) + 1;
      }
    }
    return counts;
  }, [sampleHistory]);

  const historyLen = sampleHistory.length;

  useEffect(() => {
    if (historyLen > 0 && historyLen < 20) {
      sound.playTick(historyLen - 1);
    } else if (historyLen === 20) {
      sound.playTick(19);
      const timer = setTimeout(() => sound.playVictoryChord(), 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [historyLen]);

  return (
    <div className="w-full max-w-xl mx-auto h-full flex flex-col pointer-events-auto transition-all select-none">
      {/* 頂部：雙量子位元狀態監視儀表 */}
      <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-3.5 sm:p-4 shadow-xl mb-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400">QUANTUM STATE:</span>
            {isEntangled ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-900/60 text-purple-300 border border-purple-500/50 animate-pulse">
                ENTANGLED (BELL STATE)
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                SEPARABLE
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsExplaining(!isExplaining)}
            className="text-[11px] text-sky-400 hover:text-sky-300 font-bold px-2 py-0.5 rounded bg-sky-950/50 border border-sky-800/40 cursor-pointer transition-colors active:scale-95"
          >
            {isExplaining ? (locale === 'zh' ? '收起說明' : 'Hide Info') : (locale === 'zh' ? '原理解析 💡' : 'Theory 💡')}
          </button>
        </div>

        {/* 四個基底態的機率分佈 */}
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
          {amplitudes.map((amp, i) => {
            const prob = Math.round(amp.probability * 100);
            const isActive = prob > 0;
            const colorClass = isActive
              ? isEntangled
                ? 'text-fuchsia-400 bg-fuchsia-950/40 border-fuchsia-500/50 shadow-[0_0_8px_rgba(232,121,249,0.3)]'
                : i < 2
                  ? 'text-purple-400 bg-purple-950/40 border-purple-500/50'
                  : 'text-indigo-400 bg-indigo-950/40 border-indigo-500/50'
              : 'text-slate-600 bg-slate-900/50 border-slate-800/50 opacity-60';

            return (
              <div key={i} className={`flex flex-col items-center justify-center p-1.5 rounded border ${colorClass} transition-all duration-300`}>
                <span className="text-[11px] font-mono font-bold">{amp.label}</span>
                <span className="text-[13px] font-mono font-black tabular-nums">{prob}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {!isExplaining ? (
        <div className="grid grid-cols-3 gap-2.5 flex-1">
          {/* 按鈕 1：H Gate (q0) - 覺醒紫配色 */}
          <button
            type="button"
            onClick={() => { sound.playLever(); applyH(0); }}
            disabled={isSampling}
            className="min-h-[50px] p-2 rounded-xl flex flex-col items-center justify-center transition-all 
                       bg-purple-950/40 border border-purple-500/40 hover:bg-purple-900/60 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="text-[13px] sm:text-sm font-bold text-purple-300 mb-0.5">H Gate (q0)</span>
            <span className="text-[10px] text-purple-400/70 font-mono">{locale === 'zh' ? '量子疊加' : 'Superposition'}</span>
          </button>

          {/* 按鈕 2：CNOT (q0→q1) - 紫至緋紅漸層配色 */}
          <button
            type="button"
            onClick={() => { sound.playMerge(); applyCNOT(0, 1); }}
            disabled={isSampling}
            className="min-h-[50px] p-2 rounded-xl flex flex-col items-center justify-center transition-all relative overflow-hidden active:scale-95 disabled:opacity-30 disabled:pointer-events-none
                       border border-fuchsia-500/50 hover:border-fuchsia-400"
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-purple-800/60 to-rose-800/60 ${isEntangled ? 'animate-pulse opacity-100' : 'opacity-40'}`} />
            <span className="text-[13px] sm:text-sm font-bold text-white mb-0.5 relative z-10 drop-shadow-md">CNOT (q0→q1)</span>
            <span className="text-[10px] text-fuchsia-200/80 font-mono relative z-10">{locale === 'zh' ? '量子糾纏' : 'Entanglement'}</span>
          </button>

          {/* 按鈕 3：Sample (20x) - 琥珀金配色 */}
          <button
            type="button"
            onClick={sample20x}
            disabled={isSampling}
            className="min-h-[50px] p-2 rounded-xl flex flex-col items-center justify-center transition-all
                       bg-amber-950/40 border border-amber-600/50 hover:bg-amber-900/60 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="text-[13px] sm:text-sm font-bold text-amber-400 mb-0.5">
              {isSampling ? 'SAMPLING...' : 'Sample (20x)'}
            </span>
            <span className="text-[10px] text-amber-500/70 font-mono">{locale === 'zh' ? '統計觀測' : 'Observe'}</span>
          </button>
        </div>
      ) : (
        <div className="text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[140px] py-2 px-3 font-sans flex-1 border border-slate-800/60 rounded-xl bg-slate-900/40">
          <p>{t.boothThree?.explanation ?? 'Bell State Entanglement Theory'}</p>
        </div>
      )}

      {/* 統計結果與底部重置 */}
      <div className="flex flex-col gap-2 mt-3">
        {sampleHistory.length > 0 && !isExplaining && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-1.5 px-2 text-[10px] sm:text-xs font-mono bg-slate-950/60 rounded-lg border border-slate-800/80 shadow-inner">
            <span className="text-amber-500 font-bold">RESULT ({historyLen}/20):</span>
            {stats.map((count, i) => (
              <span key={i} className={count > 0 ? 'text-slate-200' : 'text-slate-600'}>
                {BASIS_LABELS[i]}: {count}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-end items-center px-1">
          <button
            type="button"
            onClick={() => { sound.playLever(); reset(); }}
            disabled={isSampling}
            className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors font-mono font-bold disabled:opacity-30 active:scale-95 flex items-center gap-1"
          >
            <span aria-hidden="true">↺</span> RESET SYSTEM
          </button>
        </div>
      </div>
    </div>
  );
};
