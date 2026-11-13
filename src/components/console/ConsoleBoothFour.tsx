// src/components/console/ConsoleBoothFour.tsx
import { useRef, useEffect } from 'react';
import { useTeleportStore } from '../../store/teleportStore';
import { useLocaleStore } from '../../store/localeStore';
import { acquireAnimationLock } from '../../hooks/useAnimationLock';
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

  const lockReleaseRef = useRef<(() => void) | null>(null);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const requestActionLock = (duration: number = 500) => {
    if (lockTimerRef.current !== null) clearTimeout(lockTimerRef.current);
    if (lockReleaseRef.current) {
      lockReleaseRef.current();
      lockReleaseRef.current = null;
    }
    lockReleaseRef.current = acquireAnimationLock();
    lockTimerRef.current = setTimeout(() => {
      if (lockReleaseRef.current) {
        lockReleaseRef.current();
        lockReleaseRef.current = null;
      }
      lockTimerRef.current = null;
    }, duration);
  };

  useEffect(() => {
    return () => {
      if (soundTimerRef.current !== null) clearTimeout(soundTimerRef.current);
      if (lockTimerRef.current !== null) clearTimeout(lockTimerRef.current);
      if (lockReleaseRef.current) {
        lockReleaseRef.current();
        lockReleaseRef.current = null;
      }
    };
  }, []);

  const handleThetaChange = (val: string) => setAliceState((parseInt(val, 10) / 100) * Math.PI, alicePhi);
  const handlePhiChange = (val: string) => setAliceState(aliceTheta, (parseInt(val, 10) / 100) * 2 * Math.PI);

  const handleApplyCorrection = (bits: 0 | 1 | 2 | 3) => {
    if (useTeleportStore.getState().phase !== 'correct') return;

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
          ? '❌ 你的選擇不正確。請觀察 Bob 的實體柱與目標態（幽靈殼）的差異：高度不同需 X 閘，顏色相反需 Z 閘。'
          : "❌ Incorrect. Compare Bob's solid pillars with the ghost target: height difference needs X, color opposition needs Z."
        : locale === 'zh'
        ? `❌ 你選了 [${isBlindMode ? '?' : BIT_LABELS[lastUserBits]}] ${CORRECTION_GATES[lastUserBits]}，但正確是 [${isBlindMode ? '?' : BIT_LABELS[classicalBits]}] ${CORRECTION_GATES[classicalBits]}。`
        : `❌ You chose [${isBlindMode ? '?' : BIT_LABELS[lastUserBits]}] ${CORRECTION_GATES[lastUserBits]}, but the correct is [${isBlindMode ? '?' : BIT_LABELS[classicalBits]}] ${CORRECTION_GATES[classicalBits]}.`
      : null;

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col pointer-events-auto transition-all">
      <div className="flex justify-between items-end mb-2 px-2">
        <div className="flex items-baseline gap-4 text-xs font-mono">
          <span className="text-slate-400">TELEPORT PROTOCOL:</span>
          <span className="text-rose-400 font-bold uppercase">{phase}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              sound.playTick(0);
              toggleBlindMode();
            }}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
              isBlindMode ? 'bg-indigo-950/50 text-indigo-400 border-indigo-900/50' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            {isBlindMode ? (locale === 'zh' ? '盲測模式: ON' : 'BLIND: ON') : locale === 'zh' ? '盲測模式: OFF' : 'BLIND: OFF'}
          </button>

          {classicalBits !== null && !isBlindMode && (
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-900/50">
              BITS: {BIT_LABELS[classicalBits]}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 px-2">
        {isExplaining ? (
          <div className="text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[140px] py-2 px-3 font-sans flex-1 border border-slate-800/60 rounded-xl bg-slate-900/40">
            <p>
              {locale === 'zh'
                ? '量子隱形傳態利用預先共享的貝爾糾纏對（q1, q2）與兩位元經典通訊，將未知量子態 |ψ⟩ 從 Alice（q0）精確重建至 Bob（q2），過程中不會複製量子態（遵守不可克隆定理）。'
                : 'Quantum teleportation reconstructs an unknown state |ψ⟩ from Alice (q0) to Bob (q2) using a shared Bell pair (q1, q2) and 2 classical bits, strictly obeying the No-Cloning Theorem.'}
            </p>
          </div>
        ) : (
          <>
            {phase === 'prepare' && (
              <div className="flex flex-col gap-3 h-full justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-slate-400 flex justify-between">
                      <span>θ (Latitude)</span>
                      <span className="text-sky-400">{(aliceTheta / Math.PI).toFixed(2)}π</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round((aliceTheta / Math.PI) * 100)}
                      onChange={(e) => handleThetaChange(e.target.value)}
                      className="accent-sky-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-slate-400 flex justify-between">
                      <span>φ (Longitude)</span>
                      <span className="text-sky-400">{(alicePhi / Math.PI).toFixed(2)}π</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round((alicePhi / (2 * Math.PI)) * 100)}
                      onChange={(e) => handlePhiChange(e.target.value)}
                      className="accent-sky-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    sound.playMerge();
                    requestActionLock(400);
                    createBellPair();
                  }}
                  className="mt-2 py-3 bg-slate-900 border border-purple-700/50 rounded-xl hover:bg-purple-900/30 hover:border-purple-500 transition-all active:scale-95 text-sm font-bold text-purple-400"
                >
                  {locale === 'zh' ? '建立通訊糾纏對 (q1, q2)' : 'Create Bell Pair (q1, q2)'}
                </button>
              </div>
            )}

            {phase === 'measure' && (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-xs text-slate-400 mb-4 text-center px-4">
                  {locale === 'zh'
                    ? '糾纏對已建立。執行測量後，你將能對比 Bob 當前態與目標態的差異。'
                    : "Bell pair ready. Measure to reveal the difference between Bob's current state and target state."}
                </p>
                <button
                  onClick={() => {
                    sound.playTeleport();
                    requestActionLock(600);
                    measureAlice();
                  }}
                  className="w-full py-4 bg-slate-900 border border-sky-700/50 rounded-xl hover:bg-sky-900/30 hover:border-sky-500 transition-all active:scale-95 text-sm font-bold text-sky-400"
                >
                  {locale === 'zh' ? '執行貝爾測量 (發送經典位元)' : 'Perform Bell Measurement'}
                </button>
              </div>
            )}

            {phase === 'correct' && classicalBits !== null && (
              <div className="flex flex-col h-full justify-center">
                <p className="text-[10px] text-amber-400 mb-2 text-center animate-pulse">
                  {isBlindMode
                    ? locale === 'zh'
                      ? 'Bob 已收到經典訊息。請透過視覺對照，選擇能將實體柱吻合至幽靈殼的修正閘：'
                      : 'Message received. Compare solid pillars with ghost holograms to select correction:'
                    : locale === 'zh'
                    ? `Bob 收到了經典訊息 [ ${BIT_LABELS[classicalBits]} ]，請選擇對應的修正閘：`
                    : `Bob received [ ${BIT_LABELS[classicalBits]} ]. Select correction:`}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((bits) => (
                    <button
                      key={bits}
                      onClick={() => handleApplyCorrection(bits as 0 | 1 | 2 | 3)}
                      className="py-2 bg-slate-900 border border-slate-700 rounded-lg hover:border-amber-500 hover:bg-amber-950/30 transition-all active:scale-95 text-xs font-mono text-slate-300 hover:text-amber-400"
                    >
                      {!isBlindMode && <span className="opacity-50 mr-2">[{BIT_LABELS[bits]}]</span>}
                      {CORRECTION_GATES[bits]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(phase === 'success' || phase === 'failed') && (
              <div
                className={`flex flex-col items-center justify-center h-full rounded-xl border ${
                  phase === 'success' ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-rose-950/30 border-rose-500/50'
                }`}
              >
                <p className={`text-sm font-bold mb-1 ${phase === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {phase === 'success'
                    ? locale === 'zh'
                      ? '✨ 傳態成功！'
                      : '✨ Teleportation Successful!'
                    : locale === 'zh'
                    ? '❌ 修正錯誤'
                    : '❌ Wrong Correction'}
                </p>

                <div className="flex flex-col items-center mb-2 px-4 text-center">
                  <span className={`text-[10px] font-mono mb-1 ${fidelity > 0.99 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    FIDELITY |⟨ψ_orig|ψ_Bob⟩|² = {(fidelity * 100).toFixed(1)}%
                  </span>

                  {phase === 'failed' && fidelity > 0.99 ? (
                    <p className="text-[10px] text-amber-400 leading-tight">
                      {locale === 'zh'
                        ? '⚠️ 巧合：你選的閘錯了，但設定的未知態恰好對這個錯誤免疫。請嘗試其他 θ/φ 角度！'
                        : '⚠️ Coincidence: Wrong gate selected, but the initial state was immune to the error. Try another angle!'}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {phase === 'success'
                        ? locale === 'zh'
                          ? 'Bob 的量子態已完美重塑為 Alice 最初設定的未知態。'
                          : "Bob's qubit collapsed perfectly into Alice's initial state."
                        : failureMessage}
                    </p>
                  )}
                </div>

                {phase === 'failed' && isBlindMode && failedCount < 2 ? (
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        sound.playLever();
                        requestActionLock(300);
                        retryCorrection();
                      }}
                      className="px-6 py-1.5 bg-amber-950/50 text-amber-400 border border-amber-900/50 rounded hover:bg-amber-900/50 transition-colors text-xs font-bold"
                    >
                      {locale === 'zh' ? '再試一次' : 'RETRY'}
                    </button>
                    <button
                      onClick={() => {
                        sound.playLever();
                        requestActionLock(300);
                        reset();
                      }}
                      className="px-6 py-1.5 bg-slate-900 border border-slate-700 text-slate-400 rounded hover:bg-slate-800 transition-colors text-xs"
                    >
                      {locale === 'zh' ? '重新開始' : 'RESTART'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      sound.playLever();
                      requestActionLock(300);
                      reset();
                    }}
                    className="px-6 py-1.5 bg-slate-900 border border-slate-700 rounded hover:bg-white hover:text-black transition-colors text-xs"
                  >
                    {locale === 'zh' ? '重新實驗' : 'RESET PROTOCOL'}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-between items-center mt-2 px-2">
        <button
          onClick={() => setIsExplaining(!isExplaining)}
          className="text-[10px] text-sky-400 hover:text-sky-300 font-mono transition-colors active:scale-95"
        >
          [ {isExplaining ? (locale === 'zh' ? '關閉解析' : 'CLOSE THEORY') : locale === 'zh' ? '原理解析' : 'THEORY'} ]
        </button>
        <button
          onClick={() => {
            sound.playLever();
            reset();
          }}
          className="text-[10px] text-slate-500 hover:text-white transition-colors font-mono active:scale-95"
        >
          [ RESET PROTOCOL ]
        </button>
      </div>
    </div>
  );
};
