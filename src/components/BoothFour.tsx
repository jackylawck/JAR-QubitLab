// src/components/BoothFour.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Theme: EVA-00 Soul Transfer & Terminal Dogma (No-Cloning Theorem)
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

  // 🌟 Zero-GC 預分配：Terminal Dogma & EVA-00 專屬幾何與材質
  const resources = useMemo(() => {
    // 柱體幾何：高 1，原點下移 0.5 對齊底部，方便 scale-y 縮放
    const cyl = new THREE.CylinderGeometry(0.32, 0.32, 1, 32);
    cyl.translate(0, 0.5, 0); 
    
    // 脊椎導管：使用波紋圓柱模擬節點
    const spineGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 16, 24);
    
    return {
      pillarGeo: cyl,
      ringGeo: new THREE.CircleGeometry(0.42, 32),
      spineGeo: spineGeo,
      packetGeo: new THREE.SphereGeometry(0.18, 24, 24),
      
      // 裝飾性箍環幾何（頂部/底部）
      hoopGeo: new THREE.TorusGeometry(0.35, 0.03, 16, 32),
      sensorGeo: new THREE.SphereGeometry(0.06, 16, 16),
      
      baseMat: new THREE.MeshStandardMaterial({ color: "#090a0f", roughness: 0.8 }),
      
      // ==========================================
      // Alice 端：零號機改 (山吹橙 + 深灰肩甲)
      // ==========================================
      aliceRingMat: new THREE.MeshBasicMaterial({ 
        color: "#f97316", transparent: true, opacity: 0.25, depthWrite: false 
      }),
      alicePillarMat: new THREE.MeshStandardMaterial({ 
        color: "#f97316", emissive: "#ea580c", emissiveIntensity: 0.7, 
        transparent: true, opacity: 0.9, roughness: 0.2, metalness: 0.1 
      }),
      aliceArmorMat: new THREE.MeshStandardMaterial({
        color: "#1e293b", roughness: 0.5, metalness: 0.6 // 深灰黑肩甲
      }),

      // ==========================================
      // MAGI 通道：Terminal Dogma 脊椎 + 螢光綠數據環
      // ==========================================
      spineMat: new THREE.MeshStandardMaterial({ 
        color: "#f1f5f9", roughness: 0.7, metalness: 0.1 // 骨骼白
      }),
      dnaRingMat: new THREE.MeshBasicMaterial({
        color: "#22c55e", transparent: true, opacity: 0.6, // 基因數據螢光綠
        depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
      }),
      packetMat: new THREE.MeshStandardMaterial({ 
        color: "#fbbf24", emissive: "#f59e0b", emissiveIntensity: 1.5, // LCL 琥珀金光球
        toneMapped: false, roughness: 0.1 
      }),
      
      // ==========================================
      // Bob 端：零號機初期型 (鈷藍純白) + Rei Tank 培養水槽
      // ==========================================
      bobRingMat: new THREE.MeshBasicMaterial({ 
        color: "#f8fafc", transparent: true, opacity: 0.25, depthWrite: false // 純白底座
      }),
      bobPillarMat: new THREE.MeshStandardMaterial({ 
        color: "#2563eb", emissive: "#1d4ed8", emissiveIntensity: 0.8, // 初期鈷藍
        transparent: true, opacity: 0.9, roughness: 0.2, metalness: 0.1 
      }),
      
      // Rei Tank 透明玻璃水槽
      bobTankMat: new THREE.MeshPhysicalMaterial({ 
        color: "#ffffff", transparent: true, opacity: 0.15, 
        transmission: 0.9, // 玻璃折射感
        roughness: 0.0, metalness: 0.1, depthWrite: false, side: THREE.DoubleSide
      }),
      silverHoopMat: new THREE.MeshStandardMaterial({
        color: "#e2e8f0", roughness: 0.3, metalness: 0.8 // 銀白金屬箍
      }),
      sensorMat: new THREE.MeshBasicMaterial({
        color: "#10b981", toneMapped: false // 頂部翠綠感應器
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

  // 🌟 LCL 經典通訊封包動畫
  const isSent = phase === 'correct' || phase === 'success' || phase === 'failed';
  const { packetX, packetScale } = useSpring({
    packetX: isSent ? 1.4 : -1.4,
    packetScale: phase === 'prepare' ? 0 : 1,
    config: { mass: 1, tension: 120, friction: 20 }
  });

  return (
    <group position={[-0.4, -1, 0]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[-4, 8, 4]} intensity={1.1} color="#fb923c" /> {/* 山吹橙打光 */}
      <directionalLight position={[ 4, 8, 4]} intensity={1.1} color="#60a5fa" /> {/* 初期藍打光 */}

      {/* ==========================================
          1. ALICE 面板 (發送端 / EVA-00改 意象)
          ========================================== */}
      <group position={[-3.0, 0, 0]}>
        <RoundedBox args={[3.2, 0.8, 3]} radius={0.1} smoothness={4} position={[0, -0.4, 0]}>
          <primitive object={resources.baseMat} attach="material" />
        </RoundedBox>
        
        {ALICE_POSITIONS.map((pos, i) => (
          <group key={`alice-${i}`} position={pos}>
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={resources.ringGeo} material={resources.aliceRingMat} dispose={null} />
            <a.mesh scale-y={mockHeight} geometry={resources.pillarGeo} material={resources.alicePillarMat} dispose={null}>
              {/* 深灰黑肩甲環，隨柱體縮放固定在頂部 */}
              <mesh position={[0, 0.98, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={resources.hoopGeo} material={resources.aliceArmorMat} dispose={null} />
            </a.mesh>
          </group>
        ))}
      </group>

      {/* ==========================================
          2. 經典通訊通道 (Terminal Dogma 脊椎導管)
          ========================================== */}
      <group position={[0, 0, 0]}>
        {/* 白色分段脊椎管 */}
        <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} geometry={resources.spineGeo} material={resources.spineMat} dispose={null} />
        
        {/* 兩端螢光綠數據校驗環 */}
        <mesh position={[-1.6, 0.05, 0]} rotation={[0, Math.PI / 2, 0]} geometry={resources.ringGeo} material={resources.dnaRingMat} dispose={null} />
        <mesh position={[ 1.6, 0.05, 0]} rotation={[0, Math.PI / 2, 0]} geometry={resources.ringGeo} material={resources.dnaRingMat} dispose={null} />
        
        {/* 琥珀金封包 (光球) */}
        <a.mesh position-x={packetX} position-y={0.25} scale={packetScale} geometry={resources.packetGeo} material={resources.packetMat} dispose={null} />
      </group>

      {/* ==========================================
          3. BOB 面板 (接收端 / EVA-00初期 + Rei Tank 水槽)
          ========================================== */}
      <group position={[3.0, 0, 0]}>
        <RoundedBox args={[2.4, 0.8, 3]} radius={0.1} smoothness={4} position={[0, -0.4, 0]}>
          <primitive object={resources.baseMat} attach="material" />
        </RoundedBox>
        
        {BOB_POSITIONS.map((pos, i) => (
          <group key={`bob-${i}`} position={pos}>
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={resources.ringGeo} material={resources.bobRingMat} dispose={null} />
            
            {/* 實體柱 (初期鈷藍) */}
            <a.mesh scale-y={mockHeight} geometry={resources.pillarGeo} material={resources.bobPillarMat} dispose={null} />
            
            {/* 🌟 玻璃培養槽 (Rei Tank 空殼容器) */}
            <a.mesh scale={[1.08, mockGhostHeight, 1.08]} geometry={resources.pillarGeo} material={resources.bobTankMat} dispose={null}>
              {/* 上下銀白金屬箍環 */}
              <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={resources.hoopGeo} material={resources.silverHoopMat} dispose={null} />
              <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={resources.hoopGeo} material={resources.silverHoopMat} dispose={null} />
              {/* 頂部翠綠感應器 */}
              <mesh position={[0, 1.02, 0.28]} geometry={resources.sensorGeo} material={resources.sensorMat} dispose={null} />
            </a.mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
