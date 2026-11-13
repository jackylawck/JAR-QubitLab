<!--
  Project: J.A.R. QubitLab
  Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
  ORCID: 0009-0006-0855-0842
-->

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

**J.A.R. QubitLab** 是一款專為現代瀏覽器與行動裝置打造的高保真、物理誠實（Physically Honest）的 3D 量子力學互動沙盒。系統捨棄傳統預錄動畫的展示方式，完全由前端原生矩陣運算引擎即時演化單／多量子位元（Single & Multi-Qubit）的態向量（State Vector）與相位空間，涵蓋四大互動實驗展台：

| 展台 | 量子物理核心 | 數學與演化機制 | 互動操作體驗 |
| :--- | :--- | :--- | :--- |
| **展台 1** | **疊加與測量坍縮**<br>*Superposition & Collapse* | 阿達馬門 $H\vert 0\rangle = \frac{1}{\sqrt{2}}(\vert 0\rangle + \vert 1\rangle)$ 與玻恩定則投影測量 | 撥動分光桿製備等權重疊加態，扣下快門觸發隨機波函數坍縮 |
| **展台 2** | **馬赫-曾德爾相位干涉**<br>*Mach-Zehnder Interference* | 相位門 $P(\theta)$ 連續演化（$0 \le \theta < 2\pi$）與二次分束對撞 | 拖曳 60Hz 磁吸相位舵盤，即時觀測相長增強與相消抵消的機率搬運 |
| **展台 3** | **雙量子位元糾纏與貝爾態**<br>*Entanglement & Bell States* | $H_{q_0} + \text{CNOT}_{q_0 \to q_1}$ 演化出 $\vert\Phi^+\rangle = \frac{1}{\sqrt{2}}(\vert 00\rangle + \vert 11\rangle)$ 與 Wootters 糾纏度（$C = 1$） | 執行 20 次連續投影測量抽樣（20x Sampling），實證非定域性關聯與 $\vert 01\rangle/\vert 10\rangle$ 消滅 |
| **展台 4** | **量子隱形傳態與不可克隆**<br>*Teleportation & No-Cloning* | 三量子位元貝爾基測量、2-bit 經典通訊與 $X / Z$ 么正修正閘 | 對照目標態幽靈殼（Wireframe Ghost）施加修正閘，驗證量子態重建與不可克隆定理 |

---

## 🛠️ 核心架構與技術特點 · Technical Architecture

- **雙軌零垃圾回收（Zero-GC）量子矩陣引擎 (`src/quantum/`)**：
  * `engine.ts`：採用 L1 快取友善的靜態 `Float64Array` Scratch 暫存區與無分支跨距演算法（Branchless Stride），搭配 1.5x 遲滯全局鎖相（Hysteresis Phase Lock）消除相位抖動。
  * `tensorEngine.ts`：一維交錯複數狀態向量引擎，支援多量子位元么正演化、Wootters Concurrence 糾纏度判定與協程可中斷抽樣。
- **企業級型別安全與防禦性渲染 (`tsconfig.json` & `src/utils/pool.ts`)**：
  * 全面啟用 `strict` 與 `noUncheckedIndexedAccess: true`，從編譯期杜絕陣列越界與未定義參照；3D 渲染管線採用全域靜態幾何／材質共享、預分配物件池（`POOL`）與顯式 GPU 資源釋放（`dispose`），確保跨裝置 60Hz/120Hz 零掉幀漂移與零記憶體洩漏。
- **原生合成器級物理音效聲景 (`src/audio/soundEngine.ts`)**：
  * 採用 Web Audio API 即時合成音訊，包含分光低頻震盪、水晶質感觀測快門、相消干涉的白噪音蒸發聲、經典位元脈衝與純四度／五度和弦，內建 iOS Safari 嚴格音訊喚醒與節點自動斷開機制。
- **離線優先 PWA 與無縫熱更新 (`public/sw.js` & `src/main.tsx`)**：
  * 支援獨立全螢幕安裝與 `Network-First` 離線導覽回退策略，內建 `hadController` 守衛與 `vite:preloadError` 恢復機制，確保部署更新後零閃爍與零快取衝突。
