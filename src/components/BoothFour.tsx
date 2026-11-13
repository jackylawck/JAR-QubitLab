// src/components/BoothFour.tsx
import { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useTeleportStore } from '../store/teleportStore';

const ALICE_POSITIONS: [number, number, number][] = [
  [-1, 0, 1], [-1, 0, -1], [1, 0, 1], [1, 0, -1]
];

const BOB_POSITIONS: [number, number, number][] = [
  [-0.4, 0, 0.8], [0.4, 0, -0.8] 
];

export function BoothFour() {
  // 🌟 訂閱狀態以驅動物理動畫
  const phase = useTeleportStore((s) => s.phase);
  
  // (註: 這裡使用 mockHeight 佔位，你可以替換為 useTeleportStore 取出的真實機率陣列)
  const mockHeight = 1.5; 
  const mockGhostHeight = 1.0; 

  // 🌟 Zero-GC 優化：預先建立並共享幾何體與材質
  const { 
    baseMat, channelMat, packetMat,
    aliceRingMat, alicePillarMat, 
    bobRingMat, bobPillarMat, bobGhostMat,
    ringGeo, pillarGeo, planeGeo, sphereGeo 
  } = useMemo(() => {
    // 【核心優化】將圓柱體原點移至底部！未來只需要改 scale-y 就能長高
    const cyl = new THREE.CylinderGeometry(0.35, 0.35, 1, 32);
    cyl.translate(0, 0.5, 0); 

    return {
      pillarGeo: cyl,
      ringGeo: new THREE.CircleGeometry(0.4, 32),
      planeGeo: new THREE.PlaneGeometry(2.8, 0.2),
      sphereGeo: new THREE.SphereGeometry(0.25, 16, 16),
      
      baseMat: new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.8 }),
      channelMat: new THREE.MeshBasicMaterial({ color: "#334155", transparent: true, opacity: 0.5 }),
      packetMat: new THREE.MeshBasicMaterial({ color: "#fbbf24", toneMapped: false }),
      
      aliceRingMat: new THREE.MeshBasicMaterial({ color: "#38bdf8", transparent: true, opacity: 0.4, depthWrite: false }),
      alicePillarMat: new THREE.MeshStandardMaterial({ color: "#38bdf8", emissive: "#0ea5e9", emissiveIntensity: 0.8, transparent: true, opacity: 0.85 }),
      
      bobRingMat: new THREE.MeshBasicMaterial({ color: "#a855f7", transparent: true, opacity: 0.4, depthWrite: false }),
      bobPillarMat: new THREE.MeshStandardMaterial({ color: "#a855f7", emissive: "#9333ea", emissiveIntensity: 0.8, transparent: true, opacity: 0.85 }),
      
      // 🌟 新增：幽靈殼材質 (Wireframe 透視感，代表目標態)
      bobGhostMat: new THREE.MeshBasicMaterial({ color: "#ffffff", wireframe: true, transparent: true, opacity: 0.15, depthWrite: false }),
    };
  }, []);

  // 🌟 經典通訊封包動畫 (Classical Channel Packet)
  const isSent = phase === 'correct' || phase === 'success' || phase === 'failed';
  const { packetX, packetScale } = useSpring({
    packetX: isSent ? 1.2 : -1.2,
    packetScale: phase === 'prepare' ? 0 : 1,
    config: { mass: 1, tension: 80, friction: 20 }
  });

  return (
    <group position={[-0.4, -1, 0]}>
      
      {/* 1. ALICE 面板 (左側) */}
      <group position={[-2.8, 0, 0]}>
        <RoundedBox args={[3.2, 0.8, 3]} radius={0.1} smoothness={4} position={[0, -0.4, 0]}>
          <primitive object={baseMat} attach="material" />
        </RoundedBox>
        
        {ALICE_POSITIONS.map((pos, i) => (
          <group key={`alice-${i}`} position={pos}>
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={ringGeo} material={aliceRingMat} dispose={null} />
            <a.mesh scale-y={mockHeight} geometry={pillarGeo} material={alicePillarMat} dispose={null} />
          </group>
        ))}
      </group>

      {/* 2. 經典通訊通道 (中央) */}
      <group position={[0.2, 0, 0]}>
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={planeGeo} material={channelMat} dispose={null} />
        <a.mesh position-x={packetX} position-y={0.1} scale={packetScale} geometry={sphereGeo} material={packetMat} dispose={null} />
      </group>

      {/* 3. BOB 面板 (右側) */}
      <group position={[2.8, 0, 0]}>
        <RoundedBox args={[2.4, 0.8, 3]} radius={0.1} smoothness={4} position={[0, -0.4, 0]}>
          <primitive object={baseMat} attach="material" />
        </RoundedBox>
        
        {BOB_POSITIONS.map((pos, i) => (
          <group key={`bob-${i}`} position={pos}>
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={ringGeo} material={bobRingMat} dispose={null} />
            
            {/* 實體柱 (Bob 當前態) */}
            <a.mesh scale-y={mockHeight} geometry={pillarGeo} material={bobPillarMat} dispose={null} />
            
            {/* 🌟 幽靈殼 (Alice 欲傳送的目標態)，X/Z 軸微幅放大避免 Z-fighting */}
            <a.mesh scale={[1.05, mockGhostHeight, 1.05]} geometry={pillarGeo} material={bobGhostMat} dispose={null} />
          </group>
        ))}
      </group>
    </group>
  );
}
