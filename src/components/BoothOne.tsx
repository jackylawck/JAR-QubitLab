// src/components/BoothOne.tsx
import { useState, useEffect, useRef } from 'react';
import { Text, Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useQuantumStore } from '../store/quantumStore';
import { useLocaleStore } from '../store/localeStore';
import { sound } from '../audio/soundEngine';
import { FONT_MATH_PATH } from '../constants';
import { acquireAnimationLock } from '../hooks/useAnimationLock';

// 🌟 優化 1：改良 useCursor，確保組件卸載時絕對重置游標
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

// 🌟 優化 2：針對 QubitCloud 的 Props 加入嚴格型別
interface QubitCloudProps {
  position: [number, number, number];
  modulus: number;
  baseColor: string;
  label: string;
  isCollapsing: boolean;
}

const QubitCloud = ({ position, modulus, baseColor, label, isCollapsing }: QubitCloudProps) => {
  const isWinner = modulus > 0.9;
  const targetScale = isCollapsing && isWinner ? 1.8 : modulus > 0.1 ? modulus * 1.5 : 0.01;
  
  // 基態 = 實心 (1.0)，疊加態 = 半透明光霧 (~0.64)
  const targetOpacity = isCollapsing && !isWinner 
    ? 0 
    : modulus > 0.95 
      ? 1.0 
      : modulus > 0.1 
        ? modulus * 0.9 
        : 0;

  const { scale, opacity } = useSpring({
    scale: targetScale,
    opacity: targetOpacity,
    config: { mass: 1, tension: isCollapsing ? 300 : 170, friction: isCollapsing ? 15 : 26 },
  });

  return (
    <a.group position={position} scale={scale}>
      <a.mesh>
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
      <Text
        position={[0, -2.2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        font={FONT_MATH_PATH}
      >
        {label}
      </Text>
    </a.group>
  );
};

export const BoothOne = () => {
  const t = useLocaleStore((state) => state.t); // 🌟 接入 i18n
  const { amplitudes, applyGate, collapse, resetBoothOne } = useQuantumStore();

  const [isCollapsing, setIsCollapsing] = useState(false);
  const collapseTimerRef = useRef<number | null>(null);
  const leverTimerRef = useRef<number | null>(null);
  const leverCursor = useCursor();
  const shutterCursor = useCursor();

  // 🌟 初始化展台 1 狀態，並確保清理定時器
  useEffect(() => {
    resetBoothOne();
    return () => {
      if (collapseTimerRef.current !== null) clearTimeout(collapseTimerRef.current);
      if (leverTimerRef.current !== null) clearTimeout(leverTimerRef.current);
    };
  }, [resetBoothOne]);

  // NaN 防禦
  const p0 = (amplitudes[0]?.modulus ?? 0) ** 2 + (amplitudes[1]?.modulus ?? 0) ** 2;
  const p1 = (amplitudes[2]?.modulus ?? 0) ** 2 + (amplitudes[3]?.modulus ?? 0) ** 2;
  const leftModulus = Math.sqrt(p0);
  const rightModulus = Math.sqrt(p1);

  const handleLeverClick = () => {
    if (isCollapsing) return;
    sound.playLever();
    applyGate('H', [0]);

    const release = acquireAnimationLock();
    if (leverTimerRef.current !== null) clearTimeout(leverTimerRef.current);
    leverTimerRef.current = window.setTimeout(() => {
      release();
      leverTimerRef.current = null;
    }, 400);
  };

  const handleShutterClick = () => {
    if (isCollapsing) return;
    sound.playShutter();
    collapse();

    const release = acquireAnimationLock();
    setIsCollapsing(true);

    if (collapseTimerRef.current !== null) clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = window.setTimeout(() => {
      setIsCollapsing(false);
      release();
      collapseTimerRef.current = null;
    }, 300);
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
        label={t.common.pathA} // 🌟 i18n
        isCollapsing={isCollapsing}
      />
      <QubitCloud
        position={[2, 1.5, 0]}
        modulus={rightModulus}
        baseColor="#ef4444" 
        label={t.common.pathB} // 🌟 i18n
        isCollapsing={isCollapsing}
      />

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
          <div className="bg-black/80 text-white px-3 py-1 rounded border border-white/20 select-none whitespace-nowrap text-sm">
            🕹️ {t.common.splitBeam} {/* 🌟 i18n */}
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
          <div className="bg-black/80 text-white px-3 py-1 rounded border border-white/20 select-none whitespace-nowrap text-sm">
            📸 {t.boothThree.measure} {/* 🌟 借用預先定義好的 i18n 詞條 */}
          </div>
        </Html>
      </group>
    </group>
  );
};
