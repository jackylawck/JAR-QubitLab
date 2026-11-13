// src/components/LaserBeam.tsx
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LaserBeamProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  intensity?: number;
  coreRadius?: number;
  glowRadius?: number;
  animated?: boolean; // 動畫開關
}

// 🌟 優化 1：全域靜態幾何體與核心材質 (Zero-GC)
// 捨棄每次依據長度重新 new CylinderGeometry，改用高度為 1 的「單位圓柱體」
const BEAM_GEOMETRY = new THREE.CylinderGeometry(1, 1, 1, 16);

// 將高純度白熾光芯材質抽離，讓場景中無限條雷射光束都能共用同一個 GPU 記憶體
const CORE_MATERIAL = new THREE.MeshBasicMaterial({
  color: '#ffffff',
  transparent: true,
  opacity: 0.95,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  toneMapped: false, // 不受 ACES 壓制，保持純白過曝感
});

export function LaserBeam({
  start,
  end,
  color = '#00f0ff',
  intensity = 0.8,
  coreRadius = 0.015,
  glowRadius = 0.045,
  animated = true // 預設開啟脈動
}: LaserBeamProps) {
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  const { mid, len, quaternion } = useMemo(() => {
    // 🌟 優化 3：消除 Spread Operator (...) 開銷，直接讀取索引效能最佳
    const p1 = new THREE.Vector3(start[0], start[1], start[2]);
    const p2 = new THREE.Vector3(end[0], end[1], end[2]);
    
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const length = dir.length();
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const up = new THREE.Vector3(0, 1, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir.normalize());

    return { mid, len: length, quaternion: q };
  }, [start, end]);

  // 🌟 量子脈動動畫 (Quantum High-Frequency Flicker)
  useFrame(({ clock }) => {
    if (!animated || !glowMaterialRef.current) return;
    const t = clock.elapsedTime;
    // 利用雙重正弦波疊加，模擬高能光子束不穩定的微弱電壓閃爍感
    const flicker = Math.sin(t * 30) * 0.04 + Math.sin(t * 12) * 0.04;
    glowMaterialRef.current.opacity = (intensity * 0.65) + flicker;
  });

  return (
    <group position={mid} quaternion={quaternion}>
      {/* 🌟 優化 2：使用 Scale 分別縮放半徑與長度，完美適配不同尺寸 */}
      
      {/* 1. 高純度白熾光芯 (套用全域材質，並加上 dispose={null} 防誤刪) */}
      <mesh 
        geometry={BEAM_GEOMETRY} 
        material={CORE_MATERIAL} 
        scale={[coreRadius, len, coreRadius]} 
        dispose={null} 
      />

      {/* 2. 外圍光子輝光光暈 (顏色與透明度需獨立變動，保留獨立 Material) */}
      <mesh 
        geometry={BEAM_GEOMETRY} 
        scale={[glowRadius, len, glowRadius]} 
        dispose={null}
      >
        <meshBasicMaterial
          ref={glowMaterialRef}
          color={color}
          transparent
          opacity={intensity * 0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false} // 保持鮮豔的霓虹光暈，不會變灰變暗
        />
      </mesh>
    </group>
  );
}
