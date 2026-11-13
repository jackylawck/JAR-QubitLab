// src/components/GovernanceNotice.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Classification: PUBLIC COMPLIANCE & LEGAL SPECIFICATION
 */
import { useState, useEffect, useCallback } from 'react';
import { useLocaleStore } from '../store/localeStore';
import { sound } from '../audio/soundEngine';

type TabType = 'scope' | 'export' | 'privacy' | 'disclaimer';

interface TabConfig {
  id: TabType;
  num: string;
  zh: string;
  en: string;
  activeClass: string;
}

const TABS: readonly TabConfig[] = [
  {
    id: 'scope',
    num: '01.',
    zh: 'AI 法規排除',
    en: 'AI-Act Scoping',
    activeClass: 'border-sky-400 text-sky-400 bg-slate-900/60',
  },
  {
    id: 'export',
    num: '02.',
    zh: '出口管制與雙用途',
    en: 'Export & Dual-Use',
    activeClass: 'border-amber-400 text-amber-400 bg-slate-900/60',
  },
  {
    id: 'privacy',
    num: '03.',
    zh: '隱私與資安架構',
    en: 'Privacy & InfoSec',
    activeClass: 'border-emerald-400 text-emerald-400 bg-slate-900/60',
  },
  {
    id: 'disclaimer',
    num: '04.',
    zh: '學術免責保證',
    en: 'Warranty & Use',
    activeClass: 'border-purple-400 text-purple-400 bg-slate-900/60',
  },
];

