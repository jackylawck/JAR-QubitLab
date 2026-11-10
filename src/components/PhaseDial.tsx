// src/components/PhaseDial.tsx
import { useState, useEffect } from 'react';
import { useSpring, a } from '@react-spring/three';
import { Html } from '@react-three/drei';

interface PhaseDialProps {
  phase: number; // 弧度 [0, 2π)
  onRotatePhase: () => void;
  disabled: boolean;
  isStandby: boolean;
}

export const PhaseDial = ({ phase, onRotatePhase, disabled, isStandby }: PhaseDialProps) => {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered && !disabled ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, disabled]);

  const isOppositePhase = Math.abs(phase - Math.PI) < 0.2;

  const { rotationY } = useSpring({
    rotationY: isStandby || !isOppositePhase ? 0 : -Math.PI,
    config: { mass: 1, tension: 220, friction: 20 },
  });

  // J.A.R. 機械卡榫微觸覺回饋 (安全可選鏈呼叫，iOS Safari 自動靜默略過)
  const handleClick = () => {
    if (disabled || isStandby) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([15, 25, 15]); // 雙階梯機械卡榫震動
    }
    onRotatePhase();
  };

  const dialColor = isStandby ? '#64748b' : isOppositePhase ? '#ec4899' : '#38bdf8';

  return (
    <group
      position={[0, 0, 1.8]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
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
      <a.group position={[0, 0.15, 0]} rotation-y={rotationY}>
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.12, 0.4, 16]} />
          <meshStandardMaterial 
            color={dialColor} 
            emissive={dialColor} 
            emissiveIntensity={isStandby ? 0 : 0.8}
          />
        </mesh>
      </a.group>

      <Html position={[0, -0.4, 0]} center style={{ pointerEvents: 'none' }}>
        <div className={`px-3 py-1 rounded border select-none whitespace-nowrap text-xs flex items-center gap-1.5 shadow-lg ${
          isStandby 
            ? 'bg-slate-900/80 text-slate-400 border-slate-700/50' 
            : 'bg-black/85 text-white border-white/20'
        }`}>
          <span>🧭 相位翻轉 (Z-Gate)</span>
          <span className="font-mono font-bold">
            {isStandby ? '待機 (需先分光)' : isOppositePhase ? 'π (反相 180°)' : '0 (同相 0°)'}
          </span>
        </div>
      </Html>
    </group>
  );
};
