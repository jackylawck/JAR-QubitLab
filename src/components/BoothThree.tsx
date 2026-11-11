// src/components/BoothThree.tsx
import { Suspense } from 'react';
import { Text, RoundedBox } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { useTensorStore } from '../store/tensorStore';
import { FONT_MATH_PATH } from '../constants';

const POSITIONS: [number, number, number][] = [
  [-2, 0,  1.5], // |00⟩
  [-2, 0, -1.5], // |01⟩
  [ 2, 0,  1.5], // |10⟩
  [ 2, 0, -1.5], // |11⟩
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const BoothThree = ({ pureVisual = false }: { pureVisual?: boolean }) => {
  const amplitudes = useTensorStore((s) => s.amplitudes);
  const isEntangled = useTensorStore((s) => s.isEntangled);
  
  // 壓制 ESLint 規則，Sprint 4 再重構為 <Pillar> 組件
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const springs = POSITIONS.map((_, i) =>
    useSpring({
      scaleY: Math.max(amplitudes[i].modulus, 0.01),
      config: { mass: 1, tension: 200, friction: 22 },
    })
  );

  return (
    <group position={[0, -1, 0]}>
      {/* 🌟 修正 1：底座永遠顯示，確立 3D 空間基準 */}
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

      {POSITIONS.map((pos, i) => (
        <group key={i} position={[pos[0], 0, pos[2]]}>
          {/* 機率能量柱 */}
          <a.mesh position-y={springs[i].scaleY.to((s: number) => (s * 3) / 2)} scale-y={springs[i].scaleY}>
            <cylinderGeometry args={[0.5, 0.5, 3, 32]} />
            {/* 🌟 修正 2：棄用高耗能的 transmission，改回發光標準材質，維持 FPS 穩定 */}
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

          {/* 🌟 修正 1：狀態標籤永遠顯示，提供物理語義 */}
          <group position={[0, 0.1, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh>
              <planeGeometry args={[1.5, 0.6]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.6} />
            </mesh>
            <Suspense fallback={null}>
              <Text position={[0, 0, 0.01]} fontSize={0.3} color="#ffffff" font={FONT_MATH_PATH}>
                {amplitudes[i].label}
              </Text>
            </Suspense>
          </group>
        </group>
      ))}
    </group>
  );
};
