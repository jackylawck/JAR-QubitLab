// src/components/console/ConsoleBoothFour.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Theme: EVA-00 Soul Transfer & MAGI Transmission Console
 */
import { useRef, useEffect, useCallback } from 'react';
import { useTeleportStore } from '../../store/teleportStore';
import { useLocaleStore } from '../../store/localeStore';
import { useAnimationLock } from '../../hooks/useAnimationLock';
import { sound } from '../../audio/soundEngine';

const BIT_LABELS = ['00', '01', '10', '11'];
const CORRECTION_GATES = ['I (None)', 'X Gate', 'Z Gate', 'XZ Gates'];

interface ConsoleBoothFourProps {
  isExplaining: boolean;
  setIsExplaining: (v: boolean) => void;
}

export const ConsoleBoothFour = ({ isExplaining, setIsExplaining }: ConsoleBoothFourProps) => {
  const {
    phase,
    aliceTheta,
    alicePhi,
    classicalBits,
    lastUserBits,
    fidelity,
    isBlindMode,
    failedCount,
    setAliceState,
    createBellPair,
    measureAlice,
    applyCorrection,
    retryCorrection,
    reset,
    toggleBlindMode,
  } = useTeleportStore();

  const locale = useLocaleStore((s) => s.locale);
  const { isAnimating, requestActionLock } = useAnimationLock();

  const soundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (soundTimerRef.current !== null) clearTimeout(soundTimerRef.current);
    };
  }, []);

  const executeAction = useCallback(
    (durationMs: number, action: () => void, soundEffect: () => void) => {
      if (isAnimating) return;
      requestActionLock(durationMs);
      soundEffect();
      action();
    },
    [isAnimating, requestActionLock]
  );

  const handleThetaChange = (val: string) => setAliceState((parseInt(val, 10) / 100) * Math.PI, alicePhi);
  const handlePhiChange = (val: string) => setAliceState(aliceTheta, (parseInt(val, 10) / 100) * 2 * Math.PI);

  const handleApplyCorrection = (bits: 0 | 1 | 2 | 3) => {
    if (useTeleportStore.getState().phase !== 'correct' || isAnimating) return;

    sound.playTick(1);
    requestActionLock(500);
    applyCorrection(bits);

    if (soundTimerRef.current !== null) clearTimeout(soundTimerRef.current);
    soundTimerRef.current = setTimeout(() => {
      const currentPhase = useTeleportStore.getState().phase;
      if (currentPhase === 'success') sound.playSuccess();
      else if (currentPhase === 'failed') sound.playFail();
      soundTimerRef.current = null;
    }, 100);
  };

  const failureMessage =
    phase === 'failed' && lastUserBits !== null && classicalBits !== null
      ? isBlindMode && failedCount === 1
        ? locale === 'zh'
          ? '❌ 修正排斥。請觀察空殼（實體柱）與目標靈魂（幽靈殼）的差異：高度不同需 X 閘，顏色相反需 Z 閘。'
          : "❌ Rejection. Compare solid pillars with the ghost target: height difference needs X, color opposition needs Z."
        : locale === 'zh'
        ? `❌ 你輸入了 [${isBlindMode ? '?' : BIT_LABELS[lastUserBits]}] ${CORRECTION_GATES[lastUserBits]}，但 MAGI 正確解析應為 [${isBlindMode ? '?' : BIT_LABELS[classicalBits]}] ${CORRECTION_GATES[classicalBits]}。`
        : `❌ You entered [${isBlindMode ? '?' : BIT_LABELS[lastUserBits]}] ${CORRECTION_GATES[lastUserBits]}, but MAGI parsed [${isBlindMode ? '?' : BIT_LABELS[classicalBits]}] ${CORRECTION_GATES[classicalBits]}.`
      : null;

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col pointer-events-auto transition-all select-none">
      
      {/* 頂部：EVA-00 傳輸狀態列 */}
      <div className="flex justify-between items-end mb-2 px-2 pb-2 border-b border-slate-800">
        <div className="flex items-baseline gap-2 sm:gap-4 text-xs font-mono">
          <span className="text-slate-400">PROTOCOL:</span>
          <span className="text-orange-500 font-bold uppercase">EVA-00 TRANSFER ({phase})</span>
        </div>

        <div className="flex gap-2">
          {/* 盲測模式 / 傀儡系統 (Dummy System) */}
          <button
            onClick={() => executeAction(100, toggleBlindMode, () => sound.playTick(0))}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
              isBlindMode 
                ? 'bg-orange-950/50 text-orange-400 border-orange-900/50 shadow-[0_0_8px_rgba(249,115,22,0.3)]' 
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            {isBlindMode ? (locale === 'zh' ? 'DUMMY SYSTEM: ON' : 'BLIND (DUMMY): ON') : locale === 'zh' ? 'DUMMY SYSTEM: OFF' : 'BLIND: OFF'}
          </button>

          {/* MAGI 經典位元訊號 */}
          {classicalBits !== null && !isBlindMode && (
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-900/50">
              MAGI SIGNAL: {BIT_LABELS[classicalBits]}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 px-2">
        {isExplaining ? (
          <div className="text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[140px] py-2 px-3 font-sans flex-1 border border-slate-800/60 rounded-xl bg-slate-900/40">
            <p>
              {locale === 'zh'
                ? '量子隱形傳態利用預先共享的貝爾糾纏對與兩位元經典通訊（MAGI），將未知量子態（靈魂）從 Alice 精確轉移至 Bob（空殼容器），過程中舊態必須坍縮（不可克隆定理）。'
                : 'Quantum teleportation reconstructs an unknown state (Soul) from Alice to Bob (Vessel) using a shared Bell pair and MAGI classical bits, strictly obeying the No-Cloning Theorem.'}
            </p>
          </div>
        ) : (
          <>
            {phase === 'prepare' && (
              <div className="flex flex-col gap-3 h-full justify-center px-2">
                <div className="grid grid-cols-2 gap-6">
                  {/* Alice (山吹橙) 狀態準備 */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-slate-400 flex justify-between">
                      <span>θ (Latitude)</span>
                      <span className="text-orange-400 font-bold">{(aliceTheta / Math.PI).toFixed(2)}π</span>
                    </label>
                    <input
                      type="range"
                      min="0" max="100"
                      value={Math.round((aliceTheta / Math.PI) * 100)}
                      onChange={(e) => handleThetaChange(e.target.value)}
                      className="accent-orange-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-slate-400 flex justify-between">
                      <span>φ (Longitude)</span>
                      <span className="text-orange-400 font-bold">{(alicePhi / Math.PI).toFixed(2)}π</span>
                    </label>
                    <input
                      type="range"
                      min="0" max="100"
                      value={Math.round((alicePhi / (2 * Math.PI)) * 100)}
                      onChange={(e) => handlePhiChange(e.target.value)}
                      className="accent-orange-500 cursor-pointer"
                    />
                  </div>
                </div>
                
                {/* 啟動連結按鈕 (EVA-00 主題色) */}
                <button
                  onClick={() => executeAction(400, createBellPair, () => sound.playMerge())}
                  disabled={isAnimating}
                  className="mt-3 py-3.5 bg-orange-950/40 border border-orange-600/50 rounded-xl hover:bg-orange-900/60 hover:border-orange-500 transition-all active:scale-95 text-sm font-bold text-orange-400 shadow-lg shadow-orange-950/50 disabled:opacity-50"
                >
                  {locale === 'zh' ? '啟動 MAGI 糾纏連結 (q1, q2)' : 'Establish MAGI Link (q1, q2)'}
                </button>
              </div>
            )}

            {phase === 'measure' && (
              <div className="flex flex-col items-center justify-center h-full px-2">
                <p className="text-xs text-slate-400 mb-5 text-center leading-relaxed">
                  {locale === 'zh'
                    ? '連結已建立。執行測量後，Alice 的本體將坍縮，並透過 MAGI 傳送 2-bit 經典訊號至 Bob 端的空殼。'
                    : "Link established. Measurement will collapse Alice's state and transmit 2-bit classical signal via MAGI to Bob's vessel."}
                </p>
                <button
                  onClick={() => executeAction(600, measureAlice, () => sound.playTeleport())}
                  disabled={isAnimating}
                  className="w-full py-4 bg-amber-950/40 border border-amber-600/50 rounded-xl hover:bg-amber-900/60 hover:border-amber-500 transition-all active:scale-95 text-[13px] sm:text-sm font-bold text-amber-400 shadow-lg shadow-amber-950/50 disabled:opacity-50"
                >
                  {locale === 'zh' ? '執行靈魂轉移 (貝爾測量)' : 'Execute Soul Transfer (Bell Measurement)'}
                </button>
              </div>
            )}

            {phase === 'correct' && classicalBits !== null && (
              <div className="flex flex-col h-full justify-center">
                <p className="text-[10px] sm:text-xs text-sky-400 mb-3 text-center animate-pulse font-mono">
                  {isBlindMode
                    ? locale === 'zh'
                      ? 'Bob 已收到 MAGI 訊號。請透過視覺，選擇能將「空殼(實體)」吻合至「目標(幽靈)」的修正閘：'
                      : 'MAGI signal received. Visually select the gate to match the solid Vessel to the Ghost target:'
                    : locale === 'zh'
                    ? `Bob 收到 MAGI 訊號 [ ${BIT_LABELS[classicalBits]} ]，請注入對應的修正閘：`
                    : `Bob received MAGI [ ${BIT_LABELS[classicalBits]} ]. Inject correction gate:`}
                </p>
                {/* 修正閘 (Bob 端的初期藍) */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[0, 1, 2, 3].map((bits) => (
                    <button
                      key={bits}
                      onClick={() => handleApplyCorrection(bits as 0 | 1 | 2 | 3)}
                      disabled={isAnimating}
                      className="py-2.5 bg-slate-900 border border-slate-700 rounded-xl hover:border-sky-500 hover:bg-sky-950/30 transition-all active:scale-95 text-xs font-mono font-bold text-slate-300 hover:text-sky-400 disabled:opacity-50"
                    >
                      {!isBlindMode && <span className="opacity-40 mr-2 font-normal">[{BIT_LABELS[bits]}]</span>}
                      {CORRECTION_GATES[bits]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(phase === 'success' || phase === 'failed') && (
              <div
                className={`flex flex-col items-center justify-center h-full rounded-xl border ${
                  phase === 'success' ? 'bg-orange-950/30 border-orange-500/50' : 'bg-rose-950/30 border-rose-500/50'
                }`}
              >
                <p className={`text-sm font-bold mb-1 ${phase === 'success' ? 'text-orange-400' : 'text-rose-400'}`}>
                  {phase === 'success'
                    ? locale === 'zh' ? '✨ 靈魂轉移成功！' : '✨ Soul Transfer Complete!'
                    : locale === 'zh' ? '❌ 轉移失敗 (排斥反應)' : '❌ Transfer Failed (Rejection)'}
                </p>

                <div className="flex flex-col items-center mb-3 px-4 text-center">
                  <span className={`text-[10px] font-mono mb-1 ${fidelity > 0.99 ? 'text-orange-400' : 'text-rose-400'}`}>
                    SYNC RATIO (FIDELITY) = {(fidelity * 100).toFixed(1)}%
                  </span>

                  {phase === 'failed' && fidelity > 0.99 ? (
                    <p className="text-[10px] text-amber-400 leading-tight">
                      {locale === 'zh'
                        ? '⚠️ 巧合：注入的修正閘錯誤，但設定的初始態恰好對這個錯誤免疫。請嘗試其他 θ/φ 角度！'
                        : '⚠️ Coincidence: Wrong gate injected, but initial state was immune. Try another angle!'}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {phase === 'success'
                        ? locale === 'zh'
                          ? 'Bob 的空殼已完美重塑為 Alice 最初設定的靈魂目標態。'
                          : "Bob's vessel collapsed perfectly into Alice's initial soul state."
                        : failureMessage}
                    </p>
                  )}
                </div>

                {phase === 'failed' && isBlindMode && failedCount < 2 ? (
                  <div className="flex gap-4">
                    <button
                      onClick={() => executeAction(300, retryCorrection, () => sound.playLever())}
                      disabled={isAnimating}
                      className="px-6 py-1.5 bg-amber-950/50 text-amber-400 border border-amber-900/50 rounded hover:bg-amber-900/50 transition-colors text-xs font-bold disabled:opacity-50"
                    >
                      {locale === 'zh' ? '重新修正' : 'RETRY'}
                    </button>
                    <button
                      onClick={() => executeAction(300, reset, () => sound.playLever())}
                      disabled={isAnimating}
                      className="px-6 py-1.5 bg-slate-900 border border-slate-700 text-slate-400 rounded hover:bg-slate-800 transition-colors text-xs disabled:opacity-50"
                    >
                      {locale === 'zh' ? '重新開始' : 'RESTART'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => executeAction(300, reset, () => sound.playLever())}
                    disabled={isAnimating}
                    className="px-6 py-1.5 bg-slate-900 border border-slate-600 rounded hover:bg-white hover:text-black transition-colors text-[11px] font-bold font-mono disabled:opacity-50"
                  >
                    {locale === 'zh' ? '重置系統 (RESET)' : 'RESET SYSTEM'}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 底部功能列 */}
      <div className="flex justify-between items-center mt-2 px-2">
        <button
          onClick={() => setIsExplaining(!isExplaining)}
          className="text-[10px] text-sky-400 hover:text-sky-300 font-mono transition-colors active:scale-95"
        >
          [ {isExplaining ? (locale === 'zh' ? '關閉解析' : 'CLOSE THEORY') : locale === 'zh' ? '戰術解析' : 'THEORY'} ]
        </button>
        <button
          onClick={() => executeAction(300, reset, () => sound.playLever())}
          disabled={isAnimating}
          className="text-[10px] text-slate-500 hover:text-white transition-colors font-mono active:scale-95 disabled:opacity-30"
        >
          [ ABORT PROTOCOL ]
        </button>
      </div>
    </div>
  );
};
