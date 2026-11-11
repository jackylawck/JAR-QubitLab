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

  const baseCard = 'background: #090d16; border-radius: 4px; padding: 4px 8px; margin: 2px 0; display: inline-block;';
  
  const titleStyle = `${baseCard} color: #38bdf8; font-size: 14px; font-weight: 900; font-family: monospace; border: 1px solid #1e293b; text-shadow: 0 0 8px rgba(56,189,248,0.7);`;
  const quoteStyle = `${baseCard} color: #f43f5e; font-size: 11px; font-weight: bold; font-family: monospace; font-style: italic; border-left: 3px solid #f43f5e;`;
  const headerStyle = `${baseCard} color: #38bdf8; font-size: 12px; font-weight: bold; font-family: monospace; border-left: 3px solid #38bdf8; width: 100%; margin-top: 8px;`;
  const zhCardStyle = `${baseCard} color: #f1f5f9; font-size: 11.5px; line-height: 1.7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; border: 1px solid #1e293b; width: 100%;`;
  const termHighlight = 'color: #f59e0b; font-weight: bold; font-family: monospace; text-shadow: 0 0 4px rgba(245,158,11,0.4);';
  const tagStyle = `${baseCard} color: #10b981; font-weight: bold; font-family: monospace; font-size: 11px; border: 1px solid #065f46;`;
  const commandStyle = `${baseCard} color: #a855f7; font-weight: bold; font-size: 11px; font-family: monospace; border: 1px dotted #a855f7; cursor: text;`;

  console.group('%c⚛️ [ J.A.R. PROTOCOL // 0x4C415354_4F52444552 ]', titleStyle);
  
  console.log('%c"We are merely the Observers of this deterministic universe." — Orbital Core Terminal', quoteStyle);

  console.log('%cLOG 01: 業子力學與因果收束 (Karmic Dynamics)', headerStyle);
  console.log(
    '%c若宏觀的命運如同薛丁格方程式般被嚴密公式化，唯有強烈的意識介入進行%c「觀測」%c，方能迫使停滯的波函數強行塌縮，粉碎既定的業障循環。',
    zhCardStyle, termHighlight, zhCardStyle
  );

  console.log('%cLOG 02: 晶片與生體大腦的疊加 (Ghost in the Circuit)', headerStyle);
  console.log(
    '%c在量子疊加態中，靈魂與機體本就處於同軸干涉之中。即便面對軌道巨型量子電腦，生命在生死邊緣所迸發的意志，依然是無法被演算法收錄的隨機漲落。',
    zhCardStyle
  );

  console.log('%c[ TERMINAL OVERRIDE // INTERACTIVE COMMANDS UNLOCKED ]', headerStyle);
  console.log(
    '%c> 請在下方 Console 直接輸入以下指令（無需括號）並按 Enter：\n> MELCHIZEDEK\n> FLAN\n> THE_LAST_ORDER',
    commandStyle
  );

  console.groupEnd();

  // ==========================================
  // 🌟 互動指令引擎 (透過 Object.defineProperty 攔截 Getter)
  // ==========================================

  const createCommand = (trigger: string, action: () => void) => {
    Object.defineProperty(window, trigger, {
      get: () => {
        setTimeout(action, 100); // 延遲 100ms 確保在回傳字串後才印出特效
        return `[ EXECUTING COMMAND: ${trigger} ]`;
      },
      configurable: true,
    });
  };

  // 互動 1：軌道超級電腦的宿命演算
  createCommand('MELCHIZEDEK', () => {
    console.log('%c[ MELCHIZEDEK QUANTUM CORE ]', 'color: #0ea5e9; font-weight: 900; font-size: 14px;');
    console.log('%c> 正在載入業子力學全域變數...', 'color: #94a3b8; font-family: monospace;');
    console.log('%c> 運算宿命存活率：0.0000012%', 'color: #ef4444; font-family: monospace;');
    
    setTimeout(() => {
      console.log('%c[ FATAL ERROR ] %c未預期的量子漲落！觀測目標展現出超越物理框架的求生意志。', 'color: #ef4444; font-weight: bold; background: #450a0a; padding: 2px 4px;', 'color: #f1f5f9;');
    }, 1500);
  });

  // 互動 2：羅亞教授的布丁
  createCommand('FLAN', () => {
    console.log('%c🍮 [ SYNTHESIZING CARAMEL FLAN ]', 'color: #f59e0b; font-weight: 900; font-size: 14px;');
    console.log('%c> 業子力學的運算極其消耗大腦葡萄糖。', 'color: #f1f5f9;');
    console.log('%c> 已為觀測者注入 4000 卡路里的虛擬焦糖布丁，腦內啡分泌量增加 300%。\n> "這才是克服業障的唯一真理。" —— 瘋狂科學家', 'color: #fbbf24; font-style: italic;');
  });

  // 互動 3：終極指令與量子視覺雜訊 (Glitch Effect)
  createCommand('THE_LAST_ORDER', () => {
    console.log('%c⚡ [ PLANETARY CONVERGENCE PROTOCOL ENGAGED ]', 'color: #10b981; font-weight: 900; font-size: 14px; text-shadow: 0 0 10px #10b981;');
    console.log('%c> 授權確認。你已被任命為「行星量子收束觀測機的秘密幹員」。', 'color: #f1f5f9; font-weight: bold;');
    console.log('%c> 正在強制重塑現實波函數，準備承受次元震盪...', 'color: #a855f7;');

    // 🌟 直接操控 DOM，給整個 React App 來一發 800 毫秒的賽博龐克視覺干擾
    const root = document.getElementById('root');
    if (!root) return;

    // 動態注入 Glitch Keyframes
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

    // 套用動畫
    root.classList.add('jar-quantum-glitch');

    // 800ms 後移除特效，恢復正常
    setTimeout(() => {
      root.classList.remove('jar-quantum-glitch');
      document.head.removeChild(style);
      console.log('%c[ SYSTEM RESTORED ] 現實已被重新定義。', 'color: #10b981; font-weight: bold;');
    }, 800);
  });
};