- **隱私第一與法規治理 (`src/components/GovernanceNotice.tsx` & `COMPLIANCE.md`)**：
  * 實施嚴格的**零數據留存（Zero Data Retention）**與預設隱私（Privacy by Design）。無後端 API、無追蹤 Cookie、無遙測日誌；明確區分確定性代數與 AI 監管邊界，遵循 US EAR § 734.7/734.8 公開科學教育軟體安全港條款。
- **硬核科幻 F12 觀測終端彩蛋 (`src/utils/easterEgg.ts`)**：
  * 主介面保持純粹嚴謹的學術物理用語；開啟瀏覽器開發者工具（F12 Console）則可解鎖致敬《銃夢》業子力學與經典機甲光譜密碼的雙語終端彩蛋。採用**雙層防混淆抗編譯綁定（Anti-Minifier Console Binding）**、**不可枚舉零括號 Getter 存取器**（支援直接輸入 `PALETTE`、`MELCHIZEDEK`、`FLAN`、`THE_LAST_ORDER`）、**Self-XSS 資安提示**、`FX_GC` 資源自動回收器，並自動遵循系統 `prefers-reduced-motion` 無障礙視覺保護偏好。

---

## 📂 檔案目錄結構 · Project Structure

```text
JAR-QubitLab/
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Actions 雙 Job 部署與 CI 自動化驗證工作流
├── public/
│   ├── fonts/
│   │   └── NotoSansMath-Regular.woff  # 數學符號專用離線字型
│   ├── JARQubitLab192icon.png         # 192x192 簡約雙態量子疊加 PWA 應用圖標
│   ├── JARQubitLab512icon.png         # 512x512 高保真 3D 離子井光學雷射圖標
│   ├── manifest.json                  # 現代 PWA 沉浸式獨立全螢幕設定檔
│   └── sw.js                          # Service Worker 離線快取與導覽回退管理
├── scripts/
│   └── verify-build.mjs               # CI 建置安全、資產雜湊與 CSP 完整性驗證腳本
├── src/
│   ├── audio/
│   │   └── soundEngine.ts             # Web Audio API 原生音效合成引擎
│   ├── components/
│   │   ├── console/
│   │   │   ├── ConsoleBoothOne.tsx    # 展台 1 控制台面板
│   │   │   ├── ConsoleBoothTwo.tsx    # 展台 2 控制台面板
│   │   │   ├── ConsoleBoothThree.tsx  # 展台 3 雙量子位元糾纏與 20x 抽樣控制台
│   │   │   └── ConsoleBoothFour.tsx   # 展台 4 量子隱形傳態與經典糾錯控制台
│   │   ├── BoothOne.tsx               # 展台 1：疊加與快門觀測 3D 場景
│   │   ├── BoothTwo.tsx               # 展台 2：連續相位干涉與對撞 3D 場景
│   │   ├── BoothThree.tsx             # 展台 3：雙量子位元機率能量柱與貝爾態光軌 3D 場景
│   │   ├── BoothFour.tsx              # 展台 4：Alice/Bob 雙端台座、幽靈殼與經典通道 3D 場景
│   │   ├── GovernanceNotice.tsx       # 企業級法規治理、出口管制與隱私合規聲明彈窗
│   │   ├── InterferenceBurst.tsx      # 干涉對撞能量粒子爆發視覺效果（Zero-GC）
│   │   ├── LanguageToggle.tsx         # 中英雙語切換按鈕（含跨分頁同步與手勢防穿透）
│   │   ├── LaserBeam.tsx              # 3D 空間相干雷射導軌（單位圓柱體 Zero-GC 縮放）
│   │   ├── PhaseDial.tsx              # 60Hz 連續相位舵盤旋轉控制器
│   │   └── QuantumField.tsx           # 背景量子真空漲落粒子場（頂點色彩 Zero-GC）
│   ├── hooks/
│   │   ├── useAnimationLock.ts        # 動畫播放全域鎖（含看門狗防呆與併發防護）
│   │   └── usePointerDial.ts          # 支援移動端觸控與角域磁吸的舵盤追蹤 Hook
│   ├── i18n/
│   │   └── translations.ts            # 繁體中文 / 英文雙語字典定義
│   ├── quantum/
│   │   ├── engine.test.ts             # 量子態酉性、Big-Endian 與干涉完整性單元測試
│   │   ├── engine.ts                  # 核心量子態演化數學引擎（L1 Scratchpad 純函數）
│   │   ├── tensorEngine.ts            # 多量子位元張量態向量與糾纏度計算引擎
│   │   └── types.ts                   # 量子態向量、唯讀複數振幅與演化契約型別
│   ├── store/
│   │   ├── localeStore.ts             # 語系狀態管理（含跨分頁同步與 HMR 清理）
│   │   ├── quantumStore.ts            # 展台 1 & 2 量子態全域狀態容器（Zustand）
│   │   ├── tensorStore.ts             # 展台 3 多量子位元與協程抽樣狀態容器（Zustand）
│   │   └── teleportStore.ts           # 展台 4 隱形傳態階段與雙位元糾錯狀態容器
│   ├── utils/
│   │   ├── easterEgg.ts               # F12 賽博龐克雙語互動彩蛋（含 FX_GC 與防混淆綁定）
│   │   └── pool.ts                    # Three.js 3D 運算靜態物件池（Zero-GC Pool）
│   ├── App.tsx                        # 主應用程式入口、畫布相機與四展台調度中心
│   ├── constants.ts                   # 集中化環境變數、靜態資源與物理容差常數
│   ├── index.css                      # Tailwind CSS 與基礎無障礙樣式
│   ├── main.tsx                       # React 18 掛載點、PWA 熱更新與彩蛋初始化
│   └── vite-env.d.ts                  # Vite TypeScript 環境與著色器型別宣告
├── .gitignore
├── COMPLIANCE.md                      # 法律治理、出口管制（EAR）與非 AI 豁免聲明公約
├── index.html                         # 嚴格 CSP、Permissions-Policy 與現代 PWA 標籤
├── package.json                       # 專案依賴與建置腳本（含 engines 版本鎖定）
├── postcss.config.js                  # PostCSS 編譯管線配置
├── tailwind.config.js                 # Tailwind CSS 配置（含 Safe Area 與動態視口）
├── tsconfig.json                      # 嚴格模式 TypeScript 編譯設定
└── vite.config.ts                     # Vite 打包、跨平台分塊與零依賴 Vitest 配置

```

