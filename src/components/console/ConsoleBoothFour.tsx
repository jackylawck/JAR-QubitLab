// src/components/console/ConsoleBoothFour.tsx
import { useTeleportStore } from '../../store/teleportStore';
import { useLocaleStore } from '../../store/localeStore';
import { sound } from '../../audio/soundEngine';

const BIT_LABELS = ['00', '01', '10', '11'];
const CORRECTION_GATES = ['I (None)', 'Z Gate', 'X Gate', 'XZ Gates'];

export const ConsoleBoothFour = () => {
  const { 
    phase, aliceTheta, alicePhi, classicalBits, bellPairReady,
    setAliceState, createBellPair, measureAlice, applyCorrection, reset 
  } = useTeleportStore();
  
  const locale = useLocaleStore((s) => s.locale);

  // 滑桿轉換邏輯 (0~100 對應角度)
  const handleThetaChange = (val: string) => setAliceState((parseInt(val) / 100) * Math.PI, alicePhi);
  const handlePhiChange = (val: string) => setAliceState(aliceTheta, (parseInt(val) / 100) * 2 * Math.PI);

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col pointer-events-auto transition-all">
      
      {/* 頂部狀態列 */}
      <div className="flex justify-between items-end mb-2 px-2">
        <div className="flex items-baseline gap-4 text-xs font-mono">
          <span className="text-slate-400">TELEPORT PROTOCOL:</span>
          <span className="text-rose-400 font-bold uppercase">{phase}</span>
        </div>
        {classicalBits !== null && (
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-900/50">
            BITS: {BIT_LABELS[classicalBits]}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-2 px-2">
        {/* ========================================== */}
        {/* 階段 1: Prepare (準備未知態與糾纏對) */}
        {/* ========================================== */}
        {phase === 'prepare' && (
          <div className="flex flex-col gap-3 h-full justify-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-400 flex justify-between">
                  <span>θ (Latitude)</span>
                  <span className="text-sky-400">{(aliceTheta / Math.PI).toFixed(2)}π</span>
                </label>
                <input type="range" min="0" max="100" value={(aliceTheta / Math.PI) * 100} onChange={(e) => handleThetaChange(e.target.value)} className="accent-sky-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-400 flex justify-between">
                  <span>φ (Longitude)</span>
                  <span className="text-sky-400">{(alicePhi / Math.PI).toFixed(2)}π</span>
                </label>
                <input type="range" min="0" max="100" value={(alicePhi / (2 * Math.PI)) * 100} onChange={(e) => handlePhiChange(e.target.value)} className="accent-sky-500" />
              </div>
            </div>
            <button
              onClick={() => { sound.playMerge(); createBellPair(); }}
              className="mt-2 py-3 bg-slate-900 border border-purple-700/50 rounded-xl hover:bg-purple-900/30 hover:border-purple-500 transition-all active:scale-95 text-sm font-bold text-purple-400"
            >
              {locale === 'zh' ? '建立通訊糾纏對 (q1, q2)' : 'Create Bell Pair (q1, q2)'}
            </button>
          </div>
        )}

        {/* ========================================== */}
        {/* 階段 2: Measure (Alice 貝爾測量) */}
        {/* ========================================== */}
        {phase === 'measure' && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-xs text-slate-400 mb-4 text-center">
              {locale === 'zh' 
                ? '糾纏對已建立。Alice 必須對未知態(q0)與她手中的糾纏態(q1)進行貝爾測量。' 
                : 'Bell pair ready. Alice must perform a Bell measurement on q0 and q1.'}
            </p>
            <button
              onClick={() => { sound.playLever(); measureAlice(); }}
              className="w-full py-4 bg-slate-900 border border-sky-700/50 rounded-xl hover:bg-sky-900/30 hover:border-sky-500 transition-all active:scale-95 text-sm font-bold text-sky-400"
            >
              {locale === 'zh' ? '執行貝爾測量 (發送經典位元)' : 'Perform Bell Measurement'}
            </button>
          </div>
        )}

        {/* ========================================== */}
        {/* 階段 3: Correct (Bob 條件修正) */}
        {/* ========================================== */}
        {phase === 'correct' && (
          <div className="flex flex-col h-full justify-center">
            <p className="text-[10px] text-amber-400 mb-2 text-center animate-pulse">
              {locale === 'zh' ? `Bob 收到了經典訊息 [ ${BIT_LABELS[classicalBits!]} ]，請選擇對應的修正閘：` : `Bob received [ ${BIT_LABELS[classicalBits!]} ]. Select correction:`}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((bits) => (
                <button
                  key={bits}
                  onClick={() => { sound.playTick(1); applyCorrection(bits as 0|1|2|3); }}
                  className="py-2 bg-slate-900 border border-slate-700 rounded-lg hover:border-amber-500 hover:bg-amber-950/30 transition-all active:scale-95 text-xs font-mono text-slate-300 hover:text-amber-400"
                >
                  <span className="opacity-50 mr-2">[{BIT_LABELS[bits]}]</span>
                  {CORRECTION_GATES[bits]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 階段 4: 結算 (Success / Failed) */}
        {/* ========================================== */}
        {(phase === 'success' || phase === 'failed') && (
          <div className={`flex flex-col items-center justify-center h-full rounded-xl border ${phase === 'success' ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-rose-950/30 border-rose-500/50'}`}>
            <p className={`text-sm font-bold mb-1 ${phase === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {phase === 'success' 
                ? (locale === 'zh' ? '✨ 傳態成功！' : '✨ Teleportation Successful!') 
                : (locale === 'zh' ? '❌ 修正錯誤' : '❌ Wrong Correction')}
            </p>
            <p className="text-[10px] text-slate-400 mb-3 text-center px-4">
              {phase === 'success'
                ? (locale === 'zh' ? 'Bob 的量子態已完美重塑為 Alice 最初設定的未知態。' : 'Bob\'s qubit has collapsed perfectly into Alice\'s initial state.')
                : (locale === 'zh' ? 'Bob 使用了錯誤的邏輯閘，原始量子態已無可挽回地損毀。' : 'Bob applied the wrong gates. The original state is lost forever.')}
            </p>
            <button onClick={() => { sound.playLever(); reset(); }} className="px-6 py-1.5 bg-slate-900 border border-slate-700 rounded hover:bg-white hover:text-black transition-colors text-xs">
              {locale === 'zh' ? '重新實驗' : 'RESET PROTOCOL'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
