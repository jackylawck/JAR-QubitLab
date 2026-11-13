// src/components/BoothTwo.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Theme: EVA-02 (Asuka Red & Yellow)
 */
import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useQuantumStore } from '../store/quantumStore';
import { useLocaleStore } from '../store/localeStore';
import { sound } from '../audio/soundEngine';
import { acquireAnimationLock } from '../hooks/useAnimationLock';
import { PhaseDial } from './PhaseDial';
import { InterferenceBurst } from './InterferenceBurst';

// 🌟 Zero-GC：靜態共用幾何體與材質
const SHARED_GEOMETRY = {
  base: new THREE.BoxGeometry(9, 0.8, 5),
  track: new THREE.BoxGeometry(5, 0.08, 0.4),
  cloudCylinder: new THREE.CylinderGeometry(0.45, 0.45, 1, 32),
  splitBase: new THREE.CylinderGeometry(0.25, 0.3, 0.3, 16),
  splitKnob: new THREE.SphereGeometry(0.22, 16, 16),
  collideBase: new THREE.CylinderGeometry(0.35, 0.45, 0.3, 32),
  collideKnob: new THREE.CylinderGeometry(0.28, 0.28, 0.1, 32),
};

const SHARED_MATERIALS = {
  base: new THREE.MeshStandardMaterial({ color: '#111118', roughness: 0.8 }),
  track: new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8, roughness: 0.2 }),
  btnBase: new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.6, roughness: 0.3 }),
};

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

  // 🌟 卸載時安全清理事宜
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
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
      if (isMountedRef.current) setIsBusy(false);
      release();
      lockReleaseRef.current = null;
      timerRef.current = null;
    }, duration);
  };

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
    if (isMountedRef.current) setBurstConfig(null);
    burstReleaseRef.current?.();
    burstReleaseRef.current = null;
  };

  const isOppositePhase = Math.abs(phaseAngle - Math.PI) < 0.2;

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 8, 4]} intensity={1.2} />

      <mesh position={[0, -0.6, 0]} geometry={SHARED_GEOMETRY.base} material={SHARED_MATERIALS.base} dispose={null} />
      <mesh position={[0, -0.15, 0]} geometry={SHARED_GEOMETRY.track} material={SHARED_MATERIALS.track} dispose={null} />

      {/* 路徑 A：二號機裝甲紅 (EVA-02 Red) */}
      <a.group position={[-2, 0, 0]}>
        <a.mesh scale-y={h0} position-y={h0.to((h) => h / 2)} geometry={SHARED_GEOMETRY.cloudCylinder} dispose={null}>
          <a.meshStandardMaterial
            color="#dc2626"
            emissive="#dc2626"
            emissiveIntensity={0.75}
            transparent
            opacity={opacity0}
            roughness={0.2}
          />
        </a.mesh>
        <Html position={[0, -0.4, 0.6]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div className="text-xs md:text-sm font-bold font-mono text-white whitespace-nowrap bg-black/60 px-2 py-0.5 rounded border border-white/20 shadow-md">
            {t.common.pathA}
          </div>
        </Html>
      </a.group>

      {/* 路徑 B：二號機螢光紅，反相干涉時轉為亮黃 (EVA-02 Yellow) */}
      <a.group position={[2, 0, 0]}>
        <a.mesh scale-y={h1} position-y={h1.to((h) => h / 2)} geometry={SHARED_GEOMETRY.cloudCylinder} dispose={null}>
          <a.meshStandardMaterial
            color={isSplit && isOppositePhase ? '#facc15' : '#ef4444'}
            emissive={isSplit && isOppositePhase ? '#eab308' : '#ef4444'}
            emissiveIntensity={0.75}
            transparent
            opacity={opacity1}
            roughness={0.2}
          />
        </a.mesh>
        <Html position={[0, -0.4, 0.6]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
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
          {/* 分光操作桿 (二號機紅) */}
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
            <mesh position={[0, 0.2, 0]} geometry={SHARED_GEOMETRY.splitBase} material={SHARED_MATERIALS.btnBase} dispose={null} />
            <mesh position={[0, 0.45, 0]} geometry={SHARED_GEOMETRY.splitKnob} dispose={null}>
              <meshStandardMaterial 
                color={!isSplit ? '#ef4444' : '#64748b'} 
                emissive={!isSplit ? '#dc2626' : '#000'}
                emissiveIntensity={0.75} 
              />
            </mesh>
            <Html position={[0, -0.4, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
              <div className={`px-2.5 py-1 rounded text-xs select-none whitespace-nowrap shadow-md border ${
                !isSplit 
                  ? 'bg-red-950/80 text-red-200 border-red-500/40 animate-pulse' 
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

          {/* 干涉對撞按鈕 (二號機黃) */}
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
            <mesh position={[0, 0.2, 0]} geometry={SHARED_GEOMETRY.collideBase} material={SHARED_MATERIALS.btnBase} dispose={null} />
            <mesh position={[0, 0.38, 0]} geometry={SHARED_GEOMETRY.collideKnob} dispose={null}>
              <meshStandardMaterial
                color={isSplit ? '#facc15' : '#64748b'}
                metalness={0.5}
                roughness={0.2}
                emissive={isSplit ? '#eab308' : '#000'}
                emissiveIntensity={isSplit ? 0.75 : 0}
              />
            </mesh>
            <Html position={[0, -0.4, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
              <div className={`px-2.5 py-1 rounded text-xs select-none whitespace-nowrap shadow-md border ${
                isSplit 
                  ? 'bg-yellow-950/80 text-yellow-200 border-yellow-500/40 font-bold animate-pulse' 
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
