// src/components/BoothThree.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Theme: EVA-01 (Unit-01) vs EVA-13 (Unit-13) Final Showdown
 */
import { Suspense, useMemo, useEffect } from 'react';
import { Text, RoundedBox } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { useTensorStore } from '../store/tensorStore';
import { FONT_MATH_PATH } from '../constants';
import { TensorAmplitude } from '../quantum/tensorEngine';

const POSITIONS: [number, number, number][] = [
  [-2, 0,  1.5], // |00⟩ - 初號機
  [-2, 0, -1.5], // |01⟩ - 初號機
  [ 2, 0,  1.5], // |10⟩ - 13號機
  [ 2, 0, -1.5], // |11⟩ - 13號機
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
      <a.mesh geometry={geometry} material={material} scale-y={scaleY} dispose={null} />

      <group position={[0, 3.6, 0]}>
        <Suspense fallback={null}>
          <Text 
            fontSize={0.45} 
            color="#ffffff" 
            font={FONT_MATH_PATH}
            outlineWidth={0.03}
            outlineColor="#000000"
            anchorX="center"
            anchorY="middle"
            depthOffset={-1} // 防止字體與其他透視物件發生 Z-Fighting
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

  // 🌟 Zero-GC 預分配記憶體：注入 EVA-01 與 EVA-13 專屬材質
  const resources = useMemo(() => {
    const cyl = new THREE.CylinderGeometry(0.5, 0.5, 3, 32);
    cyl.translate(0, 1.5, 0); // 將高為 3 的圓柱體原點下移至底部

    return {
      pillarGeo: cyl,
      // 將軌道稍微加寬以容納雙色雙螺旋的視覺感
      trackGeo: new THREE.PlaneGeometry(6.8, 0.4), 
      
      baseMat: new THREE.MeshStandardMaterial({ color: '#090a0f', roughness: 0.8, metalness: 0.4 }),
      
      // q0：初號機 (EVA-01) - 覺醒紫與高能綠
      eva01Mat: new THREE.MeshStandardMaterial({ 
        color: '#a855f7', emissive: '#22c55e', emissiveIntensity: 0.8, 
        transparent: true, opacity: 0.9, roughness: 0.2, metalness: 0.2 
      }),
      eva01EntangledMat: new THREE.MeshStandardMaterial({ 
        color: '#a855f7', emissive: '#22c55e', emissiveIntensity: 1.5, // 同步率 100% 爆發
        transparent: true, opacity: 1.0, roughness: 0.1, metalness: 0.3 
      }),
      
      // q1：第13號機 (EVA-13) - 暗夜紫藍與猩紅雙瞳
      eva13Mat: new THREE.MeshStandardMaterial({ 
        color: '#4f46e5', emissive: '#e11d48', emissiveIntensity: 0.8, 
        transparent: true, opacity: 0.9, roughness: 0.2, metalness: 0.2 
      }),
      eva13EntangledMat: new THREE.MeshStandardMaterial({ 
        color: '#4f46e5', emissive: '#e11d48', emissiveIntensity: 1.5, // 同步率 100% 爆發
        transparent: true, opacity: 1.0, roughness: 0.1, metalness: 0.3 
      }),
      
      // 🌟 雙槍交織軌道 (朗基努斯赤紅 + 卡西烏斯蒼藍)
      trackMat: new THREE.MeshBasicMaterial({ 
        color: '#e11d48', // 基底為赤紅
        transparent: true, opacity: 0.45, 
        blending: THREE.AdditiveBlending, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
      }),
    };
  }, []);

  // 🌟 生命週期結束時主動釋放 GPU 記憶體
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
      <ambientLight intensity={0.6} />
      {/* 從兩側打光，強化雙機對立感 */}
      <directionalLight position={[-5, 8, 5]} intensity={1.2} color="#a855f7" />
      <directionalLight position={[ 5, 8, 5]} intensity={1.2} color="#6366f1" />

      {/* 展台底座 */}
      <RoundedBox args={[8, 0.8, 6]} radius={0.1} smoothness={4} position={[0, -0.4, 0]}>
        <primitive object={resources.baseMat} attach="material" />
      </RoundedBox>

      {/* 貝爾態對角線發光軌道 (朗基努斯之槍與卡西烏斯之槍的交織) */}
      {isEntangled && (
        <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0.6435]}>
          <mesh geometry={resources.trackGeo} material={resources.trackMat} dispose={null} />
          {/* 疊加一層蒼藍色光暈，形成雙色交織效果 */}
          <mesh geometry={resources.trackGeo} dispose={null}>
             <meshBasicMaterial 
                color="#38bdf8" transparent opacity={0.3} 
                blending={THREE.AdditiveBlending} depthWrite={false}
                polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2}
             />
          </mesh>
        </group>
      )}

      {/* 雙機態向量 (Defensive Rendering) */}
      {POSITIONS.map((pos, i) => {
        const amp = amplitudes[i];
        if (!amp) return null;

        // i=0,1 (左側) 屬於初號機；i=2,3 (右側) 屬於13號機
        const isEva01 = i < 2; 
        
        let mat = isEva01 ? resources.eva01Mat : resources.eva13Mat;
        if (isEntangled) {
          mat = isEva01 ? resources.eva01EntangledMat : resources.eva13EntangledMat;
        }

        return (
          <Pillar 
            key={i} 
            position={pos} 
            amplitude={amp}
            geometry={resources.pillarGeo}
            material={mat}
          />
        );
      })}
    </group>
  );
};