export const GovernanceNotice = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('scope');
  const locale = useLocaleStore((s) => s.locale);

  const handleOpen = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    sound.unlock();
    sound.playTick(1);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    sound.playTick(0);
    setIsOpen(false);
  }, []);

  const handleTabChange = useCallback((tab: TabType) => {
    sound.playTick(2);
    setActiveTab(tab);
  }, []);

  // 阻絕 3D 畫布 OrbitControls 的事件穿透
  const stopPointerPropagation = useCallback((e: React.PointerEvent<HTMLElement>) => {
    e.stopPropagation();
  }, []);

  // 支援 ESC 鍵快速關閉彈窗
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  return (
    <>
      {/* 觸發入口：懸浮於底部右側，低調具專業感 */}
      <button
        type="button"
        onClick={handleOpen}
        onPointerDown={stopPointerPropagation}
        onPointerUp={stopPointerPropagation}
        className="fixed bottom-2.5 right-3 z-40 text-[9px] sm:text-[10px] text-slate-400 hover:text-sky-400 font-mono tracking-widest transition-all bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded shadow-sm backdrop-blur-sm cursor-pointer select-none touch-manipulation active:scale-95"
        aria-label={locale === 'zh' ? '開啟合規與法規治理聲明' : 'Open Compliance & Legal Notice'}
      >
        🛡️ {locale === 'zh' ? '合規與法規治理' : 'GOVERNANCE & COMPLIANCE'}
      </button>

      {/* 模態彈窗 (Modal) */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="governance-modal-title"
          onClick={handleClose}
          onPointerDown={stopPointerPropagation}
          onPointerUp={stopPointerPropagation}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[88vh] flex flex-col bg-[#090d16] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden font-mono text-slate-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#030712]">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  aria-hidden="true"
                />
                <h2 id="governance-modal-title" className="text-xs sm:text-sm font-bold tracking-wider text-slate-100">
                  {locale === 'zh' ? '法規治理與出口管制合規聲明' : 'LEGAL, REGULATORY & EXPORT COMPLIANCE'}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label={locale === 'zh' ? '關閉' : 'Close'}
                className="text-slate-400 hover:text-white text-base px-2 py-0.5 rounded transition-colors cursor-pointer active:scale-95"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div
              role="tablist"
              aria-label={locale === 'zh' ? '合規章節選單' : 'Compliance Sections'}
              className="flex border-b border-slate-800 bg-slate-950/60 text-[11px] sm:text-xs overflow-x-auto select-none"
            >
              {TABS.map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-4 py-2.5 font-bold transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
                      isSelected
                        ? tab.activeClass
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.num} {locale === 'zh' ? tab.zh : tab.en}
                  </button>
                );
              })}
            </div>

            {/* Modal Body Content */}
            <div
              role="tabpanel"
              className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans"
            >
              {/* TAB 1: AI SCOPE */}
              {activeTab === 'scope' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-sky-950/30 border border-sky-800/50 rounded-lg">
                    <h3 className="text-sky-300 font-bold font-mono text-xs mb-1.5">
                      {locale === 'zh' ? '確定性線性代數 vs 人工智能系統' : 'Deterministic Linear Algebra vs. AI Systems'}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === 'zh'
                        ? 'J.A.R. QubitLab 係純粹由 JavaScript 矩陣代數運算驅動的微觀物理模擬器。系統運算完全依循確定性酉矩陣演化（Unitary Matrix Transformation），無任何機器學習（ML）、深度神經網絡、LLM 或自主適應推論演算法。'
                        : 'J.A.R. QubitLab is a microscopic quantum mechanics simulator driven entirely by deterministic matrix algebra. It employs NO machine learning models, neural networks, LLMs, or autonomous inferencing algorithms.'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-slate-100 font-bold mb-1.5 font-mono text-xs">
                      {locale === 'zh' ? '明確不適用之監管架構 (Out of Regulatory Scope)：' : 'Explicit Out-of-Scope Frameworks:'}
                    </h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400 font-mono">
                      <li>
                        <strong className="text-slate-200">EU AI Act (Regulation 2024/1689):</strong>{' '}
                        {locale === 'zh' ? '不符合第 3(1) 條 AI System 定義。' : 'Does not qualify as an "AI System" under Article 3(1).'}
                      </li>
                      <li>
                        <strong className="text-slate-200">ISO/IEC 42001 (AIMS):</strong>{' '}
                        {locale === 'zh' ? '非 AI 產品，免除 AI 治理系統審計。' : 'Non-AI product; exempt from AIMS compliance.'}
                      </li>
                      <li>
                        <strong className="text-slate-200">國家網信辦《生成式人工智能服務管理暫行辦法》:</strong>{' '}
                        {locale === 'zh' ? '不涉及生成式文本/影音生成，非監管標的。' : 'No synthetic content generation; not subject to Generative AI filings.'}
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: EXPORT CONTROL & DUAL-USE */}
              {activeTab === 'export' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-amber-950/30 border border-amber-800/50 rounded-lg">
                    <h3 className="text-amber-300 font-bold font-mono text-xs mb-1.5">
                      {locale === 'zh' ? '公開基礎科學與法定安全港豁免' : 'Fundamental Public Science & Safe Harbor Defense'}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === 'zh'
                        ? '儘管先進量子計算與量子通訊受國際《瓦聖那協定》及各國出口管制關注，本專案僅模擬大學本科教材之公開物理學原理（Hadamard 疊加、馬赫-曾德爾相位干涉）。完全符合公開科學軟體之安全港標準。'
                        : 'While quantum computing can be subject to dual-use controls under the Wassenaar Arrangement and national export regimes, this project merely simulates fundamental textbook physics (Hadamard superposition, Mach-Zehnder interferometry), protected by public science safe harbors.'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-slate-100 font-bold mb-1.5 font-mono text-xs">
                      {locale === 'zh' ? '出口管制排除證明 (Export Control Exemptions)：' : 'Export Control Exclusions:'}
                    </h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400 font-mono">
                      <li>
                        <strong className="text-slate-200">US EAR 15 CFR § 734.7 & § 734.8:</strong>{' '}
                        {locale === 'zh' ? '公開發布之教育軟體與基礎科研免除 EAR 審查。' : 'Publicly available educational software is exempt from EAR jurisdiction.'}
                      </li>
                      <li>
                        <strong className="text-slate-200">中國《兩用物項出口管制條例》:</strong>{' '}
                        {locale === 'zh' ? '無管制清單之軍民兩用硬體接口，純科普展示。' : 'Zero dual-use military hardware control logic.'}
                      </li>
                      <li>
                        <strong className="text-slate-200">軍事與密碼學排除:</strong>{' '}
                        {locale === 'zh' ? '不包含低溫稀釋製冷控制、容錯量子糾錯 (QEC) 及 Shor 密鑰破解演算法。' : 'Zero cryogenic drivers, zero QEC hardware controls, and zero Shor cryptanalysis routines.'}
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 3: PRIVACY & INFOSEC */}
              {activeTab === 'privacy' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/50 rounded-lg">
                    <h3 className="text-emerald-300 font-bold font-mono text-xs mb-1.5">
                      {locale === 'zh' ? '零數據留存架構 (Zero Data Retention Architecture)' : 'Privacy-by-Design & Zero Retention'}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === 'zh'
                        ? '本系統落實架構性隱私保護。無後端伺服器、無使用者個人識別資訊（PII）收集、無遠端遙測追蹤。本機 localStorage 僅用以儲存技術性偏好（語系、靜音），合規免除 Cookie 同意橫幅。'
                        : 'Engineered with zero telemetry, zero trackers, and zero backend databases. No Personally Identifiable Information (PII) is processed. Local storage is strictly used for functional UI states (locale, mute toggle).'}
                    </p>
                  </div>
                  <div className="space-y-2 text-xs text-slate-400 font-mono">
                    <p>
                      • <strong className="text-slate-200">HK Cap. 486 (PDPO) & EU GDPR:</strong>{' '}
                      {locale === 'zh' ? '無涉及個人資料，完全符合豁免標準。' : 'Completely exempt from PII regulations via absolute anonymity.'}
                    </p>
                    <p>
                      • <strong className="text-slate-200">ISO/IEC 27001 InfoSec:</strong>{' '}
                      {locale === 'zh' ? '全記憶體封閉運算，搭配嚴格 Content Security Policy (CSP)，從源頭杜絕伺服器資料外洩。' : '100% in-memory client execution protected by strict CSP, eliminating server breach vectors.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: DISCLAIMER */}
              {activeTab === 'disclaimer' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-purple-950/30 border border-purple-800/50 rounded-lg">
                    <h3 className="text-purple-300 font-bold font-mono text-xs mb-1.5">
                      {locale === 'zh' ? '學術與非商業免責聲明' : 'Academic & Non-Commercial Disclaimer'}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === 'zh'
                        ? '本模擬器為開源教育沙盒，按「現狀（AS IS）」提供。本軟體運算結果不得作為航太工業、核子工程、軍工加密或高精密實驗室之實體測量基準。'
                        : 'Provided strictly "AS IS" for pedagogical and visual experimentation. Not calibrated for aerospace engineering, military cryptography, or operational quantum hardware baselines.'}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-1.5 font-mono">
                    <p>• <strong className="text-slate-200">Organization:</strong> Joint Applied Research (Client-Side Architecture)</p>
                    <p>• <strong className="text-slate-200">Distribution:</strong> Open-source Static Web App (Zero-Backend Execution)</p>
                    <p>• <strong className="text-slate-200">Security Verification:</strong> Automated CI Integrity Check via Vitest & SHA-256 Verified Assets</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-[#030712] text-[11px]">
              <span className="text-slate-500 font-mono truncate mr-2">
                ISO 27001 / EAR § 734.7 / GDPR EXEMPT ALIGNED
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold transition-all border border-slate-600 cursor-pointer shrink-0 active:scale-95"
              >
                {locale === 'zh' ? '關閉聲明' : 'Close Notice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
