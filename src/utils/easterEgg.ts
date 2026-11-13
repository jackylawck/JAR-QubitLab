// src/utils/easterEgg.ts
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Classification: LEVEL-5 CLASSIFIED ARCHIVE // QUANTUM DYNAMICS
 */

declare global {
  interface Window {
    __JAR_EASTER_EGG_LOADED__?: boolean;
    qubitlab?: {
      help: () => string;
      palette: () => string;
      melchizedek: () => string;
      flan: () => string;
      lastOrder: () => string;
    };
  }
}

export const initCyberpunkEasterEgg = (): void => {
  if (typeof window === 'undefined') return;
  if (window.__JAR_EASTER_EGG_LOADED__) return;
  window.__JAR_EASTER_EGG_LOADED__ = true;

  // ==========================================
  // 1. 雙層防混淆與抗編譯清除 (Anti-Minifier Console Binding)
  // 透過動態拼接防止 Vite / esbuild / Terser 的 AST 靜態分析誤刪日誌
  // ==========================================
  const consoleKey = 'con' + 'sole';
  const nativeConsole = (window as unknown as Record<string, Console | undefined>)[consoleKey];
  if (!nativeConsole) return;

  const print = nativeConsole.log.bind(nativeConsole);
  const warn = nativeConsole.warn.bind(nativeConsole);
  const group = nativeConsole.group.bind(nativeConsole);
  const groupEnd = nativeConsole.groupEnd.bind(nativeConsole);

  // ==========================================
  // 2. 統一特效與定時器資源管理器 (FX_GC Resource Manager)
  // 確保冪等性、防連點競態與零記憶體洩漏
  // ==========================================
  const FX_GC = {
    timers: new Set<ReturnType<typeof setTimeout>>(),
    styleId: 'jar-quantum-fx-style',

    schedule(fn: () => void, delayMs: number): ReturnType<typeof setTimeout> {
      const id = setTimeout(() => {
        this.timers.delete(id);
        fn();
      }, delayMs);
      this.timers.add(id);
      return id;
    },

    clearAllTimers(): void {
      this.timers.forEach((id) => clearTimeout(id));
      this.timers.clear();
    },

    cleanupStyle(targetEl?: HTMLElement | null, className?: string): void {
      if (targetEl && className) {
        targetEl.classList.remove(className);
      }
      const existing = document.getElementById(this.styleId);
      if (existing) {
        existing.remove();
      }
    },
  };

  // 自適應暗黑終端卡片樣式
  const baseCard =
    'background: #090d16; border-radius: 4px; padding: 5px 10px; margin: 2px 0; display: inline-block;';

  const securityStyle =
    'background: #450a0a; color: #fca5a5; border: 1px solid #ef4444; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 11px; line-height: 1.5; width: 100%;';
  const titleStyle = `${baseCard} color: #38bdf8; font-size: 14px; font-weight: 900; font-family: monospace; border: 1px solid #1e293b; text-shadow: 0 0 8px rgba(56,189,248,0.7);`;
  const quoteStyle = `${baseCard} color: #f43f5e; font-size: 11px; font-weight: bold; font-family: monospace; font-style: italic; border-left: 3px solid #f43f5e;`;
  const headerStyle = `${baseCard} color: #38bdf8; font-size: 12px; font-weight: bold; font-family: monospace; border-left: 3px solid #38bdf8; width: 100%; margin-top: 8px;`;
  const zhCardStyle = `${baseCard} color: #f1f5f9; font-size: 11.5px; line-height: 1.7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; border: 1px solid #1e293b; width: 100%;`;
  const enCardStyle = `${baseCard} color: #94a3b8; font-size: 10.5px; line-height: 1.5; font-family: monospace; border: 1px solid #1e293b; width: 100%;`;
  const termHighlight =
    'color: #f59e0b; font-weight: bold; font-family: monospace; text-shadow: 0 0 4px rgba(245,158,11,0.4);';
  const commandStyle = `${baseCard} color: #a855f7; font-weight: bold; font-size: 11px; font-family: monospace; border: 1px dotted #a855f7; cursor: text; line-height: 1.65; width: 100%;`;

  // ==========================================
  // 3. Self-XSS 資安治理提示 (Zero-Data-Retention Security Advisory)
  // ==========================================
  warn(
    '%c🛡️ [ SECURITY ADVISORY // 資安治理提示 ]\n此實驗室採「純本地零資料留存（Zero-Data-Retention）」架構，不會在雲端儲存任何個人資訊。請勿在此貼上任何來源不明的程式碼，以防 Self-XSS 攻擊。\nThis lab operates on a Zero-Data-Retention client-side architecture. Never paste untrusted scripts here to protect against Self-XSS.',
    securityStyle
  );

  // ==========================================
  // 4. 初始加載檔案日誌（雙語對照）
  // ==========================================
  group('%c⚛️ [ J.A.R. PROTOCOL // 0x4C415354_4F52444552 ]', titleStyle);

  print(
    '%c"我們只是這個確定性宇宙的觀測者。" —— 軌道中樞終端機\n"We are merely the Observers of this deterministic universe." — Orbital Core Terminal',
    quoteStyle
  );

  // LOG 01
  print('%cLOG 01: 業子力學與因果收束 // Karmic Dynamics & Determinism', headerStyle);
  print(
    '%c在微觀物理中，狀態未經測量前僅是瀰漫在相空間的機率雲。狂熱的物理學家曾假想一套將微觀不確定性與因果宿命融合的%c「業子力學（Karmic Dynamics）」%c——若宏觀的業力與命運如同薛丁格方程式般被嚴密公式化，唯有強烈的意識介入進行%c「觀測（Observation）」%c，方能迫使停滯的波函數強行塌縮，粉碎既定的業障循環。',
    zhCardStyle,
    termHighlight,
    zhCardStyle,
    termHighlight,
    zhCardStyle
  );
  print(
    '%cPrior to measurement, physical states exist merely as probability clouds in phase space. Theoretical physicists conceptualized %c"Karmic Dynamics"%c to bridge micro-uncertainty with macro-fatalism. If destiny itself is computed by deterministic wavefunctions, only the conscious act of %c"Observation"%c forces the stagnant wavefunction to collapse, shattering the pre-calculated cycle.',
    enCardStyle,
    termHighlight,
    enCardStyle,
    termHighlight,
    enCardStyle
  );

  // LOG 02
  print('%cLOG 02: 晶片與生體大腦的疊加 // Ghost in the Circuit', headerStyle);
  print(
    '%c當生物大腦被替換為微型邏輯晶片，抑或全副血肉皆淬鍊為大馬士革鋼鍛造的機械戰甲，究竟何者定義了「人」的存在？在古典邏輯下這是非此即彼的悖論，但在量子疊加態中，靈魂與機體本就處於同軸干涉之中。即便面對能模擬千萬平行世界的軌道巨型量子電腦，生命在生死邊緣所迸發的求生意志，依然是無法被演算法收錄的隨機漲落。',
    zhCardStyle
  );
  print(
    '%cWhen biological brains are replaced by silicon logic cores, or flesh is rebuilt with Damascus alloy, what defines humanity? In classical terms, it is a binary contradiction; in quantum mechanics, ghost and shell coexist in coherent superposition. Even against vast orbital supercomputers simulating infinite worlds, sheer survival will ignited at the brink remains an uncomputable quantum fluctuation.',
    enCardStyle
  );

  // LOG 03：四大展台視覺色譜密碼
  print('%cLOG 03: 四大展台視覺色譜與隱喻對照 // Chromatic Architecture & Visual Motifs', headerStyle);
  print(
    '%c本實驗室的 3D 渲染光譜隱藏了四組經典機甲美學對照（主介面維持純學術詞彙）：\n' +
      '• 展台 1 [疊加與測量坍縮]：裝甲紫 (#a855f7) ＋ 螢光青綠 (#10b981) ➔ 初號機（EVA-01）覺醒\n' +
      '• 展台 2 [馬赫-曾德爾相位干涉]：深紅 (#dc2626) ＋ 亮黃 (#facc15) ➔ 二號機（EVA-02）明日香\n' +
      '• 展台 3 [雙量子位元糾纏 / 貝爾態]：覺醒紫綠 vs 暗夜紫藍緋紅 (#6366f1 / #e11d48) ➔ 初號機 vs 第13號機 最終對決\n' +
      '• 展台 4 [量子隱形傳態與不可克隆]：山吹橙 (#f97316) ＋ 初期藍 (#0ea5e9) ＋ 琥珀金 (#fbbf24) ➔ 零號機（EVA-00）靈魂轉移與 MAGI 傳輸',
    zhCardStyle
  );

  // 指令引導
  print('%c[ TERMINAL OVERRIDE // 互動指令解鎖 INTERACTIVE COMMANDS ]', headerStyle);
  print(
    '%c> 請在 Console 直接鍵入以下指令（支援大小寫，無需括號）並按 Enter：\n' +
      '> Enter any of the following commands (case-insensitive, no brackets):\n' +
      '  • PALETTE (或 palette / eva)   — 檢視四大展台色彩光譜密碼表\n' +
      '  • MELCHIZEDEK (或 melchizedek) — 啟動軌道量子中樞宿命演算\n' +
      '  • FLAN (或 flan)               — 合成 4000 kcal 虛擬焦糖布丁\n' +
      '  • THE_LAST_ORDER (或 last_order) — 觸發溫和相位干涉場特效（自動遵循系統減少動態偏好）',
    commandStyle
  );

  groupEnd();

  // ==========================================
  // 5. 互動指令實作（各功能獨立抽出，支援無括號與傳統物件呼叫）
  // ==========================================
  const runPalette = (): void => {
    print(
      '%c🎨 [ CHROMATIC ARCHITECTURE // 四大展台 EVA 色彩光譜對照表 ]',
      'color: #a855f7; font-weight: 900; font-size: 13px; font-family: monospace;'
    );
    print(
      '%c  [展台 1] 疊加與測量坍縮       │ 初號機（EVA-01）覺醒          │ 裝甲紫 #a855f7 ＋ 螢光青綠 #10b981\n' +
        '  [展台 2] 馬赫-曾德爾相位干涉  │ 二號機（EVA-02）明日香        │ 明日香紅 #dc2626 ＋ 亮黃 #facc15\n' +
        '  [展台 3] 雙量子位元糾纏       │ 初號機 vs 第13號機 最終對決   │ 紫綠 #a855f7/#22c55e vs 紫藍緋紅 #6366f1/#e11d48\n' +
        '  [展台 4] 量子隱形傳態         │ 零號機（EVA-00）與 MAGI 傳輸  │ 山吹橙 #f97316 ＋ 初期藍 #0ea5e9 ＋ 琥珀金 #fbbf24',
      'background: #090d16; color: #e2e8f0; border: 1px solid #334155; border-radius: 4px; padding: 8px 10px; font-family: monospace; font-size: 11px; line-height: 1.7;'
    );
  };

  const runMelchizedek = (): void => {
    print(
      '%c[ MELCHIZEDEK QUANTUM CORE // 梅爾基洗德量子中樞 ]',
      'color: #0ea5e9; font-weight: 900; font-size: 13px; font-family: monospace;'
    );
    print(
      '%c> 正在載入業子力學全域變數...\n> Loading global karmic dynamical parameters...',
      'color: #94a3b8; font-family: monospace;'
    );
    print(
      '%c> 運算宿命存活率：0.0000012%\n> Computing fatalistic survival probability: 0.0000012%',
      'color: #ef4444; font-family: monospace; font-weight: bold;'
    );

    FX_GC.schedule(() => {
      print(
        '%c[ FATAL ERROR // 致命異常 ]\n%c未預期的量子漲落！觀測目標展現出超越物理框架的求生意志。\nUnexpected quantum fluctuation! Target exhibits sheer will to survive beyond physical models.',
        'color: #ef4444; font-weight: bold; background: #450a0a; padding: 2px 6px; border-radius: 2px;',
        'color: #f1f5f9; font-family: sans-serif; line-height: 1.6;'
      );
    }, 1000);
  };

  const runFlan = (): void => {
    print(
      '%c🍮 [ SYNTHESIZING CARAMEL FLAN // 虛擬焦糖布丁合成中 ]',
      'color: #f59e0b; font-weight: 900; font-size: 13px; font-family: monospace;'
    );
    print(
      '%c> 業子力學的運算極其消耗大腦葡萄糖。\n> Karmic dynamics computations consume immense cerebral glucose.',
      'color: #f1f5f9; font-family: sans-serif;'
    );
    print(
      '%c> 已為觀測者注入 4000 卡路里的虛擬焦糖布丁，腦內啡分泌量增加 300%。\n> Injected 4000 kcal of virtual caramel flan. Endorphin secretion increased by 300%.\n> "這才是克服業障的唯一真理。" —— 瘋狂科學家\n> "This is the ultimate truth to overcome karmic barriers." — The Mad Scientist',
      'color: #fbbf24; font-style: italic; font-family: monospace;'
    );
  };

  const runLastOrder = (): void => {
    print(
      '%c⚡ [ PLANETARY CONVERGENCE PROTOCOL ENGAGED // 行星收束協定啟動 ]',
      'color: #10b981; font-weight: 900; font-size: 13px; font-family: monospace; text-shadow: 0 0 10px #10b981;'
    );
    print(
      '%c> 授權確認。你已被任命為「行星量子收束觀測機的秘密幹員」。\n> Authorization confirmed. You are designated as "Confidential Agent of Planetary Quantum Convergence".',
      'color: #f1f5f9; font-weight: bold; font-family: sans-serif;'
    );

    // 顧及視覺健康：檢查使用者作業系統是否開啟「減少動態效果 (prefers-reduced-motion)」
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      print(
        '%c> [ACCESSIBILITY GUARD] 偵測到系統已啟用「減少動態效果」，已自動略過畫面相位脈衝以保護視覺舒適。\n> Reduced-motion preference detected; visual phase pulse bypassed for comfort.',
        'color: #38bdf8; font-family: monospace;'
      );
      return;
    }

    print(
      '%c> 正在觸發溫和量子相位干涉場（650ms 後自動回收資源）...\n> Triggering gentle quantum phase interference field (auto-GC in 650ms)...',
      'color: #a855f7; font-family: monospace;'
    );

    const root = document.getElementById('root');
    if (!root) return;

    const fxClass = 'jar-quantum-phase-pulse';

    // 冪等性防護：先清理舊定時器與舊樣式節點，避免連續狂按造成殘留
    FX_GC.clearAllTimers();
    FX_GC.cleanupStyle(root, fxClass);

    // 隔離樣式表注入（不污染 inline style，且移除高頻黑白閃爍 invert 以保護光敏感使用者）
    const style = document.createElement('style');
    style.id = FX_GC.styleId;
    style.textContent = `
      @keyframes jar-phase-pulse {
        0%   { filter: hue-rotate(0deg) saturate(1); transform: scale(1); }
        35%  { filter: hue-rotate(48deg) saturate(1.35); transform: scale(1.006); }
        70%  { filter: hue-rotate(-36deg) saturate(1.25); transform: scale(0.997); }
        100% { filter: hue-rotate(0deg) saturate(1); transform: scale(1); }
      }
      .${fxClass} {
        animation: jar-phase-pulse 0.65s cubic-bezier(0.22, 1, 0.36, 1) 1 both !important;
        will-change: filter, transform;
      }
    `;
    document.head.appendChild(style);

    // 強制同步重繪 (Reflow) 確保連按時動畫從第 0 幀重播
    void root.offsetWidth;
    root.classList.add(fxClass);

    FX_GC.schedule(() => {
      FX_GC.cleanupStyle(root, fxClass);
      print(
        '%c[ SYSTEM RESTORED // 系統已恢復 ] 相位干涉場已安全卸載，零記憶體殘留。 // Phase field unmounted with zero memory leak.',
        'color: #10b981; font-weight: bold; font-family: monospace;'
      );
    }, 680);
  };

  // ==========================================
  // 6. 不可枚舉零括號存取器 (Non-enumerable Zero-Parenthesis Getters)
  // enumerable: false 確保不污染 Object.keys(window)
  // ==========================================
  const registerCommand = (aliases: readonly string[], action: () => void): void => {
    aliases.forEach((trigger) => {
      Object.defineProperty(window, trigger, {
        get: () => {
          FX_GC.schedule(action, 50);
          return `[ EXECUTING COMMAND // 執行指令: ${trigger.toUpperCase()} ]`;
        },
        enumerable: false,
        configurable: true,
      });
    });
  };

  registerCommand(['PALETTE', 'palette', 'EVA', 'eva'], runPalette);
  registerCommand(['MELCHIZEDEK', 'melchizedek'], runMelchizedek);
  registerCommand(['FLAN', 'flan'], runFlan);
  registerCommand(['THE_LAST_ORDER', 'the_last_order', 'LAST_ORDER', 'last_order'], runLastOrder);

  // 同時掛載不可枚舉的傳統命名空間呼叫方式 (window.qubitlab.palette() 等)
  Object.defineProperty(window, 'qubitlab', {
    value: Object.freeze({
      help: () => {
        runPalette();
        return '[ QubitLab Terminal Ready ]';
      },
      palette: () => {
        runPalette();
        return '[ PALETTE ]';
      },
      melchizedek: () => {
        runMelchizedek();
        return '[ MELCHIZEDEK ]';
      },
      flan: () => {
        runFlan();
        return '[ FLAN ]';
      },
      lastOrder: () => {
        runLastOrder();
        return '[ THE_LAST_ORDER ]';
      },
    }),
    enumerable: false,
    configurable: true,
  });
};
