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

  // 🌟 自適應背景設計：無論白底還是黑底 DevTools，一律採用暗色終端卡片渲染
  const baseCard = 'background: #090d16; border-radius: 4px; padding: 4px 8px; margin: 2px 0; display: inline-block;';
  
  const titleStyle = `${baseCard} color: #38bdf8; font-size: 14px; font-weight: 900; font-family: monospace; border: 1px solid #1e293b; text-shadow: 0 0 8px rgba(56,189,248,0.7);`;
  const quoteStyle = `${baseCard} color: #f43f5e; font-size: 11px; font-weight: bold; font-family: monospace; font-style: italic; border-left: 3px solid #f43f5e;`;
  const headerStyle = `${baseCard} color: #38bdf8; font-size: 12px; font-weight: bold; font-family: monospace; border-left: 3px solid #38bdf8; width: 100%;`;
  const zhCardStyle = `${baseCard} color: #f1f5f9; font-size: 11.5px; line-height: 1.7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; border: 1px solid #1e293b; width: 100%;`;
  const enCardStyle = `${baseCard} color: #94a3b8; font-size: 10.5px; line-height: 1.5; font-family: monospace; border: 1px solid #1e293b; width: 100%;`;
  const termHighlight = 'color: #f59e0b; font-weight: bold; font-family: monospace; text-shadow: 0 0 4px rgba(245,158,11,0.4);';
  const tagStyle = `${baseCard} color: #10b981; font-weight: bold; font-family: monospace; font-size: 11px; border: 1px solid #065f46;`;

  // 🌟 改用 console.group：取消預設折疊，開啟 F12 直接展開
  console.group('%c⚛️ [ J.A.R. PROTOCOL // 0x4C415354_4F52444552 ]', titleStyle);
  
  console.log('%c"We are merely the Observers of this deterministic universe." — Orbital Core Terminal', quoteStyle);

  // LOG 01
  console.log('%cLOG 01: 業子力學與因果收束 (Karmic Dynamics & Determinism)', headerStyle);
  console.log(
    '%c在微觀物理中，狀態未經測量前僅是瀰漫在相空間的機率雲。狂熱的物理學家曾假想一套將微觀不確定性與因果宿命融合的%c「業子力學（Karmic Dynamics）」%c——若宏觀的業力與命運如同薛丁格方程式般被嚴密公式化，唯有強烈的意識介入進行%c「觀測（Observation）」%c，方能迫使停滯的波函數強行塌縮，粉碎既定的業障循環。',
    zhCardStyle, termHighlight, zhCardStyle, termHighlight, zhCardStyle
  );
  console.log(
    '%cPrior to measurement, physical states exist merely as probability amplitudes. Theoretical physicists conceptualized "Karmic Dynamics" to bridge micro-uncertainty with macro-fatalism. If destiny itself is computed by deterministic wavefunctions, only the conscious act of "Observation" can collapse the state, breaking the pre-calculated cycle.',
    enCardStyle
  );

  // LOG 02
  console.log('%cLOG 02: 晶片核心與生體大腦的疊加質詢 (Ghost in the Circuit)', headerStyle);
  console.log(
    '%c當生物大腦被替換為微型邏輯晶片，抑或全副血肉皆淬鍊為大馬士革鋼鍛造的機械戰甲，究竟何者定義了「人」的存在？在古典邏輯下這是非此即彼的悖論，但在量子疊加態中，靈魂與機體本就處於同軸干涉之中。即便面對能模擬千萬平行世界的軌道巨型量子電腦，生命在生死邊緣所迸發的意志，依然是無法被演算法收錄的隨機漲落。',
    zhCardStyle
  );
  console.log(
    '%cWhen biological brains are replaced by silicon logic cores, or flesh is rebuilt with Damascus alloy, what defines humanity? In classical terms, it is a binary contradiction; in quantum mechanics, ghost and shell coexist in coherent superposition. Even against vast orbital supercomputers simulating infinite worlds, sheer survival will remains an uncomputable quantum fluctuation.',
    enCardStyle
  );

  // 結語
  console.log(
    '%cSYSTEM STATUS: CONVERGENCE ACTIVE // AGENT DESIGNATION: THE LAST ORDER',
    tagStyle
  );

  console.groupEnd();
};
