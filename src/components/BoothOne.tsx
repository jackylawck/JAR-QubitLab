// src/components/BoothOne.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { useState, useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useQuantumStore } from '../store/quantumStore';
import { useLocaleStore } from '../store/localeStore';
import { sound } from '../audio/soundEngine';
import { acquireAnimationLock } from '../hooks/useAnimationLock';

const useCursor = () => {
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);
  return {
    onPointerOver: () => setHovered(true),
    onPointerOut: () => setHovered(false),
  };
};

interface QubitCloudProps {
  position: [number, number, number];
  modulus: number;
  baseColor: string;
  label: string;
  isCollapsing: boolean;
}

const QubitCloud = ({ position, modulus, baseColor, label, isCollapsing }: QubitCloudProps) => {
  const isWinner = modulus > 0.9;
  
  let targetScale = 0.01;
  let targetOpacity = 0;

  if (isCollapsing) {
    if (isWinner) {
      targetScale = 1.8;
      targetOpacity = 1.0;
    } else {
      targetScale = 0.01;
      targetOpacity = 0;
    }
  } else {
    if (modulus > 0.95) {
      targetScale = modulus * 1.5;
      targetOpacity = 1.0;
    } else if (modulus > 0.1) {
      targetScale = modulus * 1.5;
      targetOpacity = modulus * 0.9;
    } else {
      targetScale = 0.01;
      targetOpacity = 0;
    }
  }

  const { scale, opacity } = useSpring({
    scale: targetScale,
    opacity: targetOpacity,
    config: { mass: 1, tension: isCollapsing ? 300 : 170, friction: isCollapsing ? 15 : 26 },
  });

  return (
    // 🌟 關鍵修復：外層 group 不帶 scale，座標固定在 [x, y, z]
    <group position={position}>
      {/* 縮放動畫只作用於 3D 網格本體 */}
      <a.mesh scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <a.meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={0.6}
          transparent
          opacity={opacity}
          roughness={0.4}
          metalness={0.1}
        />
      </a.mesh>
      
      {/* 🌟 Html 獨立於 scale 之外，永遠穩固錨定在基底正下方 -1.8，不受機率縮放影響 */}
      <Html position={[0, -1.8, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="text-xs md:text-sm font-bold font-mono text-white whitespace-nowrap bg-black/60 px-2.5 py-1 rounded-md border border-white/20 shadow-lg backdrop-blur-sm">
          {label}
        </div>
      </Html>
    </group>
  );
};

export interface BoothOneProps {
  pureVisual?: boolean;
}

export const BoothOne = ({ pureVisual = false }: BoothOneProps) => {
  const t = useLocaleStore((state) => state.t);
  
  const amplitudes = useQuantumStore((s) => s.amplitudes);
  const applyGate = useQuantumStore((s) => s.applyGate);
  const collapse = useQuantumStore((s) => s.collapse);

  const [isCollapsing, setIsCollapsing] = useState(false);
  
  const collapseTimerRef = useRef<number | null>(null);
  const actionTimerRef = useRef<number | null>(null);
  const lockReleaseRef = useRef<(() => void) | null>(null);

  const leverCursor = useCursor();
  const shutterCursor = useCursor();

  const p0 = (amplitudes[0]?.modulus ?? 0) ** 2 + (amplitudes[1]?.modulus ?? 0) ** 2;
  const p1 = (amplitudes[2]?.modulus ?? 0) ** 2 + (amplitudes[3]?.modulus ?? 0) ** 2;
  const leftModulus = Math.sqrt(p0);
  const rightModulus = Math.sqrt(p1);

  const prevProb = useRef({ p0, p1 });

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current !== null) clearTimeout(collapseTimerRef.current);
      if (actionTimerRef.current !== null) clearTimeout(actionTimerRef.current);
      lockReleaseRef.current?.();
    };
  }, []);

  useEffect(() => {
    const wasMixed = prevProb.current.p0 > 0.1 && prevProb.current.p1 > 0.1;
    const isPure = p0 > 0.9 || p1 > 0.9;

    if (wasMixed && isPure) {
      setIsCollapsing(true);
      if (collapseTimerRef.current !== null) clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = window.setTimeout(() => {
        setIsCollapsing(false);
        collapseTimerRef.current = null;
      }, 300);
    }
    prevProb.current = { p0, p1 };
  }, [p0, p1]);

  const handleLeverClick = () => {
    if (isCollapsing) return;
    sound.playLever();
    applyGate('H', [0]);

    lockReleaseRef.current?.();
    if (actionTimerRef.current !== null) clearTimeout(actionTimerRef.current);

    lockReleaseRef.current = acquireAnimationLock();
    actionTimerRef.current = window.setTimeout(() => {
      lockReleaseRef.current?.();
      lockReleaseRef.current = null;
      actionTimerRef.current = null;
    }, 400);
  };

  const handleShutterClick = () => {
    if (isCollapsing) return;
    sound.playShutter();
    collapse();

    lockReleaseRef.current?.();
    if (actionTimerRef.current !== null) clearTimeout(actionTimerRef.current);

    lockReleaseRef.current = acquireAnimationLock();
    actionTimerRef.current = window.setTimeout(() => {
      lockReleaseRef.current?.();
      lockReleaseRef.current = null;
      actionTimerRef.current = null;
    }, 350);
  };

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />

      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[8, 1, 4]} />
        <meshStandardMaterial color="#1a1a24" roughness={0.7} />
      </mesh>

      <QubitCloud
        position={[-2, 1.5, 0]}
        modulus={leftModulus}
        baseColor="#3b82f6" 
        label={t.common.pathA}
        isCollapsing={isCollapsing}
      />
      <QubitCloud
        position={[2, 1.5, 0]}
        modulus={rightModulus}
        baseColor="#ef4444" 
        label={t.common.pathB}
        isCollapsing={isCollapsing}
      />

      {!pureVisual && (
        <>
          <group position={[0, 0, 1.5]} onClick={handleLeverClick} {...leverCursor}>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 1]} />
              <meshStandardMaterial color="#8892b0" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 1.1, 0]}>
              <sphereGeometry args={[0.4]} />
              <meshStandardMaterial color="#ff4757" metalness={0.3} roughness={0.4} />
            </mesh>
            <Html position={[0, -0.5, 0]} center style={{ pointerEvents: 'none' }}>
              <div className="bg-black/80 text-white px-3 py-1 rounded border border-white/20 select-none whitespace-nowrap text-xs md:text-sm shadow-md">
                🕹️ {t.common.splitBeam}
              </div>
            </Html>
          </group>

          <group position={[3.5, 0.2, 1.5]} onClick={handleShutterClick} {...shutterCursor}>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.5, 0.6, 0.4]} />
              <meshStandardMaterial color="#2f3542" />
            </mesh>
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.1]} />
              <meshStandardMaterial color="#eccc68" metalness={0.6} roughness={0.2} />
            </mesh>
            <Html position={[0, 1, 0]} center style={{ pointerEvents: 'none' }}>
              <div className="bg-black/80 text-white px-3 py-1 rounded border border-white/20 select-none whitespace-nowrap text-xs md:text-sm shadow-md">
                📸 {t.common.measure}
              </div>
            </Html>
          </group>
        </>
      )}
    </group>
  );
};
