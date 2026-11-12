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

  // 自適應暗黑終端卡片樣式（相容黑白兩種 DevTools 主題）
  const baseCard = 'background: #090d16; border-radius: 4px; padding: 4px 8px; margin: 2px 0; display: inline-block;';
  
  const titleStyle = `${baseCard} color: #38bdf8; font-size: 14px; font-weight: 900; font-family: monospace; border: 1px solid #1e293b; text-shadow: 0 0 8px rgba(56,189,248,0.7);`;
  const quoteStyle = `${baseCard} color: #f43f5e; font-size: 11px; font-weight: bold; font-family: monospace; font-style: italic; border-left: 3px solid #f43f5e;`;
  const headerStyle = `${baseCard} color: #38bdf8; font-size: 12px; font-weight: bold; font-family: monospace; border-left: 3px solid #38bdf8; width: 100%; margin-top: 8px;`;
  const zhCardStyle = `${baseCard} color: #f1f5f9; font-size: 11.5px; line-height: 1.7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; border: 1px solid #1e293b; width: 100%;`;
  const enCardStyle = `${baseCard} color: #94a3b8; font-size: 10.5px; line-height: 1.5; font-family: monospace; border: 1px solid #1e293b; width: 100%;`;
  const termHighlight = 'color: #f59e0b; font-weight: bold; font-family: monospace; text-shadow: 0 0 4px rgba(245,158,11,0.4);';
  
  // 🌟 修復 TS6133：移除未使用的 tagStyle，並精簡不必要的命令樣式
  const commandStyle = `${baseCard} color: #a855f7; font-weight: bold; font-size: 11px; font-family: monospace; border: 1px dotted #a855f7; cursor: text; line-height: 1.6;`;

  // ==========================================
  // 1. 初始加載科普日誌（全中文 + 全英文對照）
  // ==========================================
  console.group('%c⚛️ [ J.A.R. PROTOCOL // 0x4C415354_4F52444552 ]', titleStyle);
  
  console.log(
    '%c"我們只是這個確定性宇宙的觀測者。" —— 軌道中樞終端機\n"We are merely the Observers of this deterministic universe." — Orbital Core Terminal',
    quoteStyle
  );

  // LOG 01
  console.log('%cLOG 01: 業子力學與因果收束 // Karmic Dynamics & Determinism', headerStyle);
  console.log(
    '%c在微觀物理中，狀態未經測量前僅是瀰漫在相空間的機率雲。狂熱的物理學家曾假想一套將微觀不確定性與因果宿命融合的%c「業子力學（Karmic Dynamics）」%c——若宏觀的業力與命運如同薛丁格方程式般被嚴密公式化，唯有強烈的意識介入進行%c「觀測（Observation）」%c，方能迫使停滯的波函數強行塌縮，粉碎既定的業障循環。',
    zhCardStyle, termHighlight, zhCardStyle, termHighlight, zhCardStyle
  );
  console.log(
    '%cPrior to measurement, physical states exist merely as probability clouds in phase space. Theoretical physicists conceptualized %c"Karmic Dynamics"%c to bridge micro-uncertainty with macro-fatalism. If destiny itself is computed by deterministic wavefunctions, only the conscious act of %c"Observation"%c forces the stagnant wavefunction to collapse, shattering the pre-calculated cycle.',
    enCardStyle, termHighlight, enCardStyle, termHighlight, enCardStyle
  );

  // LOG 02
  console.log('%cLOG 02: 晶片與生體大腦的疊加 // Ghost in the Circuit', headerStyle);
  console.log(
    '%c當生物大腦被替換為微型邏輯晶片，抑或全副血肉皆淬鍊為大馬士革鋼鍛造的機械戰甲，究竟何者定義了「人」的存在？在古典邏輯下這是非此即彼的悖論，但在量子疊加態中，靈魂與機體本就處於同軸干涉之中。即便面對能模擬千萬平行世界的軌道巨型量子電腦，生命在生死邊緣所迸發的求生意志，依然是無法被演算法收錄的隨機漲落。',
    zhCardStyle
  );
  console.log(
    '%cWhen biological brains are replaced by silicon logic cores, or flesh is rebuilt with Damascus alloy, what defines humanity? In classical terms, it is a binary contradiction; in quantum mechanics, ghost and shell coexist in coherent superposition. Even against vast orbital supercomputers simulating infinite worlds, sheer survival will ignited at the brink remains an uncomputable quantum fluctuation.',
    enCardStyle
  );

  // 指令引導
  console.log('%c[ TERMINAL OVERRIDE // 互動指令解鎖 INTERACTIVE COMMANDS ]', headerStyle);
  console.log(
    '%c> 請在 Console 直接鍵入以下指令（支援大小寫，無需括號）並按 Enter：\n> Enter any of the following commands (case-insensitive, no brackets):\n  • MELCHIZEDEK (或 melchizedek)\n  • FLAN (或 flan)\n  • THE_LAST_ORDER (或 last_order)',
    commandStyle
  );

  console.groupEnd();

  // ==========================================
  // 2. 雙語互動指令引擎（支援大小寫與別名容錯）
  // ==========================================
  const registerCommand = (aliases: string[], action: () => void) => {
    aliases.forEach((trigger) => {
      Object.defineProperty(window, trigger, {
        get: () => {
          setTimeout(action, 80);
          return `[ EXECUTING COMMAND // 執行指令: ${trigger.toUpperCase()} ]`;
        },
        configurable: true,
      });
    });
  };

  // 互動 1：軌道超級電腦的宿命演算 (MELCHIZEDEK)
  registerCommand(['MELCHIZEDEK', 'melchizedek'], () => {
    console.log(
      '%c[ MELCHIZEDEK QUANTUM CORE // 梅爾基洗德量子中樞 ]',
      'color: #0ea5e9; font-weight: 900; font-size: 13px; font-family: monospace;'
    );
    console.log(
      '%c> 正在載入業子力學全域變數...\n> Loading global karmic dynamical parameters...',
      'color: #94a3b8; font-family: monospace;'
    );
    console.log(
      '%c> 運算宿命存活率：0.0000012%\n> Computing fatalistic survival probability: 0.0000012%',
      'color: #ef4444; font-family: monospace; font-weight: bold;'
    );
    
    setTimeout(() => {
      console.log(
        '%c[ FATAL ERROR // 致命異常 ]\n%c未預期的量子漲落！觀測目標展現出超越物理框架的求生意志。\nUnexpected quantum fluctuation! Target exhibits sheer will to survive beyond physical models.',
        'color: #ef4444; font-weight: bold; background: #450a0a; padding: 2px 6px; border-radius: 2px;',
        'color: #f1f5f9; font-family: sans-serif; line-height: 1.6;'
      );
    }, 1200);
  });

  // 互動 2：羅亞教授的焦糖布丁 (FLAN)
  registerCommand(['FLAN', 'flan'], () => {
    console.log(
      '%c🍮 [ SYNTHESIZING CARAMEL FLAN // 虛擬焦糖布丁合成中 ]',
      'color: #f59e0b; font-weight: 900; font-size: 13px; font-family: monospace;'
    );
    console.log(
      '%c> 業子力學的運算極其消耗大腦葡萄糖。\n> Karmic dynamics computations consume immense cerebral glucose.',
      'color: #f1f5f9; font-family: sans-serif;'
    );
    console.log(
      '%c> 已為觀測者注入 4000 卡路里的虛擬焦糖布丁，腦內啡分泌量增加 300%。\n> Injected 4000 kcal of virtual caramel flan. Endorphin secretion increased by 300%.\n> "這才是克服業障的唯一真理。" —— 瘋狂科學家\n> "This is the ultimate truth to overcome karmic barriers." — The Mad Scientist',
      'color: #fbbf24; font-style: italic; font-family: monospace;'
    );
  });

  // 互動 3：終極指令與量子視覺雜訊 (THE_LAST_ORDER)
  registerCommand(['THE_LAST_ORDER', 'the_last_order', 'LAST_ORDER', 'last_order'], () => {
    console.log(
      '%c⚡ [ PLANETARY CONVERGENCE PROTOCOL ENGAGED // 行星收束協定啟動 ]',
      'color: #10b981; font-weight: 900; font-size: 13px; font-family: monospace; text-shadow: 0 0 10px #10b981;'
    );
    console.log(
      '%c> 授權確認。你已被任命為「行星量子收束觀測機的秘密幹員」。\n> Authorization confirmed. You are designated as "Confidential Agent of Planetary Quantum Convergence".',
      'color: #f1f5f9; font-weight: bold; font-family: sans-serif;'
    );
    console.log(
      '%c> 正在強制重塑現實波函數，準備承受次元震盪...\n> Forcing reality wavefunction collapse. Brace for dimensional oscillations...',
      'color: #a855f7; font-family: monospace;'
    );

    // 觸發真實頁面 3D 視覺 Glitch 震撼效果
    const root = document.getElementById('root');
    if (!root) return;

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes quantum-glitch {
        0% { filter: hue-rotate(0deg) contrast(1); transform: translate(0, 0) scale(1); }
        20% { filter: hue-rotate(90deg) contrast(2) invert(1); transform: translate(-10px, 5px) scale(1.02); }
        40% { filter: hue-rotate(-90deg) contrast(1.5); transform: translate(10px, -5px) scale(0.98); }
        60% { filter: hue-rotate(180deg) contrast(3) invert(1); transform: translate(-5px, -10px) scale(1.05); }
        80% { filter: hue-rotate(45deg) contrast(1.2); transform: translate(5px, 10px) scale(0.99); }
        100% { filter: hue-rotate(0deg) contrast(1); transform: translate(0, 0) scale(1); }
      }
      .jar-quantum-glitch {
        animation: quantum-glitch 0.15s cubic-bezier(.25, .46, .45, .94) 4 alternate both !important;
      }
    `;
    document.head.appendChild(style);
    root.classList.add('jar-quantum-glitch');

    setTimeout(() => {
      root.classList.remove('jar-quantum-glitch');
      document.head.removeChild(style);
      console.log(
        '%c[ SYSTEM RESTORED // 系統已恢復 ] 現實已被重新定義。 // Reality has been redefined.',
        'color: #10b981; font-weight: bold; font-family: monospace;'
      );
    }, 800);
  });
};
