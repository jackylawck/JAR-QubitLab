// src/components/console/ConsoleBoothOne.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Description: Booth 1 Superposition & Wavefunction Collapse Control Console (EVA-01 Theme)
 */
import { useEffect, useRef } from 'react';
import { useQuantumStore } from '../../store/quantumStore';
import { useLocaleStore } from '../../store/localeStore';
import { sound } from '../../audio/soundEngine';
import { acquireAnimationLock, useAnimationLock } from '../../hooks/useAnimationLock';
import { QUANTUM_CONFIG } from '../../constants';

export const ConsoleBoothOne = () => {
  const t = useLocaleStore((s) => s.t);
  const isLocked = useAnimationLock();

  const amplitudes = useQuantumStore((s) => s.amplitudes);
  const applyGate = useQuantumStore((s) => s.applyGate);
  const collapse = useQuantumStore((s) => s.collapse);
  const reset = useQuantumStore((s) => s.reset);

  const actionTimerRef = useRef<number | null>(null);
  const lockReleaseRef = useRef<(() => void) | null>(null);

  // 嚴格遵守 noUncheckedIndexedAccess 防護並計算邊際機率 P(|0⟩) 與 P(|1⟩)
  const p0Raw = (amplitudes[0]?.modulus ?? 0) ** 2 + (amplitudes[1]?.modulus ?? 0) ** 2;
  const p1Raw = (amplitudes[2]?.modulus ?? 0) ** 2 + (amplitudes[3]?.modulus ?? 0) ** 2;

  // 消除極微浮點數誤差並正規化顯示百分比
  const p0 = p0Raw < QUANTUM_CONFIG.EPSILON ? 0 : Math.min(1, p0Raw);
  const p1 = p1Raw < QUANTUM_CONFIG.EPSILON ? 0 : Math.min(1, p1Raw);
  const pct0 = Math.round(p0 * 100);
  const pct1 = Math.round(p1 * 100);

  // 判定目前是否處於有效疊加態（兩路機率皆大於 1%）
  const isSuperposition = p0 > 0.01 && p1 > 0.01;

  // 卸載時確保釋放計時器與動畫全域鎖，杜絕狀態死鎖
  useEffect(() => {
    return () => {
      if (actionTimerRef.current !== null) clearTimeout(actionTimerRef.current);
      lockReleaseRef.current?.();
      lockReleaseRef.current = null;
    };
  }, []);

  const triggerWithLock = (durationMs: number, action: () => void) => {
    if (isLocked) return;

    action();

    lockReleaseRef.current?.();
    if (actionTimerRef.current !== null) clearTimeout(actionTimerRef.current);

    lockReleaseRef.current = acquireAnimationLock();
    actionTimerRef.current = window.setTimeout(() => {
      lockReleaseRef.current?.();
      lockReleaseRef.current = null;
      actionTimerRef.current = null;
    }, durationMs);
  };

  const handleHadamard = () => {
    triggerWithLock(400, () => {
      sound.playLever();
      applyGate('H', [0]);
    });
  };

  const handleCollapse = () => {
    triggerWithLock(350, () => {
      sound.playShutter();
      collapse();
    });
  };

  const handleReset = () => {
    triggerWithLock(250, () => {
      sound.playLever();
      reset();
    });
  };

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
            <span className="font-mono font-bold text-purple-400 tabular-nums">
              {pct0}%
            </span>
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
            <span className="font-mono font-bold text-cyan-400 tabular-nums">
              {pct1}%
            </span>
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

      {/* 2. 核心量子操作按鈕列（最小觸控熱區 >= 44px，具備防連點動畫鎖） */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* 施加 Hadamard 分光閘 */}
        <button
          type="button"
          onClick={handleHadamard}
          disabled={isLocked}
          className="min-h-[46px] px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white
                     bg-purple-600/90 border border-purple-400/40 shadow-lg shadow-purple-950/50
                     hover:bg-purple-500 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none
                     transition-all flex items-center justify-center gap-1.5"
        >
          <span aria-hidden="true">🕹️</span>
          <span className="truncate">{t.common.splitBeam} (H)</span>
        </button>

        {/* 觀測坍縮快門 */}
        <button
          type="button"
          onClick={handleCollapse}
          disabled={isLocked}
          className="min-h-[46px] px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-950
                     bg-cyan-400 border border-cyan-200/60 shadow-lg shadow-cyan-950/50
                     hover:bg-cyan-300 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none
                     transition-all flex items-center justify-center gap-1.5"
        >
          <span aria-hidden="true">📸</span>
          <span className="truncate">{t.common.measure}</span>
        </button>

        {/* 重置至基態 |0⟩ */}
        <button
          type="button"
          onClick={handleReset}
          disabled={isLocked}
          className="min-h-[46px] px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-200
                     bg-slate-800/90 border border-slate-700/80 shadow-lg
                     hover:bg-slate-700 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none
                     transition-all flex items-center justify-center gap-1.5"
        >
          <span aria-hidden="true">↺</span>
          <span className="truncate">{t.common.reset}</span>
        </button>
      </div>
    </div>
  );
};
