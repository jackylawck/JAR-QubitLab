// src/components/LaserBeam.tsx
import * as THREE from 'three';

interface LaserBeamProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  intensity?: number;
}

export function LaserBeam({ start, end, color = '#00f0ff', intensity = 0.8 }: LaserBeamProps) {
  const p1 = new THREE.Vector3(...start);
  const p2 = new THREE.Vector3(...end);
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  
  // 計算旋轉朝向
  const orientation = new THREE.Matrix4();
  orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0));

  return (
    <group position={mid}>
      {/* 1. 內核白熾光芯 */}
      <mesh>
        <cylinderGeometry args={[0.015, 0.015, len, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 2. 外圍光子輝光光暈 (借鑑黑洞 Photon Ring 參數) */}
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, len, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={intensity * 0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
