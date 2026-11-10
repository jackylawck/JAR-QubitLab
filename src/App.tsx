// src/App.tsx
import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { BoothOne } from './components/BoothOne';
import { BoothTwo } from './components/BoothTwo';
import { QuantumField } from './components/QuantumField';
import { LanguageToggle } from './components/LanguageToggle';
import { useAnimationLock } from './hooks/useAnimationLock';
import { useLocaleStore } from './store/localeStore';
import { sound } from './audio/soundEngine';

// 3D 載入過渡狀態：取代 fallback={null}，防堵字體或模組載入延遲時畫面黑屏卡死
function BoothFallback() {
  const t = useLocaleStore((state) => state.t);
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 select-none pointer-events-none whitespace-nowrap">
        <div className="w-7 h-7 border-2 border-sky-400 border-t-transparent rounded-full animate-spin shadow-[0_0_12px_rgba(56,189,248,0.5)]" />
        <span className="text-[11px] font-mono tracking-widest text-sky-300/80">
          {t.common.standby || 'LOADING...'}
        </span>
      </div>
    </Html>
  );
}

export default function App() {
  const { isAnimating } = useAnimationLock();
  const [activeBooth, setActiveBooth] = useState<'one' | 'two'>('one');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { locale } = useLocaleStore();

  // iOS Safari 音訊喚醒防護
  useEffect(() => {
    const unlockAudio = () => {
      sound.unlock();
      window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    return () => window.removeEventListener('pointerdown', unlockAudio);
  }, []);

  return (
    <div className="w-full h-[100dvh] bg-gray-950 text-gray-100 font-sans overflow-hidden relative touch-none select-none">
      {/* 3D 物理與量子畫布 */}
      <Canvas 
        camera={{ position: [0, 5.5, 10.5], fov: 48 }}
        dpr={[1, 2]}
        frameloop={isAnimating ? 'always' : 'demand'}
        className="absolute inset-0 z-0"
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15
        }}
      >
        <color attach="background" args={['#030712']} />
        
        {/* 背景微觀量子浮動場 */}
        <QuantumField count={450} />
        
        <ambientLight intensity={0.85} />
        <directionalLight position={[5, 10, 5]} intensity={1.3} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />

        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4.5} 
          maxPolarAngle={Math.PI / 2.15} 
          minDistance={4.5} 
          maxDistance={13} 
          target={[0, 0.4, 0]}
        />

        {/* 加入實體 Fallback，杜絕因 WOFF 字體載入卡死顯示空白星空的問題 */}
        <Suspense fallback={<BoothFallback />}>
          {activeBooth === 'one' ? <BoothOne /> : <BoothTwo />}
        </Suspense>
      </Canvas>

      {/* 頂部導航欄：採用自適應 Flexbox 佈局，杜絕小螢幕標題與按鈕互相疊撞 */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2.5 sm:px-6 sm:py-4 pointer-events-none bg-gradient-to-b from-gray-950/80 via-gray-950/40 to-transparent">
        <div className="pointer-events-auto">
          <h1 className="text-sm sm:text-lg md:text-xl font-black tracking-tight text-white drop-shadow flex items-center gap-1.5">
            <span>J.A.R. QubitLab</span>
            <span className="text-sky-400 font-light">|</span>
            <span className="text-xs sm:text-sm font-medium text-slate-300">
              {locale === 'zh' ? '量子微觀實驗室' : 'Quantum Lab'}
            </span>
          </h1>
          <p className="hidden sm:block text-slate-400 text-xs mt-0.5">
            {locale === 'zh' ? '滑鼠/手指拖曳旋轉視角 · 點擊裝置互動' : 'Drag to rotate view · Tap devices to interact'}
          </p>
        </div>

        {/* 頂部右側控制按鈕組 */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          <LanguageToggle />
          
          <button 
            onClick={() => setActiveBooth('one')} 
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 ${
              activeBooth === 'one' 
                ? 'bg-blue-600 text-white shadow-blue-500/30 ring-1 ring-blue-400' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            {locale === 'zh' ? '展台 1' : 'Booth 1'}
          </button>
          
          <button 
            onClick={() => setActiveBooth('two')} 
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 ${
              activeBooth === 'two' 
                ? 'bg-cyan-600 text-white shadow-cyan-500/30 ring-1 ring-cyan-400' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            {locale === 'zh' ? '展台 2' : 'Booth 2'}
          </button>
        </div>
      </header>

      {/* 底部科學館說明展牌 (支援收折與高對比顯示) */}
      <footer className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl sm:w-11/12 sm:max-w-2xl z-10 pointer-events-auto shadow-2xl transition-all duration-300">
        
        {/* 標題與收折開關列 */}
        <div 
          className="flex justify-between items-center px-3.5 py-2.5 sm:px-5 sm:py-3.5 cursor-pointer select-none"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-2">
            <span className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded border tracking-wider ${
              activeBooth === 'one'
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
            }`}>
              {activeBooth === 'one' 
                ? (locale === 'zh' ? '展台 1' : 'Booth 1') 
                : (locale === 'zh' ? '展台 2' : 'Booth 2')}
            </span>
            <h2 className="text-xs sm:text-sm md:text-base font-bold text-white">
              {activeBooth === 'one' 
                ? (locale === 'zh' ? '疊加與坍縮' : 'Superposition & Collapse') 
                : (locale === 'zh' ? '波動干涉與機率搬運' : 'Wave Interference')}
            </h2>
          </div>

          <button 
            type="button"
            className="text-[11px] sm:text-xs text-sky-400 font-medium px-2 py-1 rounded bg-sky-950/40 border border-sky-800/40 hover:bg-sky-900/50 transition-colors whitespace-nowrap ml-2"
          >
            {isCollapsed 
              ? (locale === 'zh' ? '展開說明 ▲' : 'Expand ▲') 
              : (locale === 'zh' ? '收起 ▼' : 'Collapse ▼')}
          </button>
        </div>

        {/* 折疊抽屜內容區 */}
        {!isCollapsed && (
          <div className="px-3.5 pb-3.5 sm:px-5 sm:pb-5 space-y-2.5 text-gray-300 leading-relaxed text-xs sm:text-sm border-t border-slate-800 pt-3 max-h-[30vh] sm:max-h-[35vh] overflow-y-auto">
            {activeBooth === 'one' ? (
              locale === 'zh' ? (
                <p>
                  撥動分光桿，相當於對球施加了一次 <strong className="text-white">Hadamard 門</strong>——它從「確定在左邊」變成「同時在左邊和右邊」。<br/><br/>
                  當球處於<strong className="text-white">疊加態</strong>時，它不是「轉太快看不清」，而是拍照前<strong className="text-white">根本沒有決定</strong>在哪邊，拍照的動作迫使它選邊站；但如果球本來就在某一邊 (純左或右態)，那它的位置本就是確定的。
                </p>
              ) : (
                <p>
                  Pulling the beam-splitter lever applies a <strong className="text-white">Hadamard gate</strong>—the ball evolves from 'definitely left' into 'both left and right simultaneously'.<br/><br/>
                  When the ball is in a <strong className="text-white">superposition</strong>, it isn't 'spinning too fast to see'—it genuinely hasn't decided its position before the shutter clicks, and the measurement forces it to choose. However, if the ball is already in a basis state, its position is already determined.
                </p>
              )
            ) : (
              locale === 'zh' ? (
                <p>
                  量子演化遵循能量守恆，相消干涉<strong className="text-white">不會讓總能量消失</strong>，而是將機率「搬運」到另一路徑！<br/><br/>
                  依序執行：① 撥動分光使粒子走兩條路 → ② 旋轉舵盤翻轉相位 (π) → ③ 匯流對撞。<br/>
                  若<strong className="text-sky-300">同相</strong>，Path B 相消蒸發，機率全數匯聚至 Path A；若<strong className="text-pink-400">反相</strong>，Path A 相消蒸發，機率全數搬運至 Path B！
                </p>
              ) : (
                <p>
                  Quantum evolution preserves total probability. Destructive interference does not annihilate energy; it redistributes amplitude!<br/><br/>
                  Sequence: ① Split paths → ② Flip phase (π) → ③ Recombine.<br/>
                  <strong className="text-sky-300">In-phase:</strong> Path B destructively cancels to zero while Path A amplifies to 1.0.<br/>
                  <strong className="text-pink-400">Anti-phase:</strong> Path A destructively cancels to zero while amplitude is completely transferred into Path B!
                </p>
              )
            )}
          </div>
        )}
      </footer>
    </div>
  );
}
