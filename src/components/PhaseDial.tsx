// src/components/PhaseDial.tsx
import { useRef } from 'react';
import { useSpring, a } from '@react-spring/three';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface PhaseDialProps {
  phase: number; // 弧度 [0, 2π)
  onRotatePhase: () => void;
  disabled: boolean;
}

export const PhaseDial = ({ phase, onRotatePhase, disabled }: PhaseDialProps) => {
  // 舵盤指針旋轉動畫
  const { rotationZ } = useSpring({
    rotationZ: -phase, // 逆時針方向對應複數相位平面
    config: { mass: 1, tension: 220, friction: 20 },
  });

  // 相位色彩隱喻：0 為深天藍 (#38bdf8)，π 為洋紅/品紅 (#ec4899)
  const isOppositePhase = Math.abs(phase - Math.PI) < 0.2;
  const dialColor = isOppositePhase ? '#ec4899' : '#38bdf8';

  return (
    <group
      position={[0, 0, 1.8]}
      onClick={disabled ? undefined : onRotatePhase}
      onPointerOver={() => {
        if (!disabled) document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 舵盤底座基座 */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.9, 1.0, 0.1, 32]} />
        <meshStandardMaterial color="#1e1e2d" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 刻度發光環 */}
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.65, 0.75, 32]} />
        <meshBasicMaterial color={dialColor} toneMapped={false} />
      </mesh>

      {/* 動態旋轉的幾何指針 */}
      <a.group position={[0, 0.15, 0]} rotation-y={rotationZ}>
        {/* 指針樞軸 */}
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* 指針箭頭主體 */}
        <mesh position={[0, 0, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.12, 0.4, 16]} />
          <meshStandardMaterial color={dialColor} emissive={dialColor} emissiveIntensity={0.8} />
        </mesh>
      </a.group>

      <Html position={[0, -0.4, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="bg-black/85 text-white px-3 py-1 rounded border border-white/20 select-none whitespace-nowrap text-xs flex items-center gap-1.5 shadow-lg">
          <span>🧭 旋轉相位 (Z-Gate)</span>
          <span className="font-mono text-cyan-400 font-bold">
            {isOppositePhase ? 'π (反相 180°)' : '0 (同相 0°)'}
          </span>
        </div>
      </Html>
    </group>
  );
};
