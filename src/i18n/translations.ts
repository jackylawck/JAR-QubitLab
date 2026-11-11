// src/i18n/translations.ts
export type Locale = 'zh' | 'en';

export interface TranslationSchema {
  common: {
    pathA: string;
    pathB: string;
    splitBeam: string;
    interfere: string;
    measure: string; // 🌟 補回缺失欄位
    standby: string;
  };
  boothOne: {
    title: string;
    desc: string;
    explanation: string; // 🌟 補回原理解析
  };
  boothTwo: {
    title: string;
    desc: string;
    explanation: string; // 🌟 補回原理解析
  };
}

export const translations: Record<Locale, TranslationSchema> = {
  zh: {
    common: {
      pathA: '路徑 A (|0⟩)',
      pathB: '路徑 B (|1⟩)',
      splitBeam: '撥動分光 (H)',
      interfere: '匯流對撞',
      measure: '拍下快門 (觀測)', // 🌟 修復按鈕文字缺失
      standby: '載入中...',
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
  },
  en: {
    common: {
      pathA: 'Path A (|0⟩)',
      pathB: 'Path B (|1⟩)',
      splitBeam: 'Split Beam (H)',
      interfere: 'Recombine',
      measure: 'Shutter (Measure)',
      standby: 'LOADING...',
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
  },
};
