// src/i18n/translations.ts

export type Locale = 'zh' | 'en';

export const translations = {
  zh: {
    common: {
      standby: '待機 (需先分光)',
      phaseShift: '連續相移 P(ϕ)',
      phaseFlip: '相位翻轉 (Z-Gate)',
      inPhase: '同相 (0°)',
      antiPhase: '反相 (180°)',
      splitBeam: '① 撥動分光 (H)',
      interfere: '③ 匯流對撞 (Interfere)',
      pathA: 'Path A (|0⟩)',
      pathB: 'Path B (|1⟩)',
    },
    boothTwo: {
      statusSplit: '分光態已建立',
      statusConstructive: '相長干涉',
      statusDestructive: '相消干涉',
    },
    // Sprint 3 預留
    boothThree: {
      entangled: '最大糾纏態已生成 (Bell State)',
      separable: '可分態 (Separable)',
      measure: '觀測並坍縮 (Collapse)',
    },
  },
  en: {
    common: {
      standby: 'Standby (Split First)',
      phaseShift: 'Phase Shift P(ϕ)',
      phaseFlip: 'Phase Flip (Z-Gate)',
      inPhase: 'In-phase (0°)',
      antiPhase: 'Anti-phase (180°)',
      splitBeam: '① Split Beam (H)',
      interfere: '③ Recombine (Interfere)',
      pathA: 'Path A (|0⟩)',
      pathB: 'Path B (|1⟩)',
    },
    boothTwo: {
      statusSplit: 'Superposition Created',
      statusConstructive: 'Constructive Interference',
      statusDestructive: 'Destructive Interference',
    },
    boothThree: {
      entangled: 'Maximally Entangled (Bell State)',
      separable: 'Separable State',
      measure: 'Measure & Collapse',
    },
  },
} as const;

// 抽取結構型別，強制 zh 與 en 鍵值完全一致
export type TranslationSchema = typeof translations['zh'];
