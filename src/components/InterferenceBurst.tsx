// src/components/InterferenceBurst.tsx
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface InterferenceBurstProps {
  type: 'evaporate' | 'merge' | null;
  position: [number, number, number];
  onComplete: () => void;
}

// 🌟 優化 1：全域零延遲生成「柔光圓形粒子」材質，徹底告別預設的粗糙方形點
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

  const data = useMemo(() => {
    if (!type) return null;

    const initPos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const isEvaporate = type === 'evaporate';
    const baseColor = isEvaporate ? new THREE.Color('#ec4899') : new THREE.Color('#38bdf8');

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      if (isEvaporate) {
        // Evaporate: 從微小球體表面散開
        const r = 0.1 + Math.random() * 0.2;
        initPos[idx] = Math.sin(phi) * Math.cos(theta) * r;
        initPos[idx + 1] = Math.sin(phi) * Math.sin(theta) * r;
        initPos[idx + 2] = Math.cos(phi) * r;

        const speed = 1.5 + Math.random() * 2;
        vel[idx] = Math.sin(phi) * Math.cos(theta) * speed;
        vel[idx + 1] = Math.abs(Math.sin(phi) * Math.sin(theta) * speed) + 1.2; // 初始向上速度
        vel[idx + 2] = Math.cos(phi) * speed;
      } else {
        // Merge: 從大半徑外圍生成，準備向內坍縮
        const r = 0.8 + Math.random() * 0.6;
        initPos[idx] = Math.sin(phi) * Math.cos(theta) * r;
        initPos[idx + 1] = Math.sin(phi) * Math.sin(theta) * r;
        initPos[idx + 2] = Math.cos(phi) * r;
      }

      col[idx] = baseColor.r;
      col[idx + 1] = baseColor.g;
      col[idx + 2] = baseColor.b;
    }

    return { initPos, vel, colors: col };
  }, [type]);

  // 複製一份 Float32Array 供每幀原地修改 (Zero-GC)
  const activePositions = useMemo(() => {
    return data ? new Float32Array(data.initPos) : null;
  }, [data]);

  useEffect(() => {
    progressRef.current = 0;
    completedRef.current = false;
  }, [type]);

  useFrame((_, delta) => {
    if (!type || !pointsRef.current || !data || completedRef.current) return;

    // 🌟 效能防護：防止切換網頁或休眠導致 delta 飆高，產生破圖
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

    // 🌟 優化 2：決定性物理學 (Deterministic Physics)
    // 徹底拋棄傳統 Euler += velocity 累加，改用 progress 絕對插值，杜絕掉幀誤差
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      if (type === 'evaporate') {
        const t = progress * 1.5;
        array[idx] = data.initPos[idx] + data.vel[idx] * t;
        // 賦予拋物線般的熱蒸發上升煙霧感
        array[idx + 1] = data.initPos[idx + 1] + data.vel[idx + 1] * t + (t * t * 1.5); 
        array[idx + 2] = data.initPos[idx + 2] + data.vel[idx + 2] * t;
      } else {
        // 相長凝聚：Ease-in 加速向中心坍縮
        const scale = 1 - Math.pow(progress, 2.5); 
        array[idx] = data.initPos[idx] * scale;
        array[idx + 1] = data.initPos[idx + 1] * scale;
        array[idx + 2] = data.initPos[idx + 2] * scale;
      }
    }
    posAttr.needsUpdate = true;

    if (materialRef.current) {
      const baseOpacity = type === 'evaporate' ? 0.9 : 0.7;
      // 蒸發的透明度下降更快，營造消散感
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
        map={PARTICLE_TEXTURE} // 🌟 掛載高質量圓形發光貼圖
        alphaTest={0.01}
      />
    </points>
  );
};
