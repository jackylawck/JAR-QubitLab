# ⚛️ J.A.R. QubitLab (Joint Applied Research)
### 互動式 3D 微觀量子力學實驗室 · Interactive 3D Quantum Mechanics Laboratory

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-0ea5e9?logo=github)](https://jackylawck.github.io/JAR-QubitLab/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Data Retention](https://img.shields.io/badge/Privacy-Zero%20Data%20Retention-emerald)](COMPLIANCE.md)
[![Pure In-Memory](https://img.shields.io/badge/Architecture-100%25%20Client--Side-cyan)](COMPLIANCE.md)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict%20%2B%20UncheckedIndex-3178c6)](tsconfig.json)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Standalone-orange)](public/manifest.json)

---

## 🌟 初心與開篇寄語 · Father-Son Dedication

> **這是一個為了我和兒子共渡美好時光、共同探索微觀宇宙奧秘而開發的非商業個人專案。**  
> 在量子世界裡，一個粒子在未被觀測之前，可以同時存在於無數種可能性的疊加態之中；而在現實人生中，能牽著孩子的手、解答他對世界的好奇，每一刻全心全意的陪伴，都是我們共同坍縮出溫暖與希望未來的唯一確定解。願這個專案在記錄父子科研探索歡笑的同時，也能為每一位熱愛科學的探索者點亮微觀世界的光芒。

> **This is a non-commercial personal project developed to spend quality time with my son, exploring the mysteries of the microscopic universe together.**  
> In the quantum realm, a particle exists across infinite superpositions of possibilities until observed; in real life, holding my son's hand and exploring his curiosities moment by moment is the single deterministic path that collapses into our brightest future. May this lab preserve the joy of our scientific journey, while illuminating the beauty of quantum physics for curious minds everywhere.

---

## 📖 專案概覽 · Project Overview

**J.A.R. QubitLab** 是一款專為瀏覽器與行動裝置打造的高保真、物理誠實（Physically Honest）的 3D 量子力學沙盒。本系統捨棄傳統預錄動畫的展示方式，完全由前端原生矩陣運算引擎即時演化單／多量子位元（Single & Multi-Qubit）的態向量（State Vector）與相位空間，涵蓋四大互動實驗展台：

1. **展台 1：疊加與測量坍縮（Superposition & Measurement Collapse）**
   * 透過撥動分光桿施加阿達馬門（Hadamard Gate, $H$），使量子態由 $\vert 0\rangle$ 演化為等權重疊加態 $\frac{1}{\sqrt{2}}(\vert 0\rangle + \vert 1\rangle)$。
   * 扣下觀測快門觸發波函數隨機坍縮（Wavefunction Collapse），將機率轉化為確定結果，搭配立體音效即時體驗量子隨機性。
2. **展台 2：馬赫-曾德爾相位干涉（Mach-Zehnder Wave Interference）**
   * 連續調整兩路微觀光徑之間的相位差 $\theta$（$0 \le \theta < 2\pi$）。
   * 透過第二次對撞使波函數相長與相消干涉（Constructive & Destructive Interference），實現不經由空間傳遞的「機率完全搬運」。
3. **展台 3：雙量子位元糾纏與貝爾態（Quantum Entanglement & Bell States）**
   * 結合 $H$ 門與受控非門（$\text{CNOT}_{q_0 \to q_1}$），將可分態演化為最大糾纏貝爾態 $\vert\Phi^+\rangle = \frac{1}{\sqrt{2}}(\vert 00\rangle + \vert 11\rangle)$，並即時計算 Wootters 糾纏度（Concurrence $C = 1$）。
   * 透過 20 次連續投影測量抽樣（20x Sampling），以統計分佈實證 $\vert 01\rangle$ 與 $\vert 10\rangle$ 的完全消滅與非定域性命運綁定。
4. **展台 4：量子隱形傳態與不可克隆協議（Quantum Teleportation & No-Cloning）**
   * 橫跨 Alice 端、經典雙位元通訊通道與 Bob 端的三區光學平台，結合目標態幽靈殼（Wireframe Ghost Hologram）視覺對照。
   * 親手執行貝爾測量（Bell Measurement）、傳送 2-bit 經典封包並施加對應 $X / Z$ 么正修正閘，驗證「量子態可傳送但不可複製，且經典通訊受限於光速」的物理定律。

---

## 🛠️ 核心架構與技術特點 · Technical Architecture

- **雙軌零垃圾回收（Zero-GC）量子矩陣引擎 (`src/quantum/`)**：
  * `engine.ts`：採用 L1 快取友善的靜態 `Float64Array` Scratch 暫存區與無分支跨距演算法（Branchless Stride），搭配 1.5x 遲滯全局鎖相（Hysteresis Phase Lock）消除相位抖動。
  * `tensorEngine.ts`：一維交錯複數狀態向量引擎，支援多量子位元么正演化、Wootters Concurrence 判定與協程可中斷抽樣。
- **企業級型別安全與防禦性渲染 (`tsconfig.json` & `src/utils/pool.ts`)**：
  全面啟用 `strict` 與 `noUncheckedIndexedAccess: true`，杜絕陣列越界與執行期未定義參照；3D 渲染管線採用預分配靜態物件池（`POOL`）與顯式 GPU 資源釋放（`dispose`），確保跨裝置 60Hz/120Hz 零掉幀漂移與零記憶體洩漏。
- **合成器級物理音效聲景 (`src/audio/soundEngine.ts`)**：
  採用原生 Web Audio API 即時合成音訊，包含分光低頻震盪、水晶質感觀測快門、相消干涉的白噪音蒸發聲、經典位元脈衝與純四度／五度和弦，支援 iOS Safari 嚴格的音訊喚醒與節點自動斷開機制。
- **離線優先 PWA 與無縫熱更新 (`public/sw.js` & `src/main.tsx`)**：
  支援獨立全螢幕安裝與 `Network-First` 離線導覽回退策略，內建 `hadController` 守衛與 `vite:preloadError` 恢復機制，確保部署更新後零閃爍與零快取衝突。
- **隱私第一與法規治理 (`src/components/GovernanceNotice.tsx` & `COMPLIANCE.md`)**：
  實施嚴格的**零數據保留（Zero Data Retention）**與預設隱私（Privacy by Design）。無後端 API、無追蹤 Cookie、無遙測日誌。嚴格區分確定性代數與 AI 監管邊界，遵循 EAR § 734.7 公開科學教育軟體安全港條款。
- **賽博龐克 F12 觀測終端彩蛋 (`src/utils/easterEgg.ts`)**：
  致敬經典硬科幻《銃夢》與業子力學（Karmic Dynamics）世界觀。內建雙語終端介面，利用 JavaScript 原生 Getter 攔截實現免括號指令（`MELCHIZEDEK`、`FLAN`、`THE_LAST_ORDER`），並觸發全畫面的量子態重塑 Glitch 特效。

---

## 📂 檔案目錄結構 · Project Structure

```text
JAR-QubitLab/
├── .github/
│   └── workflows/
│       └── deploy.yml                # GitHub Actions 雙 Job 部署與 CI 自動化驗證工作流
├── public/
│   ├── fonts/
│   │   └── NotoSansMath-Regular.woff # 數學符號專用離線字型
│   ├── JARQubitLab192icon.png       # 192x192 簡約雙態量子疊加 PWA 應用圖標
│   ├── JARQubitLab512icon.png       # 512x512 高保真 3D 離子井光學雷射圖標
│   ├── manifest.json                 # 現代 PWA 沉浸式獨立全螢幕設定檔
│   └── sw.js                         # Service Worker 離線快取與導覽回退管理
├── scripts/
│   └── verify-build.mjs              # CI 建置安全、資產雜湊與 CSP 完整性驗證腳本
├── src/
│   ├── audio/
│   │   └── soundEngine.ts            # Web Audio API 原生音效合成引擎
│   ├── components/
│   │   ├── console/
│   │   │   ├── ConsoleBoothOne.tsx   # 展台 1 控制台面板
│   │   │   ├── ConsoleBoothTwo.tsx   # 展台 2 控制台面板
│   │   │   ├── ConsoleBoothThree.tsx # 展台 3 雙量子位元糾纏與 20x 抽樣控制台
│   │   │   └── ConsoleBoothFour.tsx  # 展台 4 量子隱形傳態與經典糾錯控制台
│   │   ├── BoothOne.tsx              # 展台 1：疊加與快門觀測 3D 場景
│   │   ├── BoothTwo.tsx              # 展台 2：連續相位干涉與對撞 3D 場景
│   │   ├── BoothThree.tsx            # 展台 3：雙量子位元機率能量柱與貝爾態軌道 3D 場景
│   │   ├── BoothFour.tsx             # 展台 4：Alice/Bob 雙端台座、幽靈殼與經典通道 3D 場景
│   │   ├── GovernanceNotice.tsx      # 企業級法規治理、出口管制與隱私合規聲明彈窗
│   │   ├── InterferenceBurst.tsx     # 干涉對撞能量粒子爆發視覺效果（Zero-GC）
│   │   ├── LanguageToggle.tsx        # 中英雙語切換按鈕（含跨分頁同步與手勢防穿透）
│   │   ├── LaserBeam.tsx             # 3D 空間相干雷射導軌
│   │   ├── PhaseDial.tsx             # 60Hz 連續相位舵盤旋轉控制器
│   │   └── QuantumField.tsx          # 背景量子真空漲落粒子場
│   ├── hooks/
│   │   ├── useAnimationLock.ts       # 動畫播放全域鎖（含看門狗防呆與併發防護）
│   │   └── usePointerDial.ts         # 支援移動端觸控與角域磁吸的舵盤追蹤 Hook
│   ├── i18n/
│   │   └── translations.ts           # 繁體中文 / 英文雙語字典定義
│   ├── quantum/
│   │   ├── engine.test.ts            # 量子態酉性、Big-Endian 與干涉完整性單元測試
│   │   ├── engine.ts                 # 核心量子態演化數學引擎（L1 Scratchpad 純函數）
│   │   ├── tensorEngine.ts           # 多量子位元張量態向量與糾纏度計算引擎
│   │   └── types.ts                  # 量子態向量、唯讀複數振幅與演化契約型別
│   ├── store/
│   │   ├── localeStore.ts            # 語系狀態管理（含跨分頁同步與 HMR 清理）
│   │   ├── quantumStore.ts           # 展台 1 & 2 量子態全域狀態容器（Zustand）
│   │   ├── tensorStore.ts            # 展台 3 多量子位元與協程抽樣狀態容器（Zustand）
│   │   └── teleportStore.ts          # 展台 4 隱形傳態階段與雙位元糾錯狀態容器
│   ├── utils/
│   │   ├── easterEgg.ts              # F12 賽博龐克雙語互動彩蛋
│   │   └── pool.ts                   # Three.js 3D 運算靜態物件池（Zero-GC Pool）
│   ├── App.tsx                       # 主應用程式入口、畫布相機與四展台調度中心
│   ├── constants.ts                  # 集中化環境變數、靜態資源與物理容差常數
│   ├── index.css                     # Tailwind CSS 與基礎無障礙樣式
│   ├── main.tsx                      # React 18 掛載點、PWA 熱更新與彩蛋初始化
│   └── vite-env.d.ts                 # Vite TypeScript 環境與著色器型別宣告
├── .gitignore
├── COMPLIANCE.md                     # 法律治理、出口管制（EAR）與非 AI 豁免聲明公約
├── index.html                        # 嚴格 CSP、Permissions-Policy 與現代 PWA 標籤
├── package.json                      # 專案依賴與建置腳本（含 engines 版本鎖定）
├── postcss.config.js                 # PostCSS 編譯管線配置
├── tailwind.config.js                # Tailwind CSS 配置（含 Safe Area 與動態視口）
├── tsconfig.json                     # 嚴格模式 TypeScript 編譯設定
└── vite.config.ts                    # Vite 打包、跨平台分塊與零依賴 Vitest 配置

```

---

## 🛡️ 法規治理與出口管制 · Governance & Safe Harbor

本項目在開發過程中嚴格落實法規定界，相關法律聲明已完整收錄於 [`COMPLIANCE.md`](COMPLIANCE.md)：

1. **確定性物理引擎聲明（Non-AI System）**：
系統核心均為確定性線性代數矩陣變換，**不包含機器學習、神經網路或生成式 AI 演算法**，明確排除於歐盟《人工智能法案》（EU AI Act 2024/1689）、國家網信辦相關規定及 ISO/IEC 42001 審計範疇之外。
2. **公開科學教育安全港（Export Controls Safe Harbor）**：
本系統呈現之物理模型均來自公開教科書之基礎科學原理。符合美國出口管制條例 EAR 15 CFR § 734.7 公開發布教育軟體之法定豁免，且不包含軍用密碼破解、低溫稀釋製冷控制等敏感兩用物項。
3. **架構性隱私保護（Privacy by Design）**：
系統完全於客戶端記憶體封閉運作，符合香港《個人資料（私隱）條例》（Cap. 486 PDPO）與歐盟 GDPR 第 26 條之非個人資料標準。嚴格實施 W3C 內容安全策略（CSP），自底層根絕伺服器端資料外洩威脅。

---

## 🚀 本地開發與建置 · Getting Started

### 系統需求

* Node.js 20.x 或以上
* npm 10.x 或以上

### 安裝與啟動

```bash
# 1. 複製專案
git clone [https://github.com/jackylawck/JAR-QubitLab.git](https://github.com/jackylawck/JAR-QubitLab.git)
cd JAR-QubitLab

# 2. 安裝依賴套件
npm ci

# 3. 執行量子引擎物理精度單元測試 (Vitest)
npx vitest run

# 4. 啟動本機開發伺服器
npm run dev

```

### 驗證與生產打包

```bash
# 執行 TypeScript 嚴格檢查與生產建置
npm run build

# 本機預覽生產環境（請開啟 http://localhost:4173/JAR-QubitLab/ 驗證 SW 離線快取）
npm run preview

# 執行建置完整性與安全性稽核腳本
node scripts/verify-build.mjs

```

---

## 📜 授權協議 · License

本專案採用 [MIT License](https://www.google.com/search?q=LICENSE) 授權開源。歡迎學術交流、教育演示與個人研究非商業使用。


