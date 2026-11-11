// src/App.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, PerspectiveCamera } from '@react-three/drei';
import { BoothOne } from './components/BoothOne';
import { BoothTwo } from './components/BoothTwo';
import { BoothThree } from './components/BoothThree';
import { LanguageToggle } from './components/LanguageToggle';
import { GovernanceNotice } from './components/GovernanceNotice';
import { ConsoleBoothOne } from './components/console/ConsoleBoothOne';
import { ConsoleBoothTwo } from './components/console/ConsoleBoothTwo';
import { ConsoleBoothThree } from './components/console/ConsoleBoothThree';
import { useAnimationLock } from './hooks/useAnimationLock';
import { useLocaleStore } from './store/localeStore';
import { useQuantumStore } from './store/quantumStore';
import { useTensorStore } from './store/tensorStore';
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

// 🌟 優化 1：抽離展台切換按鈕組件 (DRY)
// 避免重複的 className 邏輯，讓 Header 更加乾淨易讀
const BoothTab = ({ 
  label, 
  isActive, 
  onClick, 
  colorTheme 
}: { 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
  colorTheme: 'blue' | 'cyan' | 'purple'
}) => {
  const themeClasses = {
    blue: 'bg-blue-600 ring-blue-400',
    cyan: 'bg-cyan-600 ring-cyan-400',
    purple: 'bg-purple-600 ring-purple-400',
  };

  return (
    <button 
      onClick={onClick} 
      className={`px-2.5 py-1 rounded text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
        isActive ? `${themeClasses[colorTheme]} text-white ring-1` : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );
};

export default function App() {
  const { isAnimating } = useAnimationLock();
  const [activeBooth, setActiveBooth] = useState<'one' | 'two' | 'three'>('one');
  const [isExplaining, setIsExplaining] = useState(false);
  
  // 🌟 只需要 t，不需要 locale
  const t = useLocaleStore((s) => s.t);
  const locale = useLocaleStore((s) => s.locale);

  const resetBoothOne = useQuantumStore((s) => s.resetBoothOne);
  const resetBoothTwo = useQuantumStore((s) => s.resetBoothTwo);
  const resetTensor = useTensorStore((s) => s.reset);

  // 🌟 優化 2：修正初始化依賴，避免不必要的重新渲染
  // 只在初次掛載時重置展台一
  useEffect(() => {
    resetBoothOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unlockAudio = () => {
      sound.unlock();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const handleSwitchBooth = (booth: 'one' | 'two' | 'three') => {
    if (booth === activeBooth) return;

    setIsExplaining(false);
    
    // 🌟 優化 3：切換展台時加入音效回饋
    sound.playClick?.() || sound.playLever(); 

    if (booth === 'one') {
      resetBoothOne();
    } else if (booth === 'two') {
      resetBoothTwo();
    } else {
      resetTensor();
    }
    setActiveBooth(booth);
  };

  return (
    <div className="w-full h-[100dvh] bg-gray-950 text-gray-100 flex flex-col overflow-hidden select-none touch-none">
      <div className="relative w-full flex-1 min-h-0 bg-[#030712]">
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2.5 sm:px-6 pointer-events-none">
          <div className="pointer-events-auto">
            <h1 className="text-sm sm:text-lg font-black tracking-tight text-white drop-shadow">
              J.A.R. QubitLab <span className="text-sky-400 font-light">|</span> <span className="text-xs sm:text-sm font-medium text-slate-300">{locale === 'zh' ? '量子觀測室' : 'Chamber'}</span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
            <LanguageToggle />
            {/* 🌟 套用重構後的 BoothTab 組件 */}
            <BoothTab 
              label={locale === 'zh' ? '展台 1' : 'Booth 1'} 
              isActive={activeBooth === 'one'} 
              onClick={() => handleSwitchBooth('one')} 
              colorTheme="blue" 
            />
            <BoothTab 
              label={locale === 'zh' ? '展台 2' : 'Booth 2'} 
              isActive={activeBooth === 'two'} 
              onClick={() => handleSwitchBooth('two')} 
              colorTheme="cyan" 
            />
            <BoothTab 
              label={locale === 'zh' ? '展台 3' : 'Booth 3'} 
              isActive={activeBooth === 'three'} 
              onClick={() => handleSwitchBooth('three')} 
              colorTheme="purple" 
            />
          </div>
        </header>

        <Canvas 
          dpr={[1, 2]}
          frameloop={isAnimating ? 'always' : 'demand'}
          gl={{ antialias: true }} 
        >
          <PerspectiveCamera 
            makeDefault 
            position={activeBooth === 'three' ? [0, 8, 11] : [0, 4.5, 9.5]} 
            fov={activeBooth === 'three' ? 42 : 46} 
          />
          <color attach="background" args={['#030712']} />
          
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
            {activeBooth === 'one' && <BoothOne pureVisual />}
            {activeBooth === 'two' && <BoothTwo pureVisual />}
            {activeBooth === 'three' && <BoothThree />}
          </Suspense>
        </Canvas>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none text-[10px] text-slate-500 tracking-wider bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
          {locale === 'zh' ? '⟲ 拖曳星空旋轉視角 ⟳' : '⟲ Drag to orbit view ⟳'}
        </div>
      </div>

      <footer className="w-full bg-slate-900/95 border-t border-slate-800/80 p-3 sm:p-4 z-20 backdrop-blur-md flex flex-col justify-between shrink-0 h-[240px] sm:h-[260px] pb-safe">
        {activeBooth === 'one' && <ConsoleBoothOne isExplaining={isExplaining} setIsExplaining={setIsExplaining} />}
        {activeBooth === 'two' && <ConsoleBoothTwo isExplaining={isExplaining} setIsExplaining={setIsExplaining} />}
        {activeBooth === 'three' && <ConsoleBoothThree isExplaining={isExplaining} setIsExplaining={setIsExplaining} />}
      </footer>

      <GovernanceNotice />
    </div>
  );
}
