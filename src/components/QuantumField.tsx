// src/components/QuantumField.tsx
import { useMemo, useRef } from 'react'; 
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 🌟 全域零延遲生成「柔光圓形粒子」材質
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
    
    // 背景緩慢自轉
    pointsRef.current.rotation.y = t * 0.015;

    // 🌟 核心修復 1：屬性守衛 (Attribute Guard)
    // 確保 position 屬性存在，消滅 TS18048
    const posAttr = pointsRef.current.geometry.attributes.position;
    if (!posAttr) return; 

    const array = posAttr.array as Float32Array;

    // 🌟 核心修復 2：防禦性陣列存取 (Defensive Array Access)
    // 錨定原始 Y 坐標進行正弦微動，消滅 TS2532
    for (let i = 0; i < count; i++) {
      const idx = i * 3 + 1;
      
      const baseY = originalY[i] ?? 0;
      const phase = phases[i] ?? 0;

      array[idx] = baseY + Math.sin(t * 1.4 + phase) * 0.12;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
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
