<!--
  Project: J.A.R. QubitLab
  Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
  ORCID: 0009-0006-0855-0842
-->

# Legal, Regulatory & Governance Compliance Charter
# 法律、監管架構與合規治理公約

**Project / 專案名稱：** J.A.R. QubitLab (Joint Applied Research)  
**Architecture / 系統架構：** Client-Side Zero Data Retention · Open Educational Science · Dual-Use Safe Harbor  
**Version / 文件版本：** v2.0 (Aligned with 4-Booth Simulation Scope)  
**Date of Ratification / 生效日期：** 2026-11-11  

---

## 1. Regulatory Scoping & AI-Exclusion Statement
## 1. 監管範圍界定與非人工智能排除聲明

### 1.1 Non-AI Deterministic Computation（非 AI 確定性運算）
- **EN:** J.A.R. QubitLab is an open-source educational quantum physics sandbox powered exclusively by deterministic linear algebra and unitary matrix transformations executed in-memory via client-side JavaScript. The system contains **no** Machine Learning (ML), Deep Neural Networks (DNN), Large Language Models (LLM), probabilistic generative weights, or autonomous adaptive inference engines.
- **ZH:** J.A.R. QubitLab 係一款開源教育用途之微觀量子物理沙盒，核心運算全數由客戶端記憶體內的確定性線性代數與酉矩陣變換（Unitary Matrix Transformations）驅動。本系統**未包含任何機器學習（ML）、深度神經網路（DNN）、大語言模型（LLM）、機率生成權重或自適應推論演算法**。

### 1.2 Out-of-Scope Regulatory Declarations（排除適用監管架構聲明）
- **Regulation (EU) 2024/1689 (EU AI Act):** Does not meet the statutory definition of an "AI System" under Article 3(1) and is therefore outside the scope of high-risk or general-purpose AI obligations.  
  *不符合歐盟《人工智能法案》第 3(1) 條關於「人工智能系統」之法定定義，不適用高風險或通用型 AI 監管義務。*
- **ISO/IEC 42001 (Artificial Intelligence Management System):** Out of scope; no AI lifecycle management or algorithmic bias auditing is applicable.  
  *非人工智能產品，免除 ISO/IEC 42001 人工智能管理體系（AIMS）合規審計。*
- **PRC Generative AI Measures（國家網信辦《生成式人工智能服務管理暫行辦法》）:** Out of scope; the software generates deterministic 3D physical visualizations rather than synthetic text, audio, or media content.  
  *不涉及生成式文本、音訊或影像內容之合成與公眾分發，非屬該辦法之監管標的。*

---

## 2. Export Control & Dual-Use Technology Exemption
## 2. 出口管制、軍民兩用與敏感科技安全港豁免

### 2.1 Fundamental Educational Science Scope（基礎科學教育範圍）
- **EN:** While advanced quantum computing and quantum cryptography are subject to international dual-use scrutiny under the Wassenaar Arrangement and national export regimes, this project strictly simulates **standard undergraduate textbook physics** across four pedagogical modules: (1) single-qubit Hadamard superposition and projective measurement, (2) Mach-Zehnder phase interferometry, (3) two-qubit Bell state entanglement, and (4) ideal three-qubit quantum teleportation illustrating the No-Cloning Theorem.
- **ZH:** 鑑於先進量子計算與量子密碼學可能受國際《瓦聖那協定》（Wassenaar Arrangement）及各國出口管制清單關注，本項目特此聲明：本模擬器四大展台僅呈現**大學物理本科教科書之公開基礎原理**，包括：(1) 單量子位元 Hadamard 疊加與投影測量、(2) 馬赫-曾德爾相位干涉、(3) 雙量子位元貝爾態糾纏，以及 (4) 闡述不可克隆定理之理想量子隱形傳態。

### 2.2 Statutory Safe Harbor & Technical Exclusions（法定安全港與技術排除）
- **US EAR 15 CFR § 734.7 & § 734.8 (Published & Fundamental Research):** Publicly available educational software and fundamental scientific models published openly without proprietary access restrictions are exempt from US Export Administration Regulations (EAR) jurisdiction.  
  *依據美國《出口管理條例》（EAR）第 734.7 及 734.8 條，公開發布之教育軟體與基礎科學模型免除 EAR 出口管制審查。*
