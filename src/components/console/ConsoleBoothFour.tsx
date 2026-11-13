// src/components/console/ConsoleBoothFour.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Description: Booth 4 Quantum Teleportation & No-Cloning Theorem Control Console
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
    requestActionLock(650); // 配合 3D LCL 封包飛行時間稍加長防抖鎖
    applyCorrection(bits);

    if (soundTimerRef.current !== null) clearTimeout(soundTimerRef.current);
    soundTimerRef.current = setTimeout(() => {
      const currentPhase = useTeleportStore.getState().phase;
      if (currentPhase === 'success') sound.playSuccess();
      else if (currentPhase === 'failed') sound.playFail();
      soundTimerRef.current = null;
    }, 150);
  };

  const failureMessage =
    phase === 'failed' && lastUserBits !== null && classicalBits !== null
      ? isBlindMode && failedCount === 1
        ? locale === 'zh'
          ? '❌ 修正閘不正確。請對比 Bob 實體柱與目標態（透明玻璃槽）的差異：高度不同需 X 閘，相位相反需 Z 閘。'
          : "❌ Incorrect gate. Compare Bob's solid pillars with the glass tank target: height difference needs X, phase opposition needs Z."
        : locale === 'zh'
        ? `❌ 你選擇了 [${isBlindMode ? '?' : BIT_LABELS[lastUserBits]}] ${CORRECTION_GATES[lastUserBits]}，但正確應為 [${isBlindMode ? '?' : BIT_LABELS[classicalBits]}] ${CORRECTION_GATES[classicalBits]}。`
        : `❌ You selected [${isBlindMode ? '?' : BIT_LABELS[lastUserBits]}] ${CORRECTION_GATES[lastUserBits]}, but the correct gate is [${isBlindMode ? '?' : BIT_LABELS[classicalBits]}] ${CORRECTION_GATES[classicalBits]}.`
      : null;

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col pointer-events-auto transition-all select-none">
      {/* 頂部：量子隱形傳態協定狀態列 */}
      <div className="flex justify-between items-end mb-2 px-2 pb-2 border-b border-slate-800">
        <div className="flex items-baseline gap-2 sm:gap-4 text-xs font-mono">
          <span className="text-slate-400">TELEPORT PROTOCOL:</span>
          {/* 對齊 EVA-00改 的山吹橙 */}
          <span className="text-orange-500 font-bold uppercase">{phase}</span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => executeAction(100, toggleBlindMode, () => sound.playTick(0))}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
              isBlindMode
                ? 'bg-orange-950/50 text-orange-400 border-orange-900/50 shadow-[0_0_8px_rgba(249,115,22,0.3)]'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            {isBlindMode ? (locale === 'zh' ? '盲測模式: ON' : 'BLIND MODE: ON') : locale === 'zh' ? '盲測模式: OFF' : 'BLIND MODE: OFF'}
          </button>

          {/* 對齊 MAGI 通訊的琥珀金 */}
          {classicalBits !== null && !isBlindMode && (
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-900/50">
              CLASSICAL BITS: {BIT_LABELS[classicalBits]}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 px-2">
        {isExplaining ? (
          <div className="text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[140px] py-2 px-3 font-sans flex-1 border border-slate-800/60 rounded-xl bg-slate-900/40">
            <p>
              {locale === 'zh'
                ? '量子隱形傳態利用預先共享的貝爾糾纏對（q1, q2）與兩位元經典通訊，將未知量子態 |ψ⟩ 從 Alice（q0）精確重建至 Bob（q2），過程中 Alice 端的原始量子態必然坍縮（嚴格遵守不可克隆定理）。'
                : 'Quantum teleportation reconstructs an unknown state |ψ⟩ from Alice (q0) to Bob (q2) using a shared Bell pair (q1, q2) and 2 classical bits, strictly obeying the No-Cloning Theorem.'}
            </p>
          </div>
        ) : (
          <>
            {phase === 'prepare' && (
              <div className="flex flex-col gap-3 h-full justify-center px-2">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-slate-400 flex justify-between">
                      <span>θ (Polar Angle)</span>
                      <span className="text-orange-500 font-bold">{(aliceTheta / Math.PI).toFixed(2)}π</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round((aliceTheta / Math.PI) * 100)}
                      onChange={(e) => handleThetaChange(e.target.value)}
                      className="accent-orange-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-slate-400 flex justify-between">
                      <span>φ (Azimuthal Phase)</span>
                      <span className="text-orange-500 font-bold">{(alicePhi / Math.PI).toFixed(2)}π</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round((alicePhi / (2 * Math.PI)) * 100)}
                      onChange={(e) => handlePhiChange(e.target.value)}
                      className="accent-orange-500 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => executeAction(400, createBellPair, () => sound.playMerge())}
                  disabled={isAnimating}
                  className="mt-3 py-3.5 bg-orange-950/40 border border-orange-600/50 rounded-xl hover:bg-orange-900/60 hover:border-orange-500 transition-all active:scale-95 text-sm font-bold text-orange-400 shadow-lg shadow-orange-950/50 disabled:opacity-50"
                >
                  {locale === 'zh' ? '建立通訊糾纏對 (q1, q2)' : 'Create Bell Pair (q1, q2)'}
                </button>
              </div>
            )}

            {phase === 'measure' && (
              <div className="flex flex-col items-center justify-center h-full px-2">
                <p className="text-xs text-slate-400 mb-5 text-center leading-relaxed">
                  {locale === 'zh'
                    ? '貝爾糾纏對已建立。執行聯合測量後，Alice 的原始量子態將坍縮，並透過經典光學通道傳送 2-bit 封包至 Bob 端。'
                    : "Bell pair ready. Bell-basis measurement will collapse Alice's state and transmit 2 classical bits to Bob."}
                </p>
                {/* 測量按鈕對齊 MAGI 通訊的琥珀金 */}
                <button
                  type="button"
                  onClick={() => executeAction(800, measureAlice, () => sound.playTeleport())}
                  disabled={isAnimating}
                  className="w-full py-4 bg-amber-950/40 border border-amber-500/50 rounded-xl hover:bg-amber-900/60 hover:border-amber-400 transition-all active:scale-95 text-[13px] sm:text-sm font-bold text-amber-400 shadow-lg shadow-amber-950/50 disabled:opacity-50"
                >
                  {locale === 'zh' ? '執行聯合測量 (發送經典封包)' : 'Perform Bell Measurement'}
                </button>
              </div>
            )}

            {phase === 'correct' && classicalBits !== null && (
              <div className="flex flex-col h-full justify-center">
                <p className="text-[10px] sm:text-xs text-blue-400 mb-3 text-center animate-pulse font-mono">
                  {isBlindMode
                    ? locale === 'zh'
                      ? 'Bob 已收到經典位元。請對照實體柱與目標態（玻璃槽），選擇對應的么正修正閘：'
                      : 'Classical bits received. Compare solid pillars with glass tank holograms to select the unitary correction gate:'
                    : locale === 'zh'
                    ? `Bob 收到經典位元 [ ${BIT_LABELS[classicalBits]} ]，請施加對應的么正修正閘：`
                    : `Bob received classical bits [ ${BIT_LABELS[classicalBits]} ]. Apply unitary correction gate:`}
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[0, 1, 2, 3].map((bits) => (
                    <button
                      type="button"
                      key={bits}
                      onClick={() => handleApplyCorrection(bits as 0 | 1 | 2 | 3)}
                      disabled={isAnimating}
                      // 修正按鈕對齊 EVA-00初期的鈷藍色
                      className="py-2.5 bg-slate-900 border border-slate-700 rounded-xl hover:border-blue-500 hover:bg-blue-950/30 transition-all active:scale-95 text-xs font-mono font-bold text-slate-300 hover:text-blue-400 disabled:opacity-50"
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
                  phase === 'success' ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-rose-950/30 border-rose-500/50'
                }`}
              >
                {/* 成功狀態對齊 Rei Tank 注入靈魂時的翠綠感應光芒 */}
                <p className={`text-sm font-bold mb-1 ${phase === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {phase === 'success'
                    ? locale === 'zh'
                      ? '✨ 量子態重建成功！'
                      : '✨ State Reconstruction Successful!'
                    : locale === 'zh'
                    ? '❌ 么正修正錯誤'
                    : '❌ Incorrect Unitary Correction'}
                </p>

                <div className="flex flex-col items-center mb-3 px-4 text-center">
                  <span className={`text-[10px] font-mono mb-1 ${fidelity > 0.99 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    STATE FIDELITY |⟨ψ_orig|ψ_Bob⟩|² = {(fidelity * 100).toFixed(1)}%
                  </span>

                  {phase === 'failed' && fidelity > 0.99 ? (
                    <p className="text-[10px] text-amber-400 leading-tight">
                      {locale === 'zh'
                        ? '⚠️ 巧合：所選修正閘錯誤，但設定的初始態恰好位於該算符的本徵態上。請嘗試其他 θ/φ 角度！'
                        : '⚠️ Coincidence: Wrong gate selected, but the initial state was an eigenstate of the error operator. Try another angle!'}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {phase === 'success'
                        ? locale === 'zh'
                          ? 'Bob 的量子態已精確重建為 Alice 最初製備的未知量子態。'
                          : "Bob's qubit has been faithfully reconstructed into Alice's initial state."
                        : failureMessage}
                    </p>
                  )}
                </div>

                {phase === 'failed' && isBlindMode && failedCount < 2 ? (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => executeAction(300, retryCorrection, () => sound.playLever())}
                      disabled={isAnimating}
                      className="px-6 py-1.5 bg-amber-950/50 text-amber-400 border border-amber-900/50 rounded hover:bg-amber-900/50 transition-colors text-xs font-bold disabled:opacity-50"
                    >
                      {locale === 'zh' ? '再試一次' : 'RETRY'}
                    </button>
                    <button
                      type="button"
                      onClick={() => executeAction(300, reset, () => sound.playLever())}
                      disabled={isAnimating}
                      className="px-6 py-1.5 bg-slate-900 border border-slate-700 text-slate-400 rounded hover:bg-slate-800 transition-colors text-xs disabled:opacity-50"
                    >
                      {locale === 'zh' ? '重新開始' : 'RESTART'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => executeAction(300, reset, () => sound.playLever())}
                    disabled={isAnimating}
                    className="px-6 py-1.5 bg-slate-900 border border-slate-600 rounded hover:bg-white hover:text-black transition-colors text-[11px] font-bold font-mono disabled:opacity-50"
                  >
                    {locale === 'zh' ? '重置實驗 (RESET)' : 'RESET PROTOCOL'}
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
          type="button"
          onClick={() => setIsExplaining(!isExplaining)}
          className="text-[10px] text-sky-400 hover:text-sky-300 font-mono transition-colors active:scale-95"
        >
          [ {isExplaining ? (locale === 'zh' ? '關閉解析' : 'CLOSE THEORY') : locale === 'zh' ? '原理解析' : 'THEORY'} ]
        </button>
        <button
          type="button"
          onClick={() => executeAction(300, reset, () => sound.playLever())}
          disabled={isAnimating}
          className="text-[10px] text-slate-500 hover:text-white transition-colors font-mono active:scale-95 disabled:opacity-30"
        >
          [ RESET PROTOCOL ]
        </button>
      </div>
    </div>
  );
};
