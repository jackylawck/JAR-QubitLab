// src/components/InterferenceBurst.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Theme: EVA-02 Interference Effects (Red & Yellow)
 */
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface InterferenceBurstProps {
  type: 'evaporate' | 'merge' | null;
  position: [number, number, number];
  onComplete: () => void;
}

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

export const InterferenceBurst = ({ type, position, onComplete }: InterferenceBurstProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  
  const progressRef = useRef(0);
  const completedRef = useRef(false);
  
  const count = 60; // 輕量化適配手機

  // 🌟 EVA-02 主題粒子計算
  const data = useMemo(() => {
    if (!type) return null;

    const initPos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const isEvaporate = type === 'evaporate';
    
    // 定義混合顏色池
    const c1 = new THREE.Color();
    const c2 = new THREE.Color();
    const finalColor = new THREE.Color();

    if (isEvaporate) {
      // 蒸發 (反相抵消)：二號機亮黃火花 混合 微弱明日香紅
      c1.set('#facc15'); // Yellow-400
      c2.set('#ef4444'); // Red-500
    } else {
      // 融合 (同相疊加)：二號機裝甲深紅 混合 高能亮橙
      c1.set('#dc2626'); // Red-600
      c2.set('#f97316'); // Orange-500
    }

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      if (isEvaporate) {
        // 蒸發：向外噴射火花
        const r = 0.1 + Math.random() * 0.2;
        initPos[idx] = Math.sin(phi) * Math.cos(theta) * r;
        initPos[idx + 1] = Math.sin(phi) * Math.sin(theta) * r;
        initPos[idx + 2] = Math.cos(phi) * r;

        const speed = 1.5 + Math.random() * 2;
        vel[idx] = Math.sin(phi) * Math.cos(theta) * speed;
        vel[idx + 1] = Math.abs(Math.sin(phi) * Math.sin(theta) * speed) + 1.2; 
        vel[idx + 2] = Math.cos(phi) * speed;
      } else {
        // 融合：由外向內匯聚
        const r = 0.8 + Math.random() * 0.6;
        initPos[idx] = Math.sin(phi) * Math.cos(theta) * r;
        initPos[idx + 1] = Math.sin(phi) * Math.sin(theta) * r;
        initPos[idx + 2] = Math.cos(phi) * r;
      }

      // 對每顆粒子進行顏色混合 (Lerp) 以增加層次感
      finalColor.lerpColors(c1, c2, Math.random());
      col[idx] = finalColor.r;
      col[idx + 1] = finalColor.g;
      col[idx + 2] = finalColor.b;
    }

    return { initPos, vel, colors: col };
  }, [type]);

  const activePositions = useMemo(() => {
    return data ? new Float32Array(data.initPos) : null;
  }, [data]);

  useEffect(() => {
    progressRef.current = 0;
    completedRef.current = false;
  }, [type]);

  useFrame((_, delta) => {
    if (!type || !pointsRef.current || !data || completedRef.current) return;

    const safeDelta = Math.min(delta, 0.1); 
    progressRef.current += safeDelta * 2.2;
    const progress = Math.min(progressRef.current, 1.0);

    if (progress >= 1.0) {
      completedRef.current = true;
      onComplete();
      return;
    }

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    // 🌟 陣列越界防護 (Defensive Array Access)
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      
      const initX = data.initPos[idx] ?? 0;
      const initY = data.initPos[idx + 1] ?? 0;
      const initZ = data.initPos[idx + 2] ?? 0;

      if (type === 'evaporate') {
        const t = progress * 1.5;
        const velX = data.vel[idx] ?? 0;
        const velY = data.vel[idx + 1] ?? 0;
        const velZ = data.vel[idx + 2] ?? 0;

        array[idx] = initX + velX * t;
        array[idx + 1] = initY + velY * t + (t * t * 1.5); 
        array[idx + 2] = initZ + velZ * t;
      } else {
        const scale = 1 - Math.pow(progress, 2.5); 
        array[idx] = initX * scale;
        array[idx + 1] = initY * scale;
        array[idx + 2] = initZ * scale;
      }
    }
    posAttr.needsUpdate = true;

    if (materialRef.current) {
      const baseOpacity = type === 'evaporate' ? 0.9 : 0.7;
      const fadeCurve = type === 'evaporate' ? Math.pow(1 - progress, 1.5) : (1 - progress);
      materialRef.current.opacity = baseOpacity * fadeCurve;
    }
  });

  if (!type || !data || !activePositions) return null;

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[activePositions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[data.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.15}
        vertexColors
        transparent
        opacity={type === 'evaporate' ? 0.9 : 0.7} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        map={PARTICLE_TEXTURE}
        alphaTest={0.01}
      />
    </points>
  );
};
