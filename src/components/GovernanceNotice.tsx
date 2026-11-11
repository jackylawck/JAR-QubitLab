/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { useState } from 'react';
import { useLocaleStore } from '../store/localeStore';

export const GovernanceNotice = () => {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocaleStore((s) => s.locale);

  return (
    <>
      {/* 觸發按鈕：建議放置於畫面右下角或 Footer */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-2 right-2 z-40 text-[9px] sm:text-[10px] text-slate-500 hover:text-sky-400 font-mono tracking-widest transition-colors opacity-60 hover:opacity-100"
      >
        GOVERNANCE & COMPLIANCE
      </button>

      {/* 模態框 (Modal) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm touch-none">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#090d16] border border-slate-700 rounded-lg shadow-2xl p-5 sm:p-8">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            <h2 className="text-base sm:text-lg font-bold text-sky-400 mb-6 font-mono border-b border-slate-800 pb-2">
              {locale === 'zh' ? '系統架構與合規聲明' : 'System Governance & Compliance Notice'}
            </h2>

            <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              
              {/* 1. 隱私與資料保護 (GDPR / PDPO / ISO 27701) */}
              <section>
                <h3 className="text-emerald-400 font-bold mb-1 font-mono">
                  01. 零數據保留與隱私保護 (Zero Data Retention)
                </h3>
                <p className="mb-2">
                  {locale === 'zh'
                    ? '本系統落實「預設隱私（Privacy by Design）」。運作期間絕對不收集、不處理、不傳輸任何個人可識別資訊（PII）。使用者的瀏覽器本機儲存（Local Storage）僅用於記錄基礎介面偏好（語系與音效狀態）。'
                    : 'This system operates strictly on a Privacy-by-Design principle. Zero Personally Identifiable Information (PII) is collected, processed, or transmitted. Browser local storage is utilized exclusively for saving non-identifiable UI preferences (locale and audio states).'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  * Compliance Alignment: HK PDPO, EU GDPR (Exempt from explicit consent due to purely technical necessity), ISO/IEC 27701.
                </p>
              </section>

              {/* 2. 非 AI 系統聲明 (EU AI Act / ISO 42001) */}
              <section>
                <h3 className="text-amber-400 font-bold mb-1 font-mono">
                  02. 確定性物理引擎 (Deterministic Engine & AI-Exclusion)
                </h3>
                <p className="mb-2">
                  {locale === 'zh'
                    ? '為免疑義，本微觀量子模擬器屬於「確定性數學與物理運算系統」，完全由前端 JavaScript 矩陣代數驅動。本項目不包含任何機器學習模型、神經網路或生成式人工智能（Generative AI），因此不受任何 AI 特定監管框架限制。'
                    : 'For the avoidance of doubt, this quantum simulator is a deterministic mathematical physics engine powered entirely by client-side matrix algebra. It does NOT incorporate machine learning models, neural networks, or Generative AI. Consequently, AI-specific regulatory frameworks do not apply.'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  * Out of Scope: EU AI Act, ISO/IEC 42001, CAC Generative AI Measures.
                </p>
              </section>

              {/* 3. 資訊安全 (ISO 27001) */}
              <section>
                <h3 className="text-purple-400 font-bold mb-1 font-mono">
                  03. 客戶端邊緣運算安全 (Client-Side InfoSec)
                </h3>
                <p className="mb-2">
                  {locale === 'zh'
                    ? '本系統採用 100% 無伺服器（Serverless）與記憶體內（In-Memory）運算架構。所有程式碼與量子演化計算均於使用者的終端設備上封閉執行，並受到嚴格的內容安全策略（CSP）保護，從根本上消除伺服器端資料外洩風險。'
                    : 'The architecture is 100% serverless and executes entirely in-memory within the client device. Protected by a strict Content Security Policy (CSP), the absence of backend data processing fundamentally eliminates server-side data breach vectors.'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  * Security Posture: Aligned with ISO/IEC 27001 principles via architectural immunity.
                </p>
              </section>

              {/* 4. 免責聲明 */}
              <section>
                <h3 className="text-slate-200 font-bold mb-1 font-mono">
                  04. 聲明與用途 (Disclaimer)
                </h3>
                <p>
                  {locale === 'zh'
                    ? '本項目（J.A.R. QubitLab）為開放原始碼之學術與教育實驗產品。使用者應理解，這是一個視覺化的量子運算沙盒，不構成任何商業級加密或工業級量子測量之依據。'
                    : 'This project (J.A.R. QubitLab) is an open-source educational experiment. Users acknowledge this is a visual quantum sandbox and does not constitute a basis for commercial cryptography or industrial quantum measurement.'}
                </p>
              </section>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
