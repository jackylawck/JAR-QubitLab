// src/components/BoothTwo.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { useState, useRef, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useQuantumStore } from '../store/quantumStore';
import { useLocaleStore } from '../store/localeStore';
import { sound } from '../audio/soundEngine';
import { acquireAnimationLock } from '../hooks/useAnimationLock';
import { PhaseDial } from './PhaseDial';
import { InterferenceBurst } from './InterferenceBurst';

export interface BoothTwoProps {
  pureVisual?: boolean;
}

export const BoothTwo = ({ pureVisual = false }: BoothTwoProps) => {
  const t = useLocaleStore((state) => state.t);

  const {
    amplitudes,
    isSplit,
    phaseAngle,
    splitBoothTwo,
    setPhaseAngle,
    collideBoothTwo,
    resetBoothTwo,
  } = useQuantumStore();

  const [isBusy, setIsBusy] = useState(false);

  const [burstConfig, setBurstConfig] = useState<{
    type: 'evaporate' | 'merge';
    position: [number, number, number];
  } | null>(null);

  const timerRef = useRef<number | null>(null);
  const lockReleaseRef = useRef<(() => void) | null>(null);
  const burstReleaseRef = useRef<(() => void) | null>(null);

  // 取得左右路徑機率
  const probA = (amplitudes[0]?.modulus ?? 0) ** 2;
  const probB = (amplitudes[2]?.modulus ?? 0) ** 2;

  // 🌟 狀態響應式動畫 (Reactive Animation)
  // 自動偵測從「分光態」變為「對撞坍縮」的瞬間，並觸發粒子蒸發特效
  const prevIsSplit = useRef(isSplit);
  useEffect(() => {
    // 若原本是分光態 (true)，現在變成匯流對撞態 (false)，代表發生了干涉
    if (prevIsSplit.current && !isSplit) {
      const pA = Math.cos(phaseAngle / 2) ** 2;
      const pB = Math.sin(phaseAngle / 2) ** 2;
      const diff = Math.abs(pA - pB);

      // 只有當出現顯著干涉抵消時才觸發特效
      if (diff > 0.15) {
        const evaporateLeft = pA < pB;
        burstReleaseRef.current?.();
        burstReleaseRef.current = acquireAnimationLock(1500); // 延長動畫鎖，涵蓋蒸發過程
        sound.playEvaporate();
        setBurstConfig({
          type: 'evaporate',
          position: evaporateLeft ? [-2, 0.8, 0] : [2, 0.8, 0],
        });
      }
    }
    prevIsSplit.current = isSplit;
  }, [isSplit, phaseAngle]);

  useEffect(() => {
    resetBoothTwo();
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      lockReleaseRef.current?.();
      burstReleaseRef.current?.();
      document.body.style.cursor = 'auto';
    };
  }, [resetBoothTwo]);

  const triggerAnimation = (duration: number) => {
    lockReleaseRef.current?.();
    if (timerRef.current !== null) clearTimeout(timerRef.current);

    const release = acquireAnimationLock(duration + 100);
    lockReleaseRef.current = release;
    setIsBusy(true);

    timerRef.current = window.setTimeout(() => {
      setIsBusy(false);
      release();
      lockReleaseRef.current = null;
      timerRef.current = null;
    }, duration);
  };

  const { h0, h1, opacity0, opacity1 } = useSpring({
    h0: probA * 2.5,
    h1: probB * 2.5,
    opacity0: probA > 0.05 ? (probA > 0.9 ? 1.0 : 0.8) : 0.05,
    opacity1: probB > 0.05 ? (probB > 0.9 ? 1.0 : 0.8) : 0.05,
    config: { mass: 1, tension: 200, friction: 22 },
  });

  // 保留向下相容的 3D 控制事件
  const handleSplit = () => {
    if (isBusy || isSplit) return;
    sound.playLever();
    splitBoothTwo();
    triggerAnimation(450);
  };

  const handleRotatePhase = (angle: number) => {
    if (!isSplit) return;
    setPhaseAngle(angle);
    if (!isBusy) triggerAnimation(80);
  };

  const handleCollide = () => {
    if (isBusy || !isSplit) return;
    collideBoothTwo();
    triggerAnimation(600);
  };

  const handleBurstComplete = () => {
    setBurstConfig(null);
    burstReleaseRef.current?.();
    burstReleaseRef.current = null;
  };

  // 當相角接近 π (180度) 時，將顏色轉為洋紅，強化相消干涉的視覺暗示
  const isOppositePhase = Math.abs(phaseAngle - Math.PI) < 0.2;

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 8, 4]} intensity={1.2} />

      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[9, 0.8, 5]} />
        <meshStandardMaterial color="#111118" roughness={0.8} />
      </mesh>

      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[5, 0.08, 0.4]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      <a.group position={[-2, 0, 0]}>
        <a.mesh position-y={h0.to((h) => h / 2)}>
          <cylinderGeometry args={[0.45, 0.45, 1, 32]} />
          <a.meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.6}
            transparent
            opacity={opacity0}
            roughness={0.2}
          />
        </a.mesh>
        <Html position={[0, -0.4, 0.6]} center style={{ pointerEvents: 'none' }}>
          <div className="text-xs md:text-sm font-bold font-mono text-white whitespace-nowrap bg-black/60 px-2 py-0.5 rounded border border-white/20 shadow-md">
            {t.common.pathA}
          </div>
        </Html>
      </a.group>

      <a.group position={[2, 0, 0]}>
        <a.mesh position-y={h1.to((h) => h / 2)}>
          <cylinderGeometry args={[0.45, 0.45, 1, 32]} />
          <a.meshStandardMaterial
            color={isSplit && isOppositePhase ? '#ec4899' : '#38bdf8'}
            emissive={isSplit && isOppositePhase ? '#ec4899' : '#38bdf8'}
            emissiveIntensity={0.6}
            transparent
            opacity={opacity1}
            roughness={0.2}
          />
        </a.mesh>
        <Html position={[0, -0.4, 0.6]} center style={{ pointerEvents: 'none' }}>
          <div className="text-xs md:text-sm font-bold font-mono text-white whitespace-nowrap bg-black/60 px-2 py-0.5 rounded border border-white/20 shadow-md">
            {t.common.pathB}
          </div>
        </Html>
      </a.group>

      {burstConfig && (
        <InterferenceBurst
          type={burstConfig.type}
          position={burstConfig.position}
          onComplete={handleBurstComplete}
        />
      )}

      {/* 🌟 根據 pureVisual 隱藏所有 3D 實體按鈕與舵盤 */}
      {!pureVisual && (
        <>
          <group
            position={[-3.2, 0.1, 1.2]}
            onClick={handleSplit}
            onPointerOver={() => {
              if (!isBusy && !isSplit) document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.25, 0.3, 0.3, 16]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0, 0.45, 0]}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial 
                color={!isSplit ? '#38bdf8' : '#64748b'} 
                emissive={!isSplit ? '#38bdf8' : '#000'}
                emissiveIntensity={0.5} 
              />
            </mesh>
            <Html position={[0, -0.4, 0]} center style={{ pointerEvents: 'none' }}>
              <div className={`px-2.5 py-1 rounded text-xs select-none whitespace-nowrap shadow-md border ${
                !isSplit 
                  ? 'bg-blue-950/80 text-blue-200 border-blue-500/40 animate-pulse' 
                  : 'bg-black/50 text-gray-500 border-gray-700/30'
              }`}>
                {t.common.splitBeam}
              </div>
            </Html>
          </group>

          <PhaseDial
            phase={phaseAngle}
            onPhaseChange={handleRotatePhase}
            disabled={isBusy || !isSplit}
            isStandby={!isSplit}
          />

          <group
            position={[3.2, 0.1, 1.2]}
            onClick={handleCollide}
            onPointerOver={() => {
              if (!isBusy && isSplit) document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.35, 0.45, 0.3, 32]} />
              <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.38, 0]}>
              <cylinderGeometry args={[0.28, 0.28, 0.1, 32]} />
              <meshStandardMaterial
                color={isSplit ? '#f59e0b' : '#64748b'}
                metalness={0.5}
                roughness={0.2}
                emissive={isSplit ? '#f59e0b' : '#000'}
                emissiveIntensity={isSplit ? 0.6 : 0}
              />
            </mesh>
            <Html position={[0, -0.4, 0]} center style={{ pointerEvents: 'none' }}>
              <div className={`px-2.5 py-1 rounded text-xs select-none whitespace-nowrap shadow-md border ${
                isSplit 
                  ? 'bg-amber-950/80 text-amber-200 border-amber-500/40 font-bold animate-pulse' 
                  : 'bg-black/50 text-gray-500 border-gray-700/30'
              }`}>
                {t.common.interfere}
              </div>
            </Html>
          </group>
        </>
      )}
    </group>
  );
};
