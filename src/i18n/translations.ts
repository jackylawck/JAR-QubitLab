// src/i18n/translations.ts
export type Locale = 'zh' | 'en';

// 🌟 優化 1：補齊 TranslationSchema 以符合全專案需求
export interface TranslationSchema {
  common: {
    pathA: string;
    pathB: string;
    splitBeam: string;
    interfere: string;
    measure: string;
    standby: string;
    phaseShift: string; // 🌟 修復 TS2339: PhaseDial 所需的鍵值
  };
  boothOne: {
    title: string;
    desc: string;
    explanation: string;
  };
  boothTwo: {
    title: string;
    desc: string;
    explanation: string;
  };
  // 🌟 修復 TS2339: 補齊展台 3 的字典結構
  boothThree: {
    title: string;
    desc: string;
    explanation: string;
  };
}

export const translations: Record<Locale, TranslationSchema> = {
  zh: {
    common: {
      pathA: '路徑 A (|0⟩)',
      pathB: '路徑 B (|1⟩)',
      splitBeam: '撥動分光 (H)',
      interfere: '匯流對撞',
      measure: '拍下快門 (觀測)',
      // 🌟 優化 2：堅持 UX 語義，保留行為提示
      standby: '待機 (需先分光)', 
      phaseShift: '相位差 (Phase Shift)', // 🌟 補齊 PhaseDial 缺失的文案
    },
    boothOne: {
      title: '疊加與坍縮',
      desc: '撥動分光桿（H 門）使球體進入疊加態；按下拍照快門強制其隨機坍縮。',
      explanation: '撥動分光桿（施加 Hadamard 門）使粒子進入疊加態，同時分佈在左（|0⟩）與右（|1⟩）。按下快門進行量子觀測，迫使波函數隨機坍縮成確定的一側。',
    },
    boothTwo: {
      title: '波動干涉與機率搬運',
      desc: '分光後調整相位差，對撞時將透過相消干涉把機率全數搬運至另一端。',
      explanation: '若為 0° 同相，對撞後右路消亡，能量 100% 匯聚至 Path A；若翻轉為 π（180°）反相，左路相消蒸發，機率 100% 被搬運至 Path B！',
    },
    // 🌟 補齊展台 3 中文文案
    boothThree: {
      title: '量子糾纏與貝爾態',
      desc: 'H 門製造疊加，CNOT 建立糾纏，抽樣見證統計鐵證。',
      explanation: '按 H 門讓 Q0 進入疊加態，再按 CNOT 建立量子糾纏（貝爾態）。抽樣 20 次後你會發現，結果永遠只有 |00⟩ 和 |11⟩，另外兩種可能性完全消滅。這就是量子糾纏的統計鐵證——它們的命運已經綁定。',
    },
  },
  en: {
    common: {
      pathA: 'Path A (|0⟩)',
      pathB: 'Path B (|1⟩)',
      splitBeam: 'Split Beam (H)',
      interfere: 'Recombine',
      measure: 'Shutter (Observe)',
      standby: 'STANDBY (Split First)', // 🌟 對齊中文的行為提示
      phaseShift: 'Phase Shift', // 🌟 補齊 PhaseDial 缺失的文案
    },
    boothOne: {
      title: 'Superposition & Collapse',
      desc: 'Apply Hadamard gate to superpose; click shutter to force collapse.',
      explanation: 'Applying the Hadamard gate puts the qubit into a superposition of |0⟩ and |1⟩. Clicking the shutter performs a measurement, forcing the wavefunction to collapse into a definite state.',
    },
    boothTwo: {
      title: 'Wave Interference',
      desc: 'Split paths, tune phase difference, and observe destructive cancellation.',
      explanation: 'In-phase (0°): Destructive interference eliminates Path B, 100% amplitude stays in Path A. Anti-phase (π): Path A cancels out and 100% amplitude is transported into Path B!',
    },
    // 🌟 補齊展台 3 英文文案
    boothThree: {
      title: 'Entanglement & Bell States',
      desc: 'Create superposition with H, entangle with CNOT, and observe statistical proof.',
      explanation: 'Apply H to Q0 to create superposition, then CNOT to entangle (Bell State). After 20 samples, you will observe only |00⟩ and |11⟩. The other possibilities are eliminated—this is the statistical proof of quantum entanglement.',
    },
  },
};