- **PRC Dual-Use Export Control Regulations（中國《兩用物項出口管制條例》）:** Contains zero controlled dual-use hardware interfaces, restricted dilution refrigerator telemetry, or sensitive quantum engineering parameters.  
  *不含任何管制清單所列之軍民兩用硬體控制邏輯、稀釋製冷機遙測或敏感量子工程參數。*
- **Zero Cryptanalysis, QKD Hardware, or Military Logic（密碼破解與軍工排除）:** This application contains **zero** physical cryogenic/photonic hardware drivers, **zero** fault-tolerant Quantum Error Correction (QEC) architectures, **zero** Quantum Key Distribution (QKD) hardware protocols, and **zero** cryptanalytic algorithms (e.g., Shor's or Grover's key-recovery routines).  
  *本系統完全不包含低溫製冷或光學硬體驅動程式、容錯量子糾錯（QEC）架構、量子密鑰分發（QKD）實體協定，亦無任何密碼破解演算法（如 Shor 演算法）。*

---

## 3. Privacy, Data Protection & InfoSec Alignment
## 3. 個人隱私保護、資料治理與資訊安全標準

### 3.1 Zero Data Retention Architecture（零數據留存架構）
- **Hong Kong Personal Data (Privacy) Ordinance (Cap. 486 PDPO):** Fully compliant. Under Section 2(1), no Personally Identifiable Information (PII) or data relating to an identifiable living individual is solicited, collected, transmitted, or logged.  
  *完全符合香港法例第 486 章《個人資料（私隱）條例》；依據第 2(1) 條，系統不徵集、不收集、不傳輸亦不記錄任何可識別個人身分之資料（PII）。*
- **EU GDPR (Regulation 2016/679) & ePrivacy Alignment:** Exempt under GDPR Recital 26 (non-personal/anonymous execution). Browser `localStorage` is utilized strictly for functional, non-tracking UI preferences (`jar_qubitlab_locale` for language and `jar_qubitlab_sound_muted` for audio state), qualifying as strictly necessary technical storage exempt from tracking-cookie consent banners.  
  *依據歐盟 GDPR 序言第 26 條（非個人／匿名運算）獲得豁免。瀏覽器 `localStorage` 僅用於儲存純功能性之技術偏好（`jar_qubitlab_locale` 語系與 `jar_qubitlab_sound_muted` 靜音狀態），屬嚴格必要之功能性儲存，無任何跨站追蹤或行為分析。*

### 3.2 Information Security & Supply Chain Integrity（ISO/IEC 27001 資訊安全對齊）
- **100% Client-Side In-Memory Execution（全記憶體封閉運算）:** Operates with zero backend servers, zero external API calls, zero cloud databases, and zero third-party telemetry or analytics scripts, eliminating server-side breach vectors at the architectural level.  
  *無後端伺服器、無外部 API 呼叫、無雲端資料庫，且無任何第三方遙測或分析腳本，從架構源頭杜絕伺服器資料外洩風險。*
- **Hermetic Sandbox & Content Security Policy（嚴格內容安全策略）:** Enforced via strict Content Security Policy (`default-src 'self'`) and static asset integrity verification, mitigating Cross-Site Scripting (XSS) and unauthorized data exfiltration.  
  *透過嚴格的內容安全策略（`default-src 'self'`）與靜態資源完整性校驗（SHA-256 / CI 自動化驗證），有效防禦跨站腳本攻擊（XSS）與未授權資料外傳。*

---

## 4. Academic Disclaimer & Limited Warranty
## 4. 學術免責與擔保限制

- **EN:** This software and its accompanying documentation are provided **"AS IS"**, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement. It is intended strictly for academic, visual, and pedagogical demonstration, and shall **not** be utilized as an operational baseline for industrial quantum hardware calibration, cryptographic security validation, aerospace engineering, or mission-critical decision-making.
- **ZH:** 本軟體及其隨附文件均按**「現狀（AS IS）」**提供，不附帶任何明示或暗示之擔保（包括但不限於適銷性、特定用途適用性及不侵權之擔保）。本工具僅供學術教育、物理可視化與教學演示用途，**嚴禁**作為工業級量子硬體校準、密碼學安全驗證、航太工程或任何關鍵任務決策之基準。

---

*Governance & Compliance Alignment: EU AI Act (Out-of-Scope) · US EAR § 734.7/734.8 (Exempt) · HK Cap. 486 PDPO & EU GDPR (Zero-PII) · ISO/IEC 27001 Security-by-Design.*
