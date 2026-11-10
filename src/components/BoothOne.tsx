// src/components/BoothOne.tsx
import { useState, useEffect, useRef } from 'react';
import { Text, Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useQuantumStore } from '../store/quantumStore';
import { sound } from '../audio/soundEngine';
import { FONT_MATH_PATH } from '../constants'; 

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

const QubitCloud = ({
  position,
  modulus,
  baseColor,
  label,
  isCollapsing,
}: {
  position: [number, number, number];
  modulus: number;
  baseColor: string;
  label: string;
  isCollapsing: boolean;
}) => {
  const isWinner = modulus > 0.9;
  const targetScale = isCollapsing && isWinner ? 1.8 : modulus > 0.1 ? modulus * 1.5 : 0.01;
  
  // 核心視覺隱喻：基態 = 實心 (1.0)，疊加態 = 半透明光霧 (~0.64)
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
        {/* 降低幾何體細分以保證手機效能 */}
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
        position={[0, -2.2, 0]} // 下移至 -2.2 避免 1.8 倍放大時遮擋
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
  const amplitudes = useQuantumStore((state) => state.amplitudes);
  const applyGate = useQuantumStore((state) => state.applyGate);
  const collapse = useQuantumStore((state) => state.collapse);

  const [isCollapsing, setIsCollapsing] = useState(false);
  const collapseTimerRef = useRef<number | null>(null);
  const leverCursor = useCursor();
  const shutterCursor = useCursor();

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current !== null) {
        clearTimeout(collapseTimerRef.current);
      }
    };
  }, []);

  const p0 = (amplitudes[0]?.modulus ** 2 || 0) + (amplitudes[1]?.modulus ** 2 || 0);
  const p1 = (amplitudes[2]?.modulus ** 2 || 0) + (amplitudes[3]?.modulus ** 2 || 0);
  
  const leftModulus = Math.sqrt(p0);
  const rightModulus = Math.sqrt(p1);

  const handleLeverClick = () => {
    if (isCollapsing) return;
    sound.playLever();
    applyGate('H', [0]);
  };

  const handleShutterClick = () => {
    if (isCollapsing) return;
    sound.playShutter();
    collapse();
    
    setIsCollapsing(true);
    collapseTimerRef.current = window.setTimeout(() => {
      setIsCollapsing(false);
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
        label="Left"
        isCollapsing={isCollapsing}
      />
      <QubitCloud
        position={[2, 1.5, 0]}
        modulus={rightModulus}
        baseColor="#ef4444" 
        label="Right" 
        isCollapsing={isCollapsing}
      />

      <group
        position={[0, 0, 1.5]}
        onClick={handleLeverClick}
        {...leverCursor}
      >
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
            🕹️ 撥動分光 (H-Gate)
          </div>
        </Html>
      </group>

      <group
        position={[3.5, 0.2, 1.5]}
        onClick={handleShutterClick}
        {...shutterCursor}
      >
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
            📸 拍下快門 (Measure)
          </div>
        </Html>
      </group>
    </group>
  );
};
