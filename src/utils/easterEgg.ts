// src/utils/easterEgg.ts
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Classification: LEVEL-5 CLASSIFIED ARCHIVE // QUANTUM DYNAMICS
 */

export const initCyberpunkEasterEgg = () => {
  if (typeof window === 'undefined') return;
  if ((window as any).__JAR_EASTER_EGG_LOADED__) return;
  (window as any).__JAR_EASTER_EGG_LOADED__ = true;

  // 賽博龐克高對比配色：電漿藍、量子洋紅、高警示琥珀金與機油暗灰
  const titleStyle = 'color: #38bdf8; font-size: 16px; font-weight: 900; font-family: monospace; text-shadow: 0 0 10px rgba(56,189,248,0.7); padding: 4px 0;';
  const quoteStyle = 'color: #ec4899; font-size: 11px; font-weight: bold; font-family: monospace; font-style: italic; padding-bottom: 8px;';
  const headerStyle = 'color: #f1f5f9; font-size: 12px; font-weight: bold; font-family: monospace; background: #1e293b; padding: 2px 6px; border-left: 3px solid #38bdf8; margin-top: 8px;';
  const zhStyle = 'color: #cbd5e1; font-size: 11px; line-height: 1.7; font-family: sans-serif;';
  const enStyle = 'color: #94a3b8; font-size: 10px; line-height: 1.5; font-family: monospace; padding-bottom: 6px;';
  const termStyle = 'color: #f59e0b; font-weight: bold; font-family: monospace;';
  const dimStyle = 'color: #64748b; font-size: 10px; font-family: monospace;';

  console.groupCollapsed('%c[ J.A.R. PROTOCOL // 0x4C415354_4F52444552 ]', titleStyle);
  
  console.log('%c"We are merely the Observers of this deterministic universe." — Orbital Core Central Terminal', quoteStyle);

  // 1. 業子力學 (Karmic Dynamics)
  console.log('%cLOG 01: 業子力學與因果收束 (Karmic Dynamics & Determinism)', headerStyle);
  console.log(
    '%c在微觀物理中，狀態未經測量前僅是瀰漫在相空間的機率雲。狂熱的物理學家曾假想一套將微觀不確定性與因果宿命融合的%c「業子力學（Karmic Dynamics）」%c——若宏觀的業力與命運如同薛丁格方程式般被嚴密公式化，唯有強烈的意識介入進行%c「觀測（Observation）」%c，方能迫使停滯的波函數強行塌縮，粉碎既定的業障循環。',
    zhStyle, termStyle, zhStyle, termStyle, zhStyle
  );
  console.log(
    '%cPrior to measurement, physical states exist merely as probability amplitudes. Theoretical physicists conceptualized "Karmic Dynamics" to bridge micro-uncertainty with macro-fatalism. If destiny itself is computed by deterministic wavefunctions, only the conscious act of "Observation" can collapse the state, breaking the pre-calculated cycle.',
    enStyle
  );

  // 2. 靈魂晶片與殼層疊加 (Ghost, Shell & Superposition)
  console.log('%cLOG 02: 晶片核心與生體大腦的疊加質詢 (Ghost in the Circuit)', headerStyle);
  console.log(
    '%c當生物大腦被替換為微型邏輯晶片，抑或全副血肉皆淬鍊為大馬士革鋼鍛造的機械戰甲，究竟何者定義了「人」的存在？在古典邏輯下這是非此即彼的悖論，但在量子疊加態中，靈魂與機體本就處於同軸干涉之中。即便面對能模擬千萬平行世界的軌道巨型量子電腦，生命在生死邊緣所迸發的意志，依然是無法被演算法收錄的隨機漲落。',
    zhStyle
  );
  console.log(
    '%cWhen biological brains are replaced by silicon logic cores, or flesh is rebuilt with Damascus alloy, what defines humanity? In classical terms, it is a binary contradiction; in quantum mechanics, ghost and shell coexist in coherent superposition. Even against vast orbital supercomputers simulating infinite worlds, sheer survival will remains an uncomputable quantum fluctuation.',
    enStyle
  );

  // 3. 行星觀測代理人結語 (Planetary Observer)
  console.log('%cSYSTEM STATUS: CONVERGENCE ACTIVE', headerStyle);
  console.log(
    '%c當前終端機已切換至量子收束觀測模式。致敬所有在廢鐵與群星之間、以自由意志對抗宿命概率的觀測者。\n%c> AGENT DESIGNATION: THE LAST ORDER',
    zhStyle, termStyle
  );
  console.log(
    '%cTerminal switched to Quantum Convergence Mode. Dedicated to all observers traversing between rust and the stars, defying fatalistic probabilities with pure agency.\n> ACCESS GRANTED // READY FOR INTERFERENCE BENCH',
    dimStyle
  );

  console.groupEnd();
};
