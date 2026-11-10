// src/components/PhaseDial.tsx
import { useState, useEffect } from 'react';
import { useSpring, a } from '@react-spring/three';
import { Html } from '@react-three/drei';

interface PhaseDialProps {
  phase: number; // 弧度 [0, 2π)
  onRotatePhase: () => void;
  disabled: boolean;
  isStandby: boolean; // 新增：是否處於未分光的待機狀態
}

export const PhaseDial = ({ phase, onRotatePhase, disabled, isStandby }: PhaseDialProps) => {
  // 1. 安全處理指標游標，避免卸載或禁用時殘留 pointer
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    document.body.style.cursor = hovered && !disabled ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, disabled]);

  const isOppositePhase = Math.abs(phase - Math.PI) < 0.2;

  // 2. 修正：命名與實際旋轉軸 (Y 軸) 保持一致。
  // 待機時鎖定在 0，運作時才依據相位翻轉。
  const { rotationY } = useSpring({
    rotationY: isStandby || !isOppositePhase ? 0 : -Math.PI,
    config: { mass: 1, tension: 220, friction: 20 },
  });

  // 3. 相位色彩隱喻：待機冷灰，0 為深天藍 (#38bdf8)，π 為洋紅/品紅 (#ec4899)
  const dialColor = isStandby ? '#64748b' : isOppositePhase ? '#ec4899' : '#38bdf8';

  return (
    <group
      position={[0, 0, 1.8]}
      onClick={disabled ? undefined : onRotatePhase}
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
        {/* 指針樞軸 */}
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* 指針箭頭主體 */}
        <mesh position={[0, 0, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.12, 0.4, 16]} />
          <meshStandardMaterial 
            color={dialColor} 
            emissive={dialColor} 
            emissiveIntensity={isStandby ? 0 : 0.8} // 待機時熄滅發光
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