---

## 🛡️ 法規治理與出口管制 · Governance & Safe Harbor

本項目在開發過程中嚴格落實法規定界，完整法律聲明已收錄於 [`COMPLIANCE.md`](COMPLIANCE.md)：

1. **確定性物理引擎聲明（Non-AI System）**：
系統核心均為確定性線性代數矩陣變換，**不包含機器學習、神經網路或生成式 AI 演算法**，明確排除於歐盟《人工智能法案》（EU AI Act 2024/1689）第 3(1) 條、國家網信辦《生成式人工智能服務管理暫行辦法》及 ISO/IEC 42001 審計範疇之外。
2. **公開科學教育安全港（Export Controls Safe Harbor）**：
本系統模擬之四大物理模組均源自公開教科書基礎原理，符合美國出口管制條例 EAR 15 CFR § 734.7 & § 734.8 公開教育與基礎科研法定豁免，且不包含量子密鑰分發（QKD）硬體驅動、容錯量子糾錯（QEC）、軍用密碼破解或低溫製冷控制等敏感兩用物項。
3. **架構性隱私保護（Privacy by Design）**：
系統完全於客戶端記憶體封閉運作，符合香港《個人資料（私隱）條例》（Cap. 486 PDPO）第 2(1) 條、歐盟 GDPR 序言第 26 條及 ePrivacy 嚴格必要功能性儲存標準。實施嚴格 W3C 內容安全策略（CSP），從架構源頭根絕伺服器端資料外洩風險。

---

## 🚀 本地開發與建置 · Getting Started

### 系統需求

* **Node.js**：20.x 或以上
* **npm**：10.x 或以上

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




