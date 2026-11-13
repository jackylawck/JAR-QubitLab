// src/components/QuantumField.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Description: Global Quantum Fluctuation Field (Zero-GC & Vertex Colors)
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_TEXTURE = (() => {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
})();

const FIELD_MATERIAL = new THREE.PointsMaterial({
  size: 0.16,
  vertexColors: true,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  map: PARTICLE_TEXTURE,
  toneMapped: false,
});

export function QuantumField({ count = 500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors, originalY, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const origY = new Float32Array(count);
    const ph = new Float32Array(count);

    const color1 = new THREE.Color('#38bdf8');
    const color2 = new THREE.Color('#a855f7');
    const tmpColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx] = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 18 + 1;
      pos[idx + 1] = y;
      origY[i] = y;
      pos[idx + 2] = (Math.random() - 0.5) * 30;

      ph[i] = Math.random() * Math.PI * 2;

      tmpColor.lerpColors(color1, color2, Math.random());
      col[idx] = tmpColor.r;
      col[idx + 1] = tmpColor.g;
      col[idx + 2] = tmpColor.b;
    }
    return [pos, col, origY, ph];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();

    pointsRef.current.rotation.y = t * 0.015;

    const posAttr = pointsRef.current.geometry.attributes.position;
    if (!posAttr) return;

    const array = posAttr.array as Float32Array;
    const timeOffset = t * 1.4;

    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] = (originalY[i] ?? 0) + Math.sin(timeOffset + (phases[i] ?? 0)) * 0.12;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} material={FIELD_MATERIAL}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
    </points>
  );
}
