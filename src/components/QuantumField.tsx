// src/components/QuantumField.tsx
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

export function QuantumField({ count = 500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

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
    if (!posAttr) return; 

    const array = posAttr.array as Float32Array;

    // 🌟 優化 1：提取不變量，省下迴圈內的重複乘法
    const timeOffset = t * 1.4;

    // 🌟 優化 2：消滅 ?? 分支。Float32Array 內必定有值，用 ! 滿足 TS 即可
    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] = originalY[i]! + Math.sin(timeOffset + phases[i]!) * 0.12;
    }
    
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        {/* 🌟 優化 3：明確標示 DynamicDrawUsage，提升 WebGL CPU->GPU 資料傳輸效能 */}
        <bufferAttribute 
          attach="attributes-position" 
          args={[positions, 3]} 
          usage={THREE.DynamicDrawUsage} 
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16} 
        color="#38bdf8"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        map={PARTICLE_TEXTURE} 
        toneMapped={false}     
      />
    </points>
  );
}
