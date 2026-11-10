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
  const materialRef = useRef<THREE.PointsMaterial>(null);
  
  const progressRef = useRef(0);
  const completedRef = useRef(false); // 防堵 onComplete 在動畫結束時被每幀重複觸發
  
  const count = 60; // 輕量化粒子數量，適配手機效能

  const data = useMemo(() => {
    // 防堵 type 為 null 時浪費記憶體建立無用陣列
    if (!type) return null;

    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const isEvaporate = type === 'evaporate';
    const baseColor = isEvaporate ? new THREE.Color('#ec4899') : new THREE.Color('#38bdf8');

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const speed = isEvaporate ? 1.5 + Math.random() * 2 : 2.5 + Math.random();

      vel[idx] = Math.sin(phi) * Math.cos(theta) * speed;
      // 蒸發時添加向上飄的偏置力
      vel[idx + 1] = isEvaporate ? Math.abs(Math.sin(phi) * Math.sin(theta) * speed) + 1.2 : Math.cos(phi) * speed;
      vel[idx + 2] = Math.cos(phi) * speed;

      // merge 從外圍向中心凝聚，evaporate 從微小球體表面散開
      if (!isEvaporate) {
        pos[idx] = -vel[idx] * 0.4;
        pos[idx + 1] = -vel[idx + 1] * 0.4;
        pos[idx + 2] = -vel[idx + 2] * 0.4;
      } else {
        const initialRadius = 0.1 + Math.random() * 0.2; // 讓粒子從一個小球體表面爆開，而非單點
        pos[idx] = Math.sin(phi) * Math.cos(theta) * initialRadius;
        pos[idx + 1] = Math.sin(phi) * Math.sin(theta) * initialRadius;
        pos[idx + 2] = Math.cos(phi) * initialRadius;
      }

      col[idx] = baseColor.r;
      col[idx + 1] = baseColor.g;
      col[idx + 2] = baseColor.b;
    }

    return { positions: pos, velocities: vel, colors: col };
  }, [type]);

  useEffect(() => {
    progressRef.current = 0;
    completedRef.current = false;
  }, [type]);

  useFrame((_, delta) => {
    // 確保 data 存在且動畫尚未完成
    if (!type || !pointsRef.current || !data || completedRef.current) return;

    progressRef.current += delta * 2.2;
    const progress = progressRef.current;

    if (progress >= 1.0) {
      completedRef.current = true;
      onComplete();
      return;
    }

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      if (type === 'evaporate') {
        array[idx] += data.velocities[idx] * delta;
        array[idx + 1] += data.velocities[idx + 1] * delta;
        array[idx + 2] += data.velocities[idx + 2] * delta;
      } else {
        // 相長凝聚：越接近中心速度越慢，產生引力吸收束感
        const slowdown = 1 - progress; 
        array[idx] += data.velocities[idx] * delta * 0.9 * slowdown;
        array[idx + 1] += data.velocities[idx + 1] * delta * 0.9 * slowdown;
        array[idx + 2] += data.velocities[idx + 2] * delta * 0.9 * slowdown;
      }
    }
    posAttr.needsUpdate = true;

    // 動態衰減透明度，使粒子自然消散而非到達進度 1.0 時生硬截斷消失
    if (materialRef.current) {
      const baseOpacity = type === 'evaporate' ? 0.9 : 0.7;
      materialRef.current.opacity = baseOpacity * (1 - progress);
    }
  });

  // 如果 type 為 null 或 data 尚未生成，則不渲染實體
  if (!type || !data) return null;

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[data.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.12}
        vertexColors
        transparent
        // 給定初始透明度，防堵第一幀畫面中 materialRef 還沒被覆寫前產生的 opacity=1.0 微閃爍
        opacity={type === 'evaporate' ? 0.9 : 0.7} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
