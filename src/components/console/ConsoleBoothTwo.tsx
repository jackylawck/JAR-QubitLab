// src/components/console/ConsoleBoothTwo.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { useQuantumStore } from '../../store/quantumStore';
import { useLocaleStore } from '../../store/localeStore';
import { sound } from '../../audio/soundEngine';
import { acquireAnimationLock } from '../../hooks/useAnimationLock';

export function ConsoleBoothTwo({
  isExplaining,
  setIsExplaining,
}: {
  isExplaining: boolean;
  setIsExplaining: (v: boolean) => void;
}) {
  const t = useLocaleStore((state) => state.t);
  const locale = useLocaleStore((state) => state.locale);
  const { isSplit, phaseAngle, splitBoothTwo, setPhaseAngle, collideBoothTwo } = useQuantumStore();

  const handleSplit = () => {
    if (isSplit) return;
    sound.playLever();
    splitBoothTwo();
    const release = acquireAnimationLock(500);
    setTimeout(release, 450);
  };

  const handlePhaseStep = (targetAngle: number) => {
    sound.playTick(1.2);
    setPhaseAngle(targetAngle);
    const release = acquireAnimationLock(200);
    setTimeout(release, 100);
  };

  const handleCollide = () => {
    if (!isSplit) return;
    sound.playEvaporate();
    collideBoothTwo();
    const release = acquireAnimationLock(700);
    setTimeout(release, 600);
  };

  const deg = Math.round((phaseAngle * 180) / Math.PI);

  return (
    <div className="flex flex-col h-full justify-between">
      {/* 儀表狀態列 */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">PHASE:</span>
          <span className={deg === 180 ? 'text-pink-400 font-bold' : 'text-sky-400 font-bold'}>
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
          {/* ① 分光 */}
          <button
            type="button"
            onClick={handleSplit}
            disabled={isSplit}
            className={`p-2.5 rounded-xl flex flex-col items-center justify-center transition-all ${
              !isSplit
                ? 'bg-blue-600/30 border border-blue-500/50 text-blue-200 shadow-md active:scale-95 cursor-pointer'
                : 'bg-slate-800/40 border border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <span className="text-lg">🔀</span>
            <span className="text-xs font-bold mt-1">① {t.common.splitBeam}</span>
          </button>

          {/* ② 快速相位卡榫選擇器 */}
          <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 mb-1">② 相位控制</span>
            <div className="flex gap-1 w-full justify-center">
              <button
                type="button"
                disabled={!isSplit}
                onClick={() => handlePhaseStep(0)}
                className={`flex-1 py-1 text-[11px] font-mono rounded font-bold transition-colors ${
                  deg === 0 ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
                } ${!isSplit ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                0
              </button>
              <button
                type="button"
                disabled={!isSplit}
                onClick={() => handlePhaseStep(Math.PI / 2)}
                className={`flex-1 py-1 text-[11px] font-mono rounded font-bold transition-colors ${
                  deg === 90 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                } ${!isSplit ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                π/2
              </button>
              <button
                type="button"
                disabled={!isSplit}
                onClick={() => handlePhaseStep(Math.PI)}
                className={`flex-1 py-1 text-[11px] font-mono rounded font-bold transition-colors ${
                  deg === 180 ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'
                } ${!isSplit ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                π
              </button>
            </div>
          </div>

          {/* ③ 對撞干涉 */}
          <button
            type="button"
            onClick={handleCollide}
            disabled={!isSplit}
            className={`p-2.5 rounded-xl flex flex-col items-center justify-center transition-all ${
              isSplit
                ? 'bg-amber-600/30 border border-amber-500/50 text-amber-200 shadow-md active:scale-95 animate-pulse cursor-pointer'
                : 'bg-slate-800/40 border border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <span className="text-lg">💥</span>
            <span className="text-xs font-bold mt-1">③ {t.common.interfere}</span>
          </button>
        </div>
      ) : (
        <div className="text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[140px] py-1">
          {locale === 'zh' ? (
            <p>
              若為 0° 同相，對撞後右路消亡，能量 100% 匯聚至 Path A；若翻轉為 π（180°）反相，左路相消蒸發，機率 100% 被搬運至 Path B！
            </p>
          ) : (
            <p>
              In-phase (0°): Destructive interference eliminates Path B, 100% amplitude stays in Path A. Anti-phase (π): Path A cancels out and 100% amplitude is transported into Path B!
            </p>
          )}
        </div>
      )}

      <div className="flex justify-between items-center text-[10px] text-slate-600 font-mono pt-1">
        <span>MODE: {isSplit ? 'SPLIT (ACTIVE)' : 'BASE'}</span>
        <span>INTERFERENCE BENCH</span>
      </div>
    </div>
  );
}
