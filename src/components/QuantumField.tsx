import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function QuantumField({ count = 500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  // 儲存 originalY 基準數組，避免累積累加造成的長期漂移
  const [positions, originalY, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const origY = new Float32Array(count);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 18 + 1;
      pos[i * 3 + 1] = y;
      origY[i] = y;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, origY, ph];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.015;

    const posAttr = pointsRef.current.geometry.attributes.position;
    const array = posAttr.array as Float32Array;

    // 錨定原始 Y 坐標進行正弦微動
    for (let i = 0; i < count; i++) {
      const idx = i * 3 + 1;
      array[idx] = originalY[i] + Math.sin(t * 1.4 + phases[i]) * 0.12;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.11}
        color="#38bdf8"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
