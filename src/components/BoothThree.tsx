// src/components/BoothThree.tsx
import { Suspense } from 'react';
import { Text, RoundedBox } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { useTensorStore } from '../store/tensorStore';
import { FONT_MATH_PATH } from '../constants';
import { TensorAmplitude } from '../quantum/tensorEngine';

const POSITIONS: [number, number, number][] = [
  [-2, 0,  1.5], // |00⟩
  [-2, 0, -1.5], // |01⟩
  [ 2, 0,  1.5], // |10⟩
  [ 2, 0, -1.5], // |11⟩
];

interface PillarProps {
  position: [number, number, number];
  amplitude: TensorAmplitude;
  isEntangled: boolean;
}

const Pillar = ({ position, amplitude, isEntangled }: PillarProps) => {
  const { scaleY } = useSpring({
    scaleY: Math.max(amplitude.modulus, 0.01),
    config: { mass: 1, tension: 200, friction: 22 },
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* 機率能量柱 */}
      <a.mesh position-y={scaleY.to((s: number) => (s * 3) / 2)} scale-y={scaleY}>
        <cylinderGeometry args={[0.5, 0.5, 3, 32]} />
        <meshStandardMaterial 
          color={isEntangled ? "#a855f7" : "#38bdf8"} 
          emissive={isEntangled ? "#a855f7" : "#38bdf8"}
          emissiveIntensity={0.6}
          transparent 
          opacity={0.85} 
          roughness={0.3} 
          metalness={0.1} 
        />
      </a.mesh>

      {/* 標籤移至柱頂 y=3.5，取消旋轉使其直視相機 */}
      <group position={[0, 3.5, 0]}>
        <Suspense fallback={null}>
          <Text 
            fontSize={0.4} 
            color="#ffffff" 
            font={FONT_MATH_PATH}
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {amplitude.label}
          </Text>
        </Suspense>
      </group>
    </group>
  );
};

export const BoothThree = () => {
  const amplitudes = useTensorStore((s) => s.amplitudes);
  const isEntangled = useTensorStore((s) => s.isEntangled);
  
  return (
    <group position={[0, -1, 0]}>
      {/* 展台底座永遠顯示 */}
      <RoundedBox args={[8, 0.8, 6]} radius={0.1} smoothness={4} position={[0, -0.4, 0]}>
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.3} />
      </RoundedBox>

      {/* 貝爾態對角線發光軌道 */}
      {isEntangled && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0.6435]}>
          <planeGeometry args={[6.5, 0.2]} />
          <meshBasicMaterial 
            color="#a855f7" 
            transparent 
            opacity={0.3} 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 🌟 核心修復：防禦性渲染 (Defensive Rendering) */}
      {POSITIONS.map((pos, i) => {
        // 從 amplitudes 陣列安全取值
        const amp = amplitudes[i];
        
        // 若因為任何原因 (如 Store 初始化過慢) 導致該索引不存在，則安全跳過，避免破壞整個 React 渲染樹
        if (!amp) return null;

        return (
          <Pillar 
            key={i} 
            position={pos} 
            amplitude={amp} 
            isEntangled={isEntangled}
          />
        );
      })}
    </group>
  );
};
