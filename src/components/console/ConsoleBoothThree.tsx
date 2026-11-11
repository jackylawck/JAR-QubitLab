// src/components/console/ConsoleBoothThree.tsx
import { useTensorStore } from '../../store/tensorStore';
import { useLocaleStore } from '../../store/localeStore';

const BASIS_LABELS = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'] as const;

interface ConsoleBoothThreeProps {
  isExplaining: boolean;
  setIsExplaining: (v: boolean) => void;
}

export const ConsoleBoothThree = ({ isExplaining, setIsExplaining }: ConsoleBoothThreeProps) => {
  const { applyH, applyCNOT, sample20x, reset, isSampling, isEntangled, sampleHistory, amplitudes } = useTensorStore();
  const locale = useLocaleStore((s) => s.locale);

  const stats = [0, 0, 0, 0];
  sampleHistory.forEach(idx => stats[idx]++);

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col pointer-events-auto transition-all">
      {/* 頂部狀態列 */}
      <div className="flex justify-between items-end mb-2 sm:mb-4 px-2">
        <div className="flex items-baseline gap-4 text-xs font-mono">
          <span className="text-slate-400">STATE:</span>
          {amplitudes.map((amp, i) => (
            <span key={i} className={amp.modulus > 0.01 ? (isEntangled ? 'text-purple-400 font-bold' : 'text-sky-400 font-bold') : 'text-slate-600'}>
              {amp.label} {Math.round(amp.probability * 100)}%
            </span>
          ))}
        </div>
      </div>

      {/* 🌟 核心修正：加入 isExplaining 的三元條件分支 */}
      {!isExplaining ? (
        // 操作面板模式
        <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1">
          <button
            onClick={() => applyH(0)}
            disabled={isSampling}
            className="flex flex-col items-center justify-center bg-slate-900 border border-slate-700 rounded-xl hover:border-sky-500 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="text-sm font-bold text-sky-400 mb-1">H Gate (q0)</span>
            <span className="text-[10px] text-slate-500">Superposition</span>
          </button>

          <button
            onClick={() => applyCNOT(0, 1)}
            disabled={isSampling}
            className="flex flex-col items-center justify-center bg-slate-900 border border-slate-700 rounded-xl hover:border-purple-500 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
          >
            {isEntangled && <div className="absolute inset-0 bg-purple-500/10 animate-pulse" />}
            <span className="text-sm font-bold text-purple-400 mb-1 relative z-10">CNOT (q0→q1)</span>
            <span className="text-[10px] text-slate-500 relative z-10">Entanglement</span>
          </button>

          <button
            onClick={sample20x}
            disabled={isSampling}
            className="flex flex-col items-center justify-center bg-slate-900 border border-amber-700/50 rounded-xl hover:border-amber-500 hover:bg-amber-950/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="text-sm font-bold text-amber-500 mb-1">
              {isSampling ? 'SAMPLING...' : 'Sample (20x)'}
            </span>
            <span className="text-[10px] text-slate-500">Observe Distribution</span>
          </button>
        </div>
      ) : (
        // 🌟 原理解析模式
        <div className="text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[140px] py-1 px-2 font-sans flex-1 border border-slate-800/60 rounded-xl bg-slate-900/40">
          <p>
            {locale === 'zh'
              ? '按 H 門讓 Q0 進入疊加態，再按 CNOT 建立量子糾纏（貝爾態）。抽樣 20 次後你會發現，結果永遠只有 |00⟩ 和 |11⟩，另外兩種可能性完全消滅。這就是量子糾纏的統計鐵證——它們的命運已經綁定。'
              : 'Apply H to Q0 to create superposition, then CNOT to entangle (Bell State). After 20 samples, you will observe only |00⟩ and |11⟩. The other possibilities are eliminated—this is the statistical proof of quantum entanglement.'}
          </p>
        </div>
      )}

      {/* 統計結果小面板 */}
      {sampleHistory.length > 0 && !isExplaining && (
        <div className="mt-2 h-6 flex items-center justify-center gap-4 text-[10px] font-mono bg-slate-900/50 rounded border border-slate-800">
          <span className="text-amber-500">RESULT ({sampleHistory.length}/20):</span>
          {stats.map((count, i) => (
            <span key={i} className={count > 0 ? 'text-slate-200' : 'text-slate-600'}>
              {BASIS_LABELS[i]}: {count}
            </span>
          ))}
        </div>
      )}
      
      {/* 底部控制列 */}
      <div className="flex justify-between items-center mt-2 px-2">
        <button 
          onClick={() => setIsExplaining(!isExplaining)}
          className="text-[10px] text-sky-400 hover:text-sky-300 font-mono transition-colors active:scale-95"
        >
          [ {isExplaining ? (locale === 'zh' ? '關閉解析' : 'CLOSE THEORY') : (locale === 'zh' ? '原理解析' : 'THEORY')} ]
        </button>
        <button 
          onClick={reset} 
          disabled={isSampling} 
          className="text-[10px] text-slate-500 hover:text-white transition-colors font-mono disabled:opacity-30 active:scale-95"
        >
          [ RESET SYSTEM ]
        </button>
      </div>
    </div>
  );
};
