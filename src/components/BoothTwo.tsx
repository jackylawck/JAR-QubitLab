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

  const amplitudes = useQuantumStore((s) => s.amplitudes);
  const isSplit = useQuantumStore((s) => s.isSplit);
  const phaseAngle = useQuantumStore((s) => s.phaseAngle);
  const splitBoothTwo = useQuantumStore((s) => s.splitBoothTwo);
  const setPhaseAngle = useQuantumStore((s) => s.setPhaseAngle);
  const collideBoothTwo = useQuantumStore((s) => s.collideBoothTwo);

  const [isBusy, setIsBusy] = useState(false);
  
  const [burstConfig, setBurstConfig] = useState<{
    type: 'evaporate' | 'merge';
    position: [number, number, number];
  } | null>(null);

  const timerRef = useRef<number | null>(null);
  const lockReleaseRef = useRef<(() => void) | null>(null);
  const burstReleaseRef = useRef<(() => void) | null>(null);

  const probA = (amplitudes[0]?.modulus ?? 0) ** 2;
  const probB = (amplitudes[2]?.modulus ?? 0) ** 2;

  const prevIsSplit = useRef(isSplit);
  
  const phaseAngleRef = useRef(phaseAngle);
  useEffect(() => {
    phaseAngleRef.current = phaseAngle;
  }, [phaseAngle]);
  
  // ⚠️ 注意：此 useEffect 依賴上方 phaseAngleRef 的 useEffect 先執行！
  // 若調換兩者順序，在 isSplit 與 phaseAngle 同幀變動的極端場景下，此處會讀到舊的 phaseAngleRef.current。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (prevIsSplit.current && !isSplit) {
      const pA = Math.cos(phaseAngleRef.current / 2) ** 2;
      const pB = Math.sin(phaseAngleRef.current / 2) ** 2;
      const diff = Math.abs(pA - pB);

      if (diff > 0.15) {
        const evaporateLeft = pA < pB;
        burstReleaseRef.current?.();
        burstReleaseRef.current = acquireAnimationLock();
        sound.playEvaporate();
        setBurstConfig({
          type: 'evaporate',
          position: evaporateLeft ? [-2, 0.8, 0] : [2, 0.8, 0],
        });
      }
    }
    prevIsSplit.current = isSplit;
  }, [isSplit]); 

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      lockReleaseRef.current?.();
      burstReleaseRef.current?.();
    };
  }, []);

  const triggerAnimation = (duration: number) => {
    lockReleaseRef.current?.();
    if (timerRef.current !== null) clearTimeout(timerRef.current);

    const release = acquireAnimationLock();
    lockReleaseRef.current = release;
    setIsBusy(true);

    timerRef.current = window.setTimeout(() => {
      setIsBusy(false);
      release();
      lockReleaseRef.current = null;
      timerRef.current = null;
    }, duration);
  };

  // 🌟 透明度修正：恢復乘數 0.9 的光霧感，避免 0.5 概率時 0.8 帶來的生硬實心感
  const { h0, h1, opacity0, opacity1 } = useSpring({
    h0: probA * 2.5,
    h1: probB * 2.5,
    opacity0: probA > 0.05 ? (probA > 0.9 ? 1.0 : probA * 0.9) : 0.05,
    opacity1: probB > 0.05 ? (probB > 0.9 ? 1.0 : probB * 0.9) : 0.05,
    config: { mass: 1, tension: 200, friction: 22 },
  });

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
        {/* 🌟 補上 scale-y={h0} 真正實作柱狀圖動態高度 */}
        <a.mesh scale-y={h0} position-y={h0.to((h) => h / 2)}>
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
        {/* 🌟 補上 scale-y={h1} 真正實作柱狀圖動態高度 */}
        <a.mesh scale-y={h1} position-y={h1.to((h) => h / 2)}>
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
