// src/components/InterferenceBurst.tsx
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface InterferenceBurstProps {
  type: 'evaporate' | 'merge' | null;
  position: [number, number, number];
  onComplete: () => void;
}

export const InterferenceBurst = ({ type, position, onComplete }: InterferenceBurstProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const progressRef = useRef(0);
  const count = 60; // 輕量化粒子數量，適配手機效能

  // 生成粒子初始向外/向內的隨機速度向量
  const [positions, velocities, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const isEvaporate = type === 'evaporate';
    const baseColor = isEvaporate ? new THREE.Color('#ec4899') : new THREE.Color('#38bdf8');

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // 隨機球座標初速
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = isEvaporate ? 1.5 + Math.random() * 2 : 2.5 + Math.random();

      vel[idx] = Math.sin(phi) * Math.cos(theta) * speed;
      vel[idx + 1] = isEvaporate ? Math.abs(Math.sin(phi) * Math.sin(theta) * speed) + 1.2 : Math.cos(phi) * speed; // 蒸發向上飄
      vel[idx + 2] = Math.cos(phi) * speed;

      // merge 從外圍向中心凝聚，evaporate 從中心散開
      if (!isEvaporate) {
        pos[idx] = -vel[idx] * 0.4;
        pos[idx + 1] = -vel[idx + 1] * 0.4;
        pos[idx + 2] = -vel[idx + 2] * 0.4;
      }

      col[idx] = baseColor.r;
      col[idx + 1] = baseColor.g;
      col[idx + 2] = baseColor.b;
    }

    return [pos, vel, col];
  }, [type]);

  useEffect(() => {
    progressRef.current = 0;
  }, [type]);

  useFrame((_, delta) => {
    if (!type || !pointsRef.current) return;

    progressRef.current += delta * 2.2;
    const progress = progressRef.current;

    if (progress >= 1.0) {
      onComplete();
      return;
    }

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      if (type === 'evaporate') {
        array[idx] += velocities[idx] * delta;
        array[idx + 1] += velocities[idx + 1] * delta; // 向上蒸發
        array[idx + 2] += velocities[idx + 2] * delta;
      } else {
        // 相長凝聚：向中心收縮
        array[idx] += velocities[idx] * delta * 0.9;
        array[idx + 1] += velocities[idx + 1] * delta * 0.9;
        array[idx + 2] += velocities[idx + 2] * delta * 0.9;
      }
    }

    posAttr.needsUpdate = true;
  });

  if (!type) return null;

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={type === 'evaporate' ? 0.9 : 0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
