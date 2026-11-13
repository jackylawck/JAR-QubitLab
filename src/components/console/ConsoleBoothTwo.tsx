// src/components/console/ConsoleBoothTwo.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Theme: EVA-02 (Asuka Red & Yellow)
 */
import { useCallback } from 'react';
import { useQuantumStore } from '../../store/quantumStore';
import { useLocaleStore } from '../../store/localeStore';
import { sound } from '../../audio/soundEngine';
import { useAnimationLock } from '../../hooks/useAnimationLock';

export function ConsoleBoothTwo({
  isExplaining,
  setIsExplaining,
}: {
  isExplaining: boolean;
  setIsExplaining: (v: boolean) => void;
}) {
  const t = useLocaleStore((state) => state.t);
  const locale = useLocaleStore((state) => state.locale);
  const { isAnimating, requestActionLock } = useAnimationLock();
  
  const isSplit = useQuantumStore((s) => s.isSplit);
  const phaseAngle = useQuantumStore((s) => s.phaseAngle);
  const splitBoothTwo = useQuantumStore((s) => s.splitBoothTwo);
  const setPhaseAngle = useQuantumStore((s) => s.setPhaseAngle);
  const collideBoothTwo = useQuantumStore((s) => s.collideBoothTwo);

  // 將動作觸發與安全解鎖邏輯收斂
  const executeAction = useCallback(
    (durationMs: number, action: () => void, soundEffect: () => void) => {
      if (isAnimating) return;
      requestActionLock(durationMs);
      soundEffect();
      action();
    },
    [isAnimating, requestActionLock]
  );

  const handleSplit = () => {
    if (isSplit) return;
    executeAction(450, splitBoothTwo, () => sound.playLever());
  };

  const handlePhaseStep = (targetAngle: number, stepIndex: number) => {
    executeAction(100, () => setPhaseAngle(targetAngle), () => sound.playTick(stepIndex));
  };

  const handleCollide = () => {
    if (!isSplit) return;
    executeAction(600, collideBoothTwo, () => sound.playEvaporate());
  };

  const deg = Math.round((phaseAngle * 180) / Math.PI);

  return (
    <div className="flex flex-col h-full justify-between select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">PHASE:</span>
          {/* 🌟 EVA-02 配色：0° 使用明日香紅 (Red)，180° 使用亮黃 (Yellow) */}
          <span className={deg === 180 ? 'text-yellow-400 font-bold' : 'text-red-400 font-bold'}>
            {deg}° {deg === 0 ? '(同相)' : deg === 180 ? '(反相 π)' : ''}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsExplaining(!isExplaining)}
          className="text-[11px] text-sky-400 hover:text-sky-300 font-bold px-2 py-0.5 rounded bg-sky-950/50 border border-sky-800/40 cursor-pointer"
        >
          {isExplaining ? (locale === 'zh' ? '收起說明' : 'Hide Info') : (locale === 'zh' ? '原理解析 💡' : 'Theory 💡')}
        </button>
      </div>

      {!isExplaining ? (
        <div className="grid grid-cols-3 gap-2 py-2 items-center">
          {/* 🌟 EVA-02 配色：分光按鈕改為二號機主裝甲紅 (Red-600) */}
          <button
            type="button"
            onClick={handleSplit}
            disabled={isSplit || isAnimating}
            className={`p-2.5 rounded-xl flex flex-col items-center justify-center transition-all ${
              !isSplit
                ? 'bg-red-600/30 border border-red-500/50 text-red-200 shadow-md shadow-red-900/20 active:scale-95 cursor-pointer'
                : 'bg-slate-800/40 border border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <span className="text-lg" aria-hidden="true">🔀</span>
            <span className="text-xs font-bold mt-1">① {t.common.splitBeam}</span>
          </button>

          <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 mb-1">② 相位控制</span>
            <div className="flex gap-1 w-full justify-center">
              <button
                type="button"
                disabled={!isSplit || isAnimating}
                onClick={() => handlePhaseStep(0, 0)}
                className={`flex-1 py-1 text-[11px] font-mono rounded font-bold transition-colors ${
                  deg === 0 ? 'bg-red-500 text-white shadow-[0_0_8px_#ef4444]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                } ${!isSplit ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                0
              </button>
              <button
                type="button"
                disabled={!isSplit || isAnimating}
                onClick={() => handlePhaseStep(Math.PI / 2, 1)}
                className={`flex-1 py-1 text-[11px] font-mono rounded font-bold transition-colors ${
                  deg === 90 ? 'bg-orange-500 text-white shadow-[0_0_8px_#f97316]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                } ${!isSplit ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                π/2
              </button>
              <button
                type="button"
                disabled={!isSplit || isAnimating}
                onClick={() => handlePhaseStep(Math.PI, 2)}
                className={`flex-1 py-1 text-[11px] font-mono rounded font-bold transition-colors ${
                  deg === 180 ? 'bg-yellow-500 text-black shadow-[0_0_8px_#eab308]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                } ${!isSplit ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                π
              </button>
            </div>
          </div>

          {/* 🌟 EVA-02 配色：干涉對撞按鈕維持高亮對比的亮黃 (Yellow/Amber) */}
          <button
            type="button"
            onClick={handleCollide}
            disabled={!isSplit || isAnimating}
            className={`p-2.5 rounded-xl flex flex-col items-center justify-center transition-all ${
              isSplit
                ? 'bg-amber-600/30 border border-amber-500/50 text-amber-200 shadow-md shadow-amber-900/20 active:scale-95 animate-pulse cursor-pointer'
                : 'bg-slate-800/40 border border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <span className="text-lg" aria-hidden="true">💥</span>
            <span className="text-xs font-bold mt-1">③ {t.common.interfere}</span>
          </button>
        </div>
      ) : (
        <div className="text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[140px] py-1">
          {/* 安全防護：加上可選串連運算子，避免多語系字典未實作時報錯 */}
          <p>{t.boothTwo?.explanation ?? 'Interference Bench Theory'}</p>
        </div>
      )}

      <div className="flex justify-between items-center text-[10px] text-slate-600 font-mono pt-1 border-t border-slate-800/50">
        <span>MODE: {isSplit ? 'SPLIT (ACTIVE)' : 'BASE'}</span>
        <span>EVA-02 BENCH</span>
      </div>
    </div>
  );
}
