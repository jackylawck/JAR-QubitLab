// src/components/BoothOne.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Theme: EVA-01 (Purple #a855f7 & Neon Emerald-Cyan #10b981)
 */
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useQuantumStore } from '../store/quantumStore';
import { useLocaleStore } from '../store/localeStore';
import { sound } from '../audio/soundEngine';
import { acquireAnimationLock } from '../hooks/useAnimationLock';

const SHARED_GEOMETRY = {
  cloud: new THREE.SphereGeometry(1, 32, 32),
  base: new THREE.BoxGeometry(8, 1, 4),
  leverStick: new THREE.CylinderGeometry(0.2, 0.2, 1),
  leverKnob: new THREE.SphereGeometry(0.4),
  shutterBase: new THREE.CylinderGeometry(0.5, 0.6, 0.4),
  shutterButton: new THREE.CylinderGeometry(0.3, 0.3, 0.1),
};

const SHARED_MATERIALS = {
  base: new THREE.MeshStandardMaterial({ color: '#1a1a24', roughness: 0.7 }),
  leverStick: new THREE.MeshStandardMaterial({ color: '#8892b0', metalness: 0.8, roughness: 0.2 }),
  leverKnob: new THREE.MeshStandardMaterial({ color: '#a855f7', emissive: '#a855f7', emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.4 }),
  shutterBase: new THREE.MeshStandardMaterial({ color: '#2f3542' }),
  shutterButton: new THREE.MeshStandardMaterial({ color: '#10b981', emissive: '#10b981', emissiveIntensity: 0.7, metalness: 0.5, roughness: 0.2 }),
};

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
      targetScale = 1.75;
      targetOpacity = 1.0;
    } else {
      targetScale = 0.01;
      targetOpacity = 0;
    }
  } else {
    if (modulus > 0.95) {
      targetScale = modulus * 1.45;
      targetOpacity = 1.0;
    } else if (modulus > 0.1) {
      // 疊加態 (modulus ≈ 0.707) 時維持高不透明度 0.88，避免背後黑底把紫光與青綠光吃暗
      targetScale = modulus * 1.45;
      targetOpacity = 0.88;
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
    <group position={position}>
      <a.mesh scale={scale} geometry={SHARED_GEOMETRY.cloud} dispose={null}>
        <a.meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={1.15}
          toneMapped={false}
          transparent
          opacity={opacity}
          roughness={0.25}
          metalness={0.05}
        />
      </a.mesh>

      <Html position={[0, -1.8, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div className="text-xs md:text-sm font-bold font-mono text-white whitespace-nowrap bg-black/70 px-2.5 py-1 rounded-md border border-white/25 shadow-lg backdrop-blur-sm">
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
    let isMounted = true;

    const wasMixed = prevProb.current.p0 > 0.1 && prevProb.current.p1 > 0.1;
    const isPure = p0 > 0.9 || p1 > 0.9;

    if (wasMixed && isPure) {
      setIsCollapsing(true);
      if (collapseTimerRef.current !== null) clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = window.setTimeout(() => {
        if (isMounted) {
          setIsCollapsing(false);
          collapseTimerRef.current = null;
        }
      }, 300);
    }
    prevProb.current = { p0, p1 };

    return () => {
      isMounted = false;
      if (collapseTimerRef.current !== null) clearTimeout(collapseTimerRef.current);
      if (actionTimerRef.current !== null) clearTimeout(actionTimerRef.current);
      lockReleaseRef.current?.();
    };
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
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 10, 5]} intensity={1.6} />

      <mesh
        position={[0, -0.5, 0]}
        geometry={SHARED_GEOMETRY.base}
        material={SHARED_MATERIALS.base}
        dispose={null}
      />

      {/* 路徑 A：初號機裝甲紫 (#a855f7) */}
      <QubitCloud
        position={[-2, 1.5, 0]}
        modulus={leftModulus}
        baseColor="#a855f7"
        label={t.common.pathA}
        isCollapsing={isCollapsing}
      />

      {/* 路徑 B：初號機螢光青綠 (#10b981) */}
      <QubitCloud
        position={[2, 1.5, 0]}
        modulus={rightModulus}
        baseColor="#10b981"
        label={t.common.pathB}
        isCollapsing={isCollapsing}
      />

      {!pureVisual && (
        <>
          <group position={[0, 0, 1.5]} onClick={handleLeverClick} {...leverCursor}>
            <mesh
              position={[0, 0.5, 0]}
              geometry={SHARED_GEOMETRY.leverStick}
              material={SHARED_MATERIALS.leverStick}
              dispose={null}
            />
            <mesh
              position={[0, 1.1, 0]}
              geometry={SHARED_GEOMETRY.leverKnob}
              material={SHARED_MATERIALS.leverKnob}
              dispose={null}
            />
            <Html position={[0, -0.5, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
              <div className="bg-black/80 text-white px-3 py-1 rounded border border-white/20 select-none whitespace-nowrap text-xs md:text-sm shadow-md">
                🕹️ {t.common.splitBeam}
              </div>
            </Html>
          </group>

          <group position={[3.5, 0.2, 1.5]} onClick={handleShutterClick} {...shutterCursor}>
            <mesh
              position={[0, 0.2, 0]}
              geometry={SHARED_GEOMETRY.shutterBase}
              material={SHARED_MATERIALS.shutterBase}
              dispose={null}
            />
            <mesh
              position={[0, 0.45, 0]}
              geometry={SHARED_GEOMETRY.shutterButton}
              material={SHARED_MATERIALS.shutterButton}
              dispose={null}
            />
            <Html position={[0, 1, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
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
