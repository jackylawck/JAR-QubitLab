// src/components/BoothThree.tsx
import { Suspense, useMemo, useEffect } from 'react';
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
  geometry: THREE.CylinderGeometry;
  material: THREE.Material;
}

const Pillar = ({ position, amplitude, geometry, material }: PillarProps) => {
  const { scaleY } = useSpring({
    scaleY: Math.max(amplitude.modulus, 0.01),
    config: { mass: 1, tension: 200, friction: 22 },
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* 🌟 優化 1：標明 dispose={null} 防止 R3F 誤判回收共用資源 */}
      <a.mesh geometry={geometry} material={material} scale-y={scaleY} dispose={null} />

      {/* 標籤移至柱頂上方，確保旋轉時不被遮擋 */}
      <group position={[0, 3.6, 0]}>
        <Suspense fallback={null}>
          <Text 
            fontSize={0.45} 
            color="#ffffff" 
            font={FONT_MATH_PATH}
            outlineWidth={0.025}
            outlineColor="#000000"
            anchorX="center"
            anchorY="middle"
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

  // 🌟 Zero-GC 預分配記憶體：所有柱子與軌道共用同一份資源
  const resources = useMemo(() => {
    // 將高為 3 的圓柱體原點下移 1.5（移至底部）
    const cyl = new THREE.CylinderGeometry(0.5, 0.5, 3, 32);
    cyl.translate(0, 1.5, 0);

    return {
      pillarGeo: cyl,
      trackGeo: new THREE.PlaneGeometry(6.5, 0.2),
      
      baseMat: new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.7, metalness: 0.3 }),
      
      normalMat: new THREE.MeshStandardMaterial({ 
        color: '#38bdf8', emissive: '#38bdf8', emissiveIntensity: 0.6, 
        transparent: true, opacity: 0.85, roughness: 0.3, metalness: 0.1 
      }),
      
      entangledMat: new THREE.MeshStandardMaterial({ 
        color: '#a855f7', emissive: '#a855f7', emissiveIntensity: 0.6, 
        transparent: true, opacity: 0.85, roughness: 0.3, metalness: 0.1 
      }),
      
      // 🌟 優化 2：加上 polygonOffset 消滅與底座/柱體的 Z-Fighting 閃爍
      trackMat: new THREE.MeshBasicMaterial({ 
        color: '#a855f7', transparent: true, opacity: 0.3, 
        blending: THREE.AdditiveBlending, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
      }),
    };
  }, []);

  // 🌟 優化 3：生命週期結束時主動釋放 GPU 記憶體，防止切換展台造成 VRAM 洩漏
  useEffect(() => {
    return () => {
      Object.values(resources).forEach(resource => {
        if (typeof resource.dispose === 'function') {
          resource.dispose();
        }
      });
    };
  }, [resources]);

  return (
    <group position={[0, -1, 0]}>
      {/* 展台底座永遠顯示 */}
      <RoundedBox args={[8, 0.8, 6]} radius={0.1} smoothness={4} position={[0, -0.4, 0]}>
        <primitive object={resources.baseMat} attach="material" />
      </RoundedBox>

      {/* 貝爾態對角線發光軌道 */}
      {isEntangled && (
        <mesh 
          position={[0, 0.02, 0]} 
          rotation={[-Math.PI / 2, 0, 0.6435]} 
          geometry={resources.trackGeo} 
          material={resources.trackMat} 
          dispose={null}
        />
      )}

      {/* 防禦性渲染 (Defensive Rendering) */}
      {POSITIONS.map((pos, i) => {
        const amp = amplitudes[i];
        if (!amp) return null;

        return (
          <Pillar 
            key={i} 
            position={pos} 
            amplitude={amp}
            geometry={resources.pillarGeo}
            material={isEntangled ? resources.entangledMat : resources.normalMat}
          />
        );
      })}
    </group>
  );
};
