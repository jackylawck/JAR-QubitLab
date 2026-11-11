// src/App.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { BoothOne } from './components/BoothOne';
import { BoothTwo } from './components/BoothTwo';
import { QuantumField } from './components/QuantumField';
import { LanguageToggle } from './components/LanguageToggle';
import { ConsoleBoothOne } from './components/console/ConsoleBoothOne';
import { ConsoleBoothTwo } from './components/console/ConsoleBoothTwo';
import { useAnimationLock } from './hooks/useAnimationLock';
import { useLocaleStore } from './store/localeStore';
import { sound } from './audio/soundEngine';

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
  const [isExplaining, setIsExplaining] = useState(false);
  const { locale } = useLocaleStore();

  useEffect(() => {
    const unlockAudio = () => {
      sound.unlock();
      window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    return () => window.removeEventListener('pointerdown', unlockAudio);
  }, []);

  return (
    <div className="w-full h-[100dvh] bg-gray-950 text-gray-100 flex flex-col overflow-hidden select-none touch-none">
      
      {/* 🌟 區域一：上半部 3D 微觀量子觀測室 */}
      <div className="relative w-full flex-1 min-h-0 bg-[#030712]">
        
        {/* 頂部標題與語系切換 */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2.5 sm:px-6 pointer-events-none">
          <div className="pointer-events-auto">
            <h1 className="text-sm sm:text-lg font-black tracking-tight text-white drop-shadow">
              J.A.R. QubitLab <span className="text-sky-400 font-light">|</span> <span className="text-xs sm:text-sm font-medium text-slate-300">{locale === 'zh' ? '量子觀測室' : 'Chamber'}</span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
            <LanguageToggle />
            <button 
              onClick={() => setActiveBooth('one')} 
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all shadow-md active:scale-95 ${
                activeBooth === 'one' ? 'bg-blue-600 text-white ring-1 ring-blue-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {locale === 'zh' ? '展台 1' : 'Booth 1'}
            </button>
            <button 
              onClick={() => setActiveBooth('two')} 
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all shadow-md active:scale-95 ${
                activeBooth === 'two' ? 'bg-cyan-600 text-white ring-1 ring-cyan-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {locale === 'zh' ? '展台 2' : 'Booth 2'}
            </button>
          </div>
        </header>

        {/* 3D 畫布：無任何操作按鈕阻擋，360 度隨意旋轉 */}
        <Canvas 
          camera={{ position: [0, 4.5, 9.5], fov: 46 }}
          dpr={[1, 2]}
          frameloop={isAnimating ? 'always' : 'demand'}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <color attach="background" args={['#030712']} />
          <QuantumField count={450} />
          
          <ambientLight intensity={0.85} />
          <directionalLight position={[5, 10, 5]} intensity={1.3} />
          <pointLight position={[-5, 5, -5]} intensity={0.5} />

          <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 5} 
            maxPolarAngle={Math.PI / 2.05} 
            minDistance={4} 
            maxDistance={12} 
            target={[0, 0.4, 0]}
          />

          <Suspense fallback={<BoothFallback />}>
            {/* 🌟 啟用 pureVisual 模式，隱藏 3D 內的拉桿與按鈕 */}
            {activeBooth === 'one' ? <BoothOne pureVisual /> : <BoothTwo pureVisual />}
          </Suspense>
        </Canvas>

        {/* 觀測室底部引導提示 */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none text-[10px] text-slate-500 tracking-wider bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
          {locale === 'zh' ? '⟲ 拖曳星空旋轉視角 ⟳' : '⟲ Drag to orbit view ⟳'}
        </div>
      </div>

      {/* 🌟 區域二：下半部 實體控制台 (固定高度) */}
      <footer className="w-full bg-slate-900/95 border-t border-slate-800/80 p-3 sm:p-4 z-20 backdrop-blur-md flex flex-col justify-between shrink-0 h-[240px] sm:h-[260px] pb-safe">
        {activeBooth === 'one' ? (
          <ConsoleBoothOne isExplaining={isExplaining} setIsExplaining={setIsExplaining} />
        ) : (
          <ConsoleBoothTwo isExplaining={isExplaining} setIsExplaining={setIsExplaining} />
        )}
      </footer>

    </div>
  );
}
