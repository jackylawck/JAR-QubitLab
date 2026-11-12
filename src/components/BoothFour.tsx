// src/components/BoothFour.tsx
import { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

// 🌟 重新校準三區坐標與比例 (總寬度 8.4，置中，無縫相接)
const ALICE_POSITIONS: [number, number, number][] = [
  [-1, 0, 1], [-1, 0, -1], [1, 0, 1], [1, 0, -1]
];

const BOB_POSITIONS: [number, number, number][] = [
  [-0.4, 0, 0.8], [0.4, 0, -0.8] 
];

export function BoothFour() {
  const mockHeight = 1.5; 

  // 🌟 Zero-GC 優化：預先建立並共享幾何體與材質
  const { 
    baseMat, channelMat, packetMat,
    aliceRingMat, alicePillarMat, 
    bobRingMat, bobPillarMat,
    ringGeo, pillarGeo, planeGeo, sphereGeo 
  } = useMemo(() => {
    // 【核心優化】將圓柱體原點移至底部！未來只需要改 scale-y 就能長高
    const cyl = new THREE.CylinderGeometry(0.35, 0.35, 1, 32);
    cyl.translate(0, 0.5, 0); 

    return {
      // 幾何體
      pillarGeo: cyl,
      ringGeo: new THREE.CircleGeometry(0.4, 32),
      planeGeo: new THREE.PlaneGeometry(2.8, 0.2),
      sphereGeo: new THREE.SphereGeometry(0.25, 16, 16),
      
      // 材質 (共用材質大幅降低 Draw Call 與 GC 壓力)
      baseMat: new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.8 }),
      channelMat: new THREE.MeshBasicMaterial({ color: "#334155", transparent: true, opacity: 0.5 }),
      packetMat: new THREE.MeshBasicMaterial({ color: "#fbbf24", toneMapped: false }),
      
      aliceRingMat: new THREE.MeshBasicMaterial({ color: "#38bdf8", transparent: true, opacity: 0.4, depthWrite: false }),
      alicePillarMat: new THREE.MeshStandardMaterial({ color: "#38bdf8", emissive: "#0ea5e9", emissiveIntensity: 0.8, transparent: true, opacity: 0.85 }),
      
      bobRingMat: new THREE.MeshBasicMaterial({ color: "#a855f7", transparent: true, opacity: 0.4, depthWrite: false }),
      bobPillarMat: new THREE.MeshStandardMaterial({ color: "#a855f7", emissive: "#9333ea", emissiveIntensity: 0.8, transparent: true, opacity: 0.85 }),
    };
  }, []);

  return (
    <group position={[-0.4, -1, 0]}>
      
      {/* 1. ALICE 面板 (左側) */}
      <group position={[-2.8, 0, 0]}>
        <RoundedBox args={[3.2, 0.8, 3]} radius={0.1} smoothness={4} position={[0, -0.4, 0]}>
          <primitive object={baseMat} attach="material" />
        </RoundedBox>
        
        {ALICE_POSITIONS.map((pos, i) => (
          <group key={`alice-${i}`} position={pos}>
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={ringGeo} material={aliceRingMat} />
            {/* 🌟 透過 scale-y 控制高度，不需再手算 position-y */}
            <mesh scale-y={mockHeight} geometry={pillarGeo} material={alicePillarMat} />
          </group>
        ))}
      </group>

      {/* 2. 經典通訊通道 (中央) */}
      <group position={[0.2, 0, 0]}>
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={planeGeo} material={channelMat} />
        <mesh position={[0, 0.1, 0]} geometry={sphereGeo} material={packetMat} />
      </group>

      {/* 3. BOB 面板 (右側) */}
      <group position={[2.8, 0, 0]}>
        <RoundedBox args={[2.4, 0.8, 3]} radius={0.1} smoothness={4} position={[0, -0.4, 0]}>
          <primitive object={baseMat} attach="material" />
        </RoundedBox>
        
        {BOB_POSITIONS.map((pos, i) => (
          <group key={`bob-${i}`} position={pos}>
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={ringGeo} material={bobRingMat} />
            {/* 🌟 透過 scale-y 控制高度 */}
            <mesh scale-y={mockHeight} geometry={pillarGeo} material={bobPillarMat} />
          </group>
        ))}
      </group>
    </group>
  );
}
