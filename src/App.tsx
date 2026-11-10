// src/App.tsx
import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BoothOne } from './components/BoothOne';
import { BoothTwo } from './components/BoothTwo';
import { QuantumField } from './components/QuantumField';
import { useAnimationLock } from './hooks/useAnimationLock';
import { useLocaleStore } from './store/localeStore';
import { sound } from './audio/soundEngine';

export default function App() {
  const { isAnimating } = useAnimationLock();
  const [activeBooth, setActiveBooth] = useState<'one' | 'two'>('one');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { locale, toggleLocale } = useLocaleStore();

  // 🌟 iOS Web Audio 喚醒：在第一次全域觸控時解鎖音效
  const handleFirstInteraction = () => {
    sound.unlock();
  };

  return (
    // 🌟 使用 h-[100dvh] 完美適配 Safari 底部網址列，touch-none 封殺橡皮筋回彈
    <div 
      className="w-full h-[100dvh] bg-gray-950 text-gray-100 font-sans overflow-hidden relative touch-none"
      onPointerDown={handleFirstInteraction}
    >
      <Canvas 
        camera={{ position: [0, 6, 11], fov: 50 }}
        dpr={[1, 2]}
        // 🌟 效能救援：非動畫期間切換為 'demand'，大幅降低手機發熱與耗電
        frameloop={isAnimating ? 'always' : 'demand'}
        className="absolute inset-0 z-0"
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15
        }}
      >
        <color attach="background" args={['#030712']} />
        <QuantumField count={500} />
        
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 10, 5]} intensity={1.3} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.6} />

        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2.2} 
          minDistance={4} 
          maxDistance={14} 
          target={[0, 0.5, 0]}
        />

        <Suspense fallback={null}>
          {activeBooth === 'one' ? <BoothOne /> : <BoothTwo />}
        </Suspense>
      </Canvas>

      {/* 頂部標題 */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 pointer-events-none">
        <h1 className="text-xl md:text-3xl font-black tracking-tighter text-white drop-shadow-md">
          J.A.R. QubitLab <span className="text-blue-400">|</span> <span className="text-lg md:text-2xl">{locale === 'zh' ? '量子微觀實驗室' : 'Quantum Lab'}</span>
        </h1>
        <p className="text-gray-400 mt-1 text-xs md:text-sm">
          {locale === 'zh' ? '滑鼠/手指拖曳旋轉視角' : 'Drag to rotate view'}
        </p>
      </div>

      {/* 頂部右側控制區：語系切換 + 展台切換 */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex gap-2">
        <button 
          onClick={toggleLocale} 
          className="px-2 md:px-3 py-1.5 md:py-2 rounded-md font-mono font-bold text-xs md:text-sm bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors shadow-lg"
        >
          {locale === 'zh' ? '中 / EN' : 'EN / 中'}
        </button>
        <button 
          onClick={() => setActiveBooth('one')} 
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md font-bold transition-colors cursor-pointer text-xs md:text-base ${
            activeBooth === 'one' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {locale === 'zh' ? '展台 1' : 'Booth 1'}
        </button>
        <button 
          onClick={() => setActiveBooth('two')} 
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md font-bold transition-colors cursor-pointer text-xs md:text-base ${
            activeBooth === 'two' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {locale === 'zh' ? '展台 2' : 'Booth 2'}
        </button>
      </div>

      {/* 🌟 底部科學館說明展牌 (加入收折邏輯與滾動條) */}
      <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-1/2 md:-translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl md:w-11/12 md:max-w-3xl z-10 pointer-events-auto shadow-2xl transition-all duration-300">
        
        {/* 標題與收合按鈕列 */}
        <div 
          className="flex justify-between items-center p-3 md:p-5 cursor-pointer select-none"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <h2 className="text-sm md:text-xl font-bold flex items-center gap-2">
            {activeBooth === 'one' ? (
              <>
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs tracking-wider border border-blue-500/30">
                  {locale === 'zh' ? '展台 1' : 'Booth 1'}
                </span>
                {locale === 'zh' ? '疊加與坍縮' : 'Superposition & Collapse'}
              </>
            ) : (
              <>
                <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded text-xs tracking-wider border border-cyan-500/30">
                  {locale === 'zh' ? '展台 2' : 'Booth 2'}
                </span>
                {locale === 'zh' ? '波動干涉與機率搬運' : 'Wave Interference'}
              </>
            )}
          </h2>
          <button className="text-xs text-sky-400 font-bold px-2 py-1 rounded bg-sky-900/30 hover:bg-sky-900/50 transition-colors whitespace-nowrap ml-2">
            {isCollapsed ? (locale === 'zh' ? '展開說明 ▲' : 'Expand ▲') : (locale === 'zh' ? '收起 ▼' : 'Collapse ▼')}
          </button>
        </div>

        {/* 內容區塊：收合時隱藏，限制最大高度以防擋住 3D */}
        {!isCollapsed && (
          <div className="px-3 md:px-5 pb-4 md:pb-5 space-y-4 text-gray-300 leading-relaxed text-xs md:text-base border-t border-white/10 pt-3 md:pt-4 max-h-[35vh] md:max-h-none overflow-y-auto">
            {activeBooth === 'one' ? (
              locale === 'zh' ? (
                <p>撥動分光桿，相當於對球施加了一次 <strong>Hadamard 門</strong>——它從「確定在左邊」變成「同時在左邊和右邊」。<br/><br/>當球處於<strong>疊加態</strong>時，它不是「轉太快看不清」，而是拍照前<strong>根本沒有決定</strong>在哪邊，拍照的動作迫使它選邊站；但如果球本來就在某一邊 (純左或右態)，那它的位置本就是確定的。</p>
              ) : (
                <p>Pulling the beam-splitter lever applies a <strong>Hadamard gate</strong>—the ball evolves from 'definitely left' into 'both left and right simultaneously'.<br/><br/>When the ball is in a <strong>superposition</strong>, it isn't 'spinning too fast to see'—it genuinely hasn't decided its position before the shutter clicks, and the measurement forces it to choose. However, if the ball is already in a basis state, its position is already determined.</p>
              )
            ) : (
              locale === 'zh' ? (
                <p>量子演化遵循能量守恆，相消干涉<strong>不會讓總能量消失</strong>，而是將機率「搬運」到另一路徑！<br/><br/>依序執行：① 撥動分光使粒子走兩條路 → ② 旋轉舵盤翻轉相位 (π) → ③ 匯流對撞。<br/>若<strong>同相</strong>，Path B 相消蒸發，機率全數匯聚至 Path A；若<strong>反相</strong>，Path A 相消蒸發，機率全數搬運至 Path B！</p>
              ) : (
                <p>Quantum evolution preserves total probability. Destructive interference does not annihilate energy; it redistributes amplitude!<br/><br/>Sequence: ① Split paths → ② Flip phase (π) → ③ Recombine.<br/><strong>In-phase:</strong> Path B destructively cancels to zero while Path A amplifies to 1.0.<br/><strong>Anti-phase:</strong> Path A destructively cancels to zero while amplitude is completely transferred into Path B!</p>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
