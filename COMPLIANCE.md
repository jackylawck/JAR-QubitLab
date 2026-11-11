# Legal, Regulatory & Governance Compliance Charter
# 法律、監管架構與合規治理公約

**Project:** J.A.R. QubitLab (Joint Applied Research)  
**Governance Framework:** Zero Data Retention · Open Educational Science · Dual-Use Safe Harbor  
**Date of Ratification:** 2026-11-11  

---

## 1. Regulatory Scoping & AI-Exclusion Statement
## 1. 監管範圍界定與非人工智能排除聲明

### 1.1 Non-AI Deterministic Computation (非 AI 確定性運算)
* **EN:** J.A.R. QubitLab is an educational quantum physics sandbox powered exclusively by deterministic linear algebra and matrix transformations executed in-memory via client-side JavaScript. It does not employ Machine Learning (ML), Deep Neural Networks (DNN), Large Language Models (LLM), or adaptive inference engines.
* **ZH:** J.A.R. QubitLab 係一款純教育用途之微觀量子物理沙盒，核心運算全數由客戶端記憶體內的確定性線性代數與酉矩陣變換驅動。本系統**未包含任何機器學習（ML）、深度神經網路（DNN）、大語言模型（LLM）或自適應推論演算法**。

### 1.2 Out of Scope Declarations (排除適用聲明)
* **Regulation (EU) 2024/1689 (EU AI Act):** Does not meet the criteria of an "AI System" under Article 3(1).
* **ISO/IEC 42001 (Artificial Intelligence Management System):** Out of scope.
* **Cyberspace Administration of China (CAC) Generative AI Measures:** Out of scope.

---

## 2. Export Control & Dual-Use Technology Exemption
## 2. 出口管制、軍民兩用與敏感科技安全港豁免

### 2.1 Fundamental Educational Science (基礎科學教育免責)
* **EN:** While quantum information science can be subject to dual-use scrutiny under the Wassenaar Arrangement and national export controls (e.g., US EAR Category 4/5, Chinese Dual-Use Export Regulations), this project simulates **standard undergraduate textbook principles** (such as single-qubit Hadamard superposition, Mach-Zehnder interference, and unitary state transformations).
* **ZH:** 鑑於量子資訊科學可能涉及國際《瓦聖那協定》（Wassenaar Arrangement）及中外出口管制清單（如美國 EAR 第 4/5 類、中國《兩用物項出口管制條例》），本項目特此聲明：本模擬器僅呈現**大學物理本科教科書之公開基礎原理**（如單量子位元 Hadamard 疊加態、馬赫-曾德爾干涉儀與態向量演化）。

### 2.2 Safe Harbor Affirmation (法定安全港聲明)
* **EAR 15 CFR § 734.7 & § 734.8:** Publicly available educational software and fundamental research published openly without proprietary access restrictions are exempt from US EAR controls.
* **No Defense/Military Functionality:** This application contains **zero** physical control systems for cryogenics/dilution refrigerators, **zero** cryptographic key recovery (e.g., Shor's cryptanalysis), and **zero** aerospace guidance, navigation, or weaponization interfaces.

---

## 3. Privacy, Data Protection & InfoSec Alignment
## 3. 個人隱私保護、資料治理與資訊安全標準

### 3.1 Zero Data Retention (零數據留存架構)
* **Hong Kong Personal Data (Privacy) Ordinance (Cap. 486 PDPO):** Fully compliant. No personal identifiable information (PII) is solicited, collected, or logged.
* **EU General Data Protection Regulation (GDPR 2016/679):** Compliant under Recital 26 (Principles of data protection do not apply to anonymous/non-personal data).
* **Storage Disclosure:** Browser `localStorage` is used solely for non-identifying technical states: `jar_qubitlab_locale` (UI language) and `jar_qubitlab_sound_muted` (audio preference).

### 3.2 Information Security (ISO/IEC 27001 Alignment)
* **100% In-Memory Execution:** No backend servers, APIs, or cloud persistence.
* **Hermetic Sandbox:** Enforced by strict Content Security Policy (`default-src 'self'`) mitigating cross-site scripting (XSS) and data exfiltration.

---

## 4. Academic Disclaimer & Limited Warranty
## 4. 學術免責與擔保限制

* **EN:** This software is provided "AS IS", without warranty of any kind. It is intended strictly for academic, visual, and pedagogic demonstration. It shall not be utilized as an operational baseline for industrial quantum computing calibration, military cryptography, or mission-critical engineering.
* **ZH:** 本軟體按「現狀（AS IS）」提供，不附帶任何明示或暗示之擔保。本工具僅供學術教育、物理可視化與教學演示用途，嚴禁作為工業級量子電腦校準、軍工密碼破解或關鍵工程之決策基準。
