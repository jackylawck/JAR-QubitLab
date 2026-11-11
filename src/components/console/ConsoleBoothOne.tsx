// src/components/console/ConsoleBoothOne.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { useEffect, useRef } from 'react';
import { useQuantumStore } from '../../store/quantumStore';
import { useLocaleStore } from '../../store/localeStore';
import { sound } from '../../audio/soundEngine';
import { acquireAnimationLock } from '../../hooks/useAnimationLock';

export function ConsoleBoothOne({
  isExplaining,
  setIsExplaining,
}: {
  isExplaining: boolean;
  setIsExplaining: (v: boolean) => void;
}) {
  const t = useLocaleStore((state) => state.t);
  const locale = useLocaleStore((state) => state.locale);
  
  // 🌟 使用 Selector 避免無關狀態 (如 phaseAngle) 變更時觸發非預期重渲染
  const amplitudes = useQuantumStore((s) => s.amplitudes);
  const applyGate = useQuantumStore((s) => s.applyGate);
  const collapse = useQuantumStore((s) => s.collapse);

  const timerRef = useRef<number | null>(null);
  const lockReleaseRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      lockReleaseRef.current?.();
      lockReleaseRef.current = null;
    };
  }, []);

  const p0 = (amplitudes[0]?.modulus ?? 0) ** 2 + (amplitudes[1]?.modulus ?? 0) ** 2;
  const p1 = (amplitudes[2]?.modulus ?? 0) ** 2 + (amplitudes[3]?.modulus ?? 0) ** 2;

  const handleLever = () => {
    sound.playLever();
    applyGate('H', [0]);

    lockReleaseRef.current?.();
    if (timerRef.current !== null) clearTimeout(timerRef.current);

    lockReleaseRef.current = acquireAnimationLock();
    timerRef.current = window.setTimeout(() => {
      lockReleaseRef.current?.();
      lockReleaseRef.current = null;
      timerRef.current = null;
    }, 400);
  };

  const handleMeasure = () => {
    sound.playShutter();
    collapse();

    lockReleaseRef.current?.();
    if (timerRef.current !== null) clearTimeout(timerRef.current);

    lockReleaseRef.current = acquireAnimationLock();
    timerRef.current = window.setTimeout(() => {
      lockReleaseRef.current?.();
      lockReleaseRef.current = null;
      timerRef.current = null;
    }, 350);
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-slate-400">STATE:</span>
          <span className="text-sky-400">|0⟩ {(p0 * 100).toFixed(0)}%</span>
          <span className="text-slate-600">|</span>
          <span className="text-rose-400">|1⟩ {(p1 * 100).toFixed(0)}%</span>
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
        <div className="grid grid-cols-2 gap-3 py-2">
          <button
            type="button"
            onClick={handleLever}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 active:scale-95 transition-transform shadow-lg cursor-pointer"
          >
            <span className="text-2xl mb-1">🕹️</span>
            <span className="font-bold text-sm text-sky-300">{t.common.splitBeam}</span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">Hadamard (H)</span>
          </button>

          <button
            type="button"
            onClick={handleMeasure}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-600/40 active:scale-95 transition-transform shadow-lg cursor-pointer"
          >
            <span className="text-2xl mb-1">📸</span>
            <span className="font-bold text-sm text-amber-300">{t.common.measure}</span>
            <span className="text-[10px] text-amber-500/70 font-mono mt-0.5">Collapse State</span>
          </button>
        </div>
      ) : (
        <div className="text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[140px] py-1">
          <p>{t.boothOne.explanation}</p>
        </div>
      )}

      <div className="flex justify-between items-center text-[10px] text-slate-600 font-mono pt-1">
        <span>STATUS: READY</span>
        <span>J.A.R. QUANTUM ENGINE v3.0</span>
      </div>
    </div>
  );
}
