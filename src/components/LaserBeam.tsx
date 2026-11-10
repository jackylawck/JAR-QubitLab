import { useMemo } from 'react';
import * as THREE from 'three';

interface LaserBeamProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  intensity?: number;
  coreRadius?: number;
  glowRadius?: number;
}

export function LaserBeam({
  start,
  end,
  color = '#00f0ff',
  intensity = 0.8,
  coreRadius = 0.015,
  glowRadius = 0.045
}: LaserBeamProps) {
  const { mid, len, quaternion } = useMemo(() => {
    const p1 = new THREE.Vector3(...start);
    const p2 = new THREE.Vector3(...end);
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    // CylinderGeometry 預設朝向 Y 軸 (0, 1, 0)，旋轉對齊 dir
    const up = new THREE.Vector3(0, 1, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir.normalize());

    return { mid, len, quaternion: q };
  }, [start, end]);

  return (
    <group position={mid} quaternion={quaternion}>
      {/* 1. 高純度白熾光芯 */}
      <mesh>
        <cylinderGeometry args={[coreRadius, coreRadius, len, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 2. 外圍光子輝光光暈 (AdditiveBlending) */}
      <mesh>
        <cylinderGeometry args={[glowRadius, glowRadius, len, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={intensity * 0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
