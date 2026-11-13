// src/components/console/ConsoleBoothOne.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Description: Booth 1 Superposition & Wavefunction Collapse Control Console (EVA-01 Theme)
 */
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { useQuantumStore } from '../../store/quantumStore';
import { useLocaleStore } from '../../store/localeStore';
import { sound } from '../../audio/soundEngine';
import { useAnimationLock } from '../../hooks/useAnimationLock';
import { QUANTUM_CONFIG } from '../../constants';

export interface ConsoleBoothOneProps {
  isExplaining?: boolean;
  setIsExplaining?: Dispatch<SetStateAction<boolean>>;
}

export const ConsoleBoothOne = (_props: ConsoleBoothOneProps) => {
  const t = useLocaleStore((s) => s.t);
  const locale = useLocaleStore((s) => s.locale);
  const { isAnimating, requestActionLock } = useAnimationLock();

  // 細化 Selector，避免展台 2 干涉態變動引發無效重繪
  const amp0 = useQuantumStore((s) => s.amplitudes[0]?.modulus ?? 0);
  const amp1 = useQuantumStore((s) => s.amplitudes[1]?.modulus ?? 0);
  const applyGate = useQuantumStore((s) => s.applyGate);
  const collapse = useQuantumStore((s) => s.collapse);
  const reset = useQuantumStore((s) => s.reset);

  const actionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (actionTimerRef.current !== null) {
        clearTimeout(actionTimerRef.current);
        actionTimerRef.current = null;
      }
    };
  }, []);

  // 計算邊際機率 P(|0⟩) 與 P(|1⟩)
  const p0Raw = amp0 ** 2;
  const p1Raw = amp1 ** 2;

  const p0 = p0Raw < QUANTUM_CONFIG.EPSILON ? 0 : Math.min(1, p0Raw);
  const p1 = p1Raw < QUANTUM_CONFIG.EPSILON ? 0 : Math.min(1, p1Raw);
  const pct0 = Math.round(p0 * 100);
  const pct1 = Math.round(p1 * 100);

  const isSuperposition = p0 > 0.01 && p1 > 0.01;
  const resetLabel = locale === 'en' ? 'Reset' : '重置';

  const executeAction = useCallback(
    (durationMs: number, action: () => void, soundEffect: () => void) => {
      if (isAnimating) return;

      if (actionTimerRef.current !== null) {
        clearTimeout(actionTimerRef.current);
      }

      requestActionLock(durationMs);
      soundEffect();
      action();

      actionTimerRef.current = window.setTimeout(() => {
        actionTimerRef.current = null;
      }, durationMs);
    },
    [isAnimating, requestActionLock]
  );

  // 透過箭頭函式呼叫 sound.playLever() / sound.playShutter()，確保內部 this 指向 sound 實例
  const handleHadamard = () => executeAction(400, () => applyGate('H', [0]), () => sound.playLever());
  const handleCollapse = () => executeAction(350, collapse, () => sound.playShutter());
  const handleReset = () => executeAction(250, reset, () => sound.playLever());

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-3 select-none">
      {/* 1. 即時波函數機率分佈儀表板（EVA-01 裝甲紫 vs 螢光青） */}
      <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-3.5 sm:p-4 shadow-xl">
        <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-2">
          {/* 路徑 A：初號機裝甲紫 (#a855f7) */}
          <div className="flex items-center gap-2 text-purple-300">
            <span
              className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"
              aria-hidden="true"
            />
            <span>{t.common.pathA}</span>
            <span className="font-mono font-bold text-purple-400 tabular-nums">{pct0}%</span>
          </div>

          {/* 態向量狀態徽章 */}
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-mono border transition-colors ${
              isSuperposition
                ? 'bg-purple-500/15 text-purple-200 border-purple-500/40'
                : 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40'
            }`}
          >
            {isSuperposition ? '|ψ⟩ = (|0⟩ + |1⟩)/√2' : pct0 >= 50 ? '|0⟩' : '|1⟩'}
          </span>

          {/* 路徑 B：初號機螢光青 (#22d3ee) */}
          <div className="flex items-center gap-2 text-cyan-300">
            <span className="font-mono font-bold text-cyan-400 tabular-nums">{pct1}%</span>
            <span>{t.common.pathB}</span>
            <span
              className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* 雙向無縫機率進度條 */}
        <div
          className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800"
          role="progressbar"
          aria-valuenow={pct0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${t.common.pathA} ${pct0}%, ${t.common.pathB} ${pct1}%`}
        >
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300 ease-out"
            style={{ width: `${pct0}%` }}
          />
          <div
            className="h-full bg-gradient-to-l from-cyan-500 to-cyan-300 transition-all duration-300 ease-out"
            style={{ width: `${pct1}%` }}
          />
        </div>
      </div>

      {/* 2. 核心量子操作按鈕列 */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={handleHadamard}
          disabled={isAnimating}
          className="min-h-[46px] px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white
                     bg-purple-600/90 border border-purple-400/40 shadow-lg shadow-purple-950/50
                     hover:bg-purple-500 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none
                     transition-all flex items-center justify-center gap-1.5"
        >
          <span aria-hidden="true">🕹️</span>
          <span className="truncate">{t.common.splitBeam}</span>
        </button>

        <button
          type="button"
          onClick={handleCollapse}
          disabled={isAnimating}
          className="min-h-[46px] px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-950
                     bg-cyan-400 border border-cyan-200/60 shadow-lg shadow-cyan-950/50
                     hover:bg-cyan-300 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none
                     transition-all flex items-center justify-center gap-1.5"
        >
          <span aria-hidden="true">📸</span>
          <span className="truncate">{t.common.measure}</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={isAnimating}
          className="min-h-[46px] px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-200
                     bg-slate-800/90 border border-slate-700/80 shadow-lg
                     hover:bg-slate-700 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none
                     transition-all flex items-center justify-center gap-1.5"
        >
          <span aria-hidden="true">↺</span>
          <span className="truncate">{resetLabel}</span>
        </button>
      </div>
    </div>
  );
};
