// src/components/BoothFour.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Theme: EVA-00 Soul Transfer & MAGI Transmission (No-Cloning Theorem)
 */
import { useMemo, useEffect } from 'react';
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
  const phase = useTeleportStore((s) => s.phase);
  
  // (註: 這裡使用 mockHeight 佔位，後續可替換為 useTeleportStore 取出的真實振幅機率)
  const mockHeight = 1.5; 
  const mockGhostHeight = 1.0; 

  // 🌟 Zero-GC 預分配：EVA-00 與 MAGI 專屬材質
  const resources = useMemo(() => {
    // 將高為 1 的圓柱體原點下移 0.5（對齊底部），後續僅需改 scale-y 即可完美長高
    const cyl = new THREE.CylinderGeometry(0.35, 0.35, 1, 32);
    cyl.translate(0, 0.5, 0); 

    return {
      pillarGeo: cyl,
      ringGeo: new THREE.CircleGeometry(0.4, 32),
      planeGeo: new THREE.PlaneGeometry(2.8, 0.2),
      sphereGeo: new THREE.SphereGeometry(0.2, 16, 16), // 微調 MAGI 封包大小
      
      baseMat: new THREE.MeshStandardMaterial({ color: "#090a0f", roughness: 0.8 }),
      
      // 中央 MAGI 通道 (戰術暗灰)
      channelMat: new THREE.MeshBasicMaterial({ 
        color: "#334155", transparent: true, opacity: 0.5,
        polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
      }),
      // MAGI 經典位元封包 (琥珀金)
      packetMat: new THREE.MeshStandardMaterial({ 
        color: "#fbbf24", emissive: "#d97706", emissiveIntensity: 1.2, 
        toneMapped: false, roughness: 0.2 
      }),
      
      // Alice 端 (發送端)：EVA-00 改 (山吹橙)
      aliceRingMat: new THREE.MeshBasicMaterial({ 
        color: "#f97316", transparent: true, opacity: 0.35, depthWrite: false 
      }),
      alicePillarMat: new THREE.MeshStandardMaterial({ 
        color: "#f97316", emissive: "#ea580c", emissiveIntensity: 0.85, 
        transparent: true, opacity: 0.85, roughness: 0.2, metalness: 0.1 
      }),
      
      // Bob 端 (接收端)：EVA-00 初期 (初期藍)
      bobRingMat: new THREE.MeshBasicMaterial({ 
        color: "#0ea5e9", transparent: true, opacity: 0.35, depthWrite: false 
      }),
      bobPillarMat: new THREE.MeshStandardMaterial({ 
        color: "#0ea5e9", emissive: "#0284c7", emissiveIntensity: 0.85, 
        transparent: true, opacity: 0.85, roughness: 0.2, metalness: 0.1 
      }),
      
      // Bob 端幽靈殼容器：純白與微弱冰藍光澤的 Wireframe
      bobGhostMat: new THREE.MeshBasicMaterial({ 
        color: "#ffffff", wireframe: true, transparent: true, opacity: 0.2, 
        depthWrite: false, blending: THREE.AdditiveBlending 
      }),
    };
  }, []);

  // 生命週期結束主動釋放 GPU 記憶體
  useEffect(() => {
    return () => {
      Object.values(resources).forEach(res => {
        if (typeof res.dispose === 'function') res.dispose();
      });
    };
  }, [resources]);

  // 🌟 MAGI 經典通訊封包動畫
  const isSent = phase === 'correct' || phase === 'success' || phase === 'failed';
  const { packetX, packetScale } = useSpring({
    packetX: isSent ? 1.2 : -1.2,
    packetScale: phase === 'prepare' ? 0 : 1,
    config: { mass: 1, tension: 120, friction: 20 } // 稍微加快傳輸速度
  });

  return (
    <group position={[-0.4, -1, 0]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[-4, 8, 4]} intensity={1.2} color="#f97316" /> {/* 山吹橙打光 */}
      <directionalLight position={[ 4, 8, 4]} intensity={1.2} color="#0ea5e9" /> {/* 初期藍打光 */}

      {/* 1. ALICE 面板 (發送端 / EVA-00改) */}
      <group position={[-2.8, 0, 0]}>
        <RoundedBox args={[3.2, 0.8, 3]} radius={0.1} smoothness={4} position={[0, -0.4, 0]}>
          <primitive object={resources.baseMat} attach="material" />
        </RoundedBox>
        
        {ALICE_POSITIONS.map((pos, i) => (
          <group key={`alice-${i}`} position={pos}>
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={resources.ringGeo} material={resources.aliceRingMat} dispose={null} />
            <a.mesh scale-y={mockHeight} geometry={resources.pillarGeo} material={resources.alicePillarMat} dispose={null} />
          </group>
        ))}
      </group>

      {/* 2. 經典通訊通道 (MAGI 戰術網路) */}
      <group position={[0.2, 0, 0]}>
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={resources.planeGeo} material={resources.channelMat} dispose={null} />
        <a.mesh position-x={packetX} position-y={0.1} scale={packetScale} geometry={resources.sphereGeo} material={resources.packetMat} dispose={null} />
      </group>

      {/* 3. BOB 面板 (接收端空殼 / EVA-00初期) */}
      <group position={[2.8, 0, 0]}>
        <RoundedBox args={[2.4, 0.8, 3]} radius={0.1} smoothness={4} position={[0, -0.4, 0]}>
          <primitive object={resources.baseMat} attach="material" />
        </RoundedBox>
        
        {BOB_POSITIONS.map((pos, i) => (
          <group key={`bob-${i}`} position={pos}>
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={resources.ringGeo} material={resources.bobRingMat} dispose={null} />
            
            {/* 實體柱 (Bob 當前被測量或修正後的態) */}
            <a.mesh scale-y={mockHeight} geometry={resources.pillarGeo} material={resources.bobPillarMat} dispose={null} />
            
            {/* 🌟 幽靈殼 (Alice 欲傳送的目標靈魂)，X/Z 軸微幅放大避免與實體柱 Z-fighting */}
            <a.mesh scale={[1.05, mockGhostHeight, 1.05]} geometry={resources.pillarGeo} material={resources.bobGhostMat} dispose={null} />
          </group>
        ))}
      </group>
    </group>
  );
}
