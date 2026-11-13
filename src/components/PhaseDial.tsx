// src/components/PhaseDial.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Theme: EVA-02 Phase Dial (Red to Yellow)
 */
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useLocaleStore } from '../store/localeStore';

interface PhaseDialProps {
  phase: number;
  onPhaseChange: (newPhase: number) => void;
  disabled: boolean;
  isStandby: boolean;
}

// 虛擬水平幾何投影面 (對應舵盤高度 Y = 0.15)
const DIAL_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.15);
const INTERSECT_POINT = new THREE.Vector3();
const NDC_VEC = new THREE.Vector2();

// 🌟 Zero-GC 幾何體與靜態材質緩存
const SHARED_GEOMETRY = {
  base: new THREE.CylinderGeometry(0.9, 1.0, 0.1, 32),
  ring: new THREE.RingGeometry(0.65, 0.75, 48),
  pointerHub: new THREE.CylinderGeometry(0.15, 0.15, 0.15, 16),
  pointerCone: new THREE.ConeGeometry(0.12, 0.45, 16),
};

const SHARED_MATERIALS = {
  base: new THREE.MeshStandardMaterial({ color: '#111827', metalness: 0.6, roughness: 0.4 }),
  pointerHub: new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.8, roughness: 0.2 }),
};

export const PhaseDial = ({ phase, onPhaseChange, disabled, isStandby }: PhaseDialProps) => {
  const t = useLocaleStore((state) => state.t);
  const [isDragging, setIsDragging] = useState(false);
  const lastSnap = useRef<number | null>(null);
  const { camera, gl, raycaster } = useThree();

  // 🌟 EVA-02 主題配色：同相 (0) 為深紅，反相 (π) 為亮黃
  const RED = useMemo(() => new THREE.Color('#dc2626'), []);
  const YELLOW = useMemo(() => new THREE.Color('#facc15'), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  const triggerHaptic = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(pattern);
    }
  }, []);

  // 快取最新的 onPhaseChange 引用，消除拖曳時頻繁綁定/解綁 window 事件的 GC 開銷
  const onPhaseChangeRef = useRef(onPhaseChange);
  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
  }, [onPhaseChange]);

  // 全域 Pointer 事件：即便滑鼠/手指拖出舵盤網格，在整個視窗內仍保持平滑解算
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMove = (e: PointerEvent) => {
      // 防範快速點擊導致 onPointerUp 遺失，未按壓時直接釋放
      if (e.buttons === 0) {
        setIsDragging(false);
        lastSnap.current = null;
        document.body.style.cursor = 'auto';
        return;
      }

      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();

      // 轉換螢幕坐標為標準化設備坐標 (NDC)
      NDC_VEC.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycaster.setFromCamera(NDC_VEC, camera);

      if (raycaster.ray.intersectPlane(DIAL_PLANE, INTERSECT_POINT)) {
        const dx = INTERSECT_POINT.x;
        const dz = INTERSECT_POINT.z - 1.8; // 舵盤中心在 Z = 1.8

        let rad = Math.atan2(dx, -dz);
        if (rad < 0) rad += 2 * Math.PI;

        // 0 與 π 的機械卡榫吸附
        const snaps = [0, Math.PI, 2 * Math.PI];
        for (const s of snaps) {
          if (Math.abs(rad - s) < 0.08) {
            if (lastSnap.current !== s) {
              lastSnap.current = s;
              triggerHaptic([20, 30, 20]); // 增強吸附手感
            }
            rad = s % (2 * Math.PI);
            break;
          }
        }
        if (lastSnap.current !== null && Math.abs(rad - lastSnap.current) >= 0.12) {
          lastSnap.current = null;
        }

        onPhaseChangeRef.current(rad);
      }
    };

    const handleGlobalUp = () => {
      setIsDragging(false);
      lastSnap.current = null;
      document.body.style.cursor = 'auto';
    };

    window.addEventListener('pointermove', handleGlobalMove);
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('pointercancel', handleGlobalUp);

    return () => {
      window.removeEventListener('pointermove', handleGlobalMove);
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('pointercancel', handleGlobalUp);
    };
  }, [isDragging, gl, camera, raycaster, triggerHaptic]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (disabled || isStandby) return;
    e.stopPropagation();
    setIsDragging(true);
    triggerHaptic(15);
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerOver = () => {
    if (!disabled && !isStandby && !isDragging) {
      document.body.style.cursor = 'grab';
    }
  };

  const handlePointerOut = () => {
    if (!isDragging) {
      document.body.style.cursor = 'auto';
    }
  };

  // 🌟 EVA-02 顏色隨相位在深紅 (0) 與亮黃 (π) 之間平滑漸變
  const tRatio = Math.abs(Math.sin(phase / 2));
  const dialColor = isStandby 
    ? '#64748b' 
    : tmpColor.lerpColors(RED, YELLOW, tRatio).getStyle();

  const degText = Math.round((phase * 180) / Math.PI);

  return (
    <group 
      position={[0, 0, 1.8]} 
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* 舵盤底座 */}
      <mesh position={[0, 0.05, 0]} geometry={SHARED_GEOMETRY.base} material={SHARED_MATERIALS.base} dispose={null} />

      {/* 連續動態發光刻度環 */}
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={SHARED_GEOMETRY.ring} dispose={null}>
        <meshBasicMaterial color={dialColor} toneMapped={false} />
      </mesh>

      {/* 動態幾何指針 */}
      <group position={[0, 0.15, 0]} rotation={[0, -phase, 0]}>
        <mesh geometry={SHARED_GEOMETRY.pointerHub} material={SHARED_MATERIALS.pointerHub} dispose={null} />
        
        <mesh position={[0, 0, -0.48]} rotation={[-Math.PI / 2, 0, 0]} geometry={SHARED_GEOMETRY.pointerCone} dispose={null}>
          <meshStandardMaterial
            color={dialColor}
            emissive={dialColor}
            emissiveIntensity={isStandby ? 0 : 0.9}
          />
        </mesh>
      </group>

      <Html position={[0, -0.4, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`px-3 py-1 rounded border select-none whitespace-nowrap text-xs flex items-center gap-1.5 shadow-lg ${
          isStandby 
            ? 'bg-slate-900/80 text-slate-400 border-slate-700/50' 
            : 'bg-black/85 text-white border-white/20'
        }`}>
          <span>🧭 {t.common.phaseShift}</span>
          <span className={`font-mono font-bold ${!isStandby && degText === 180 ? 'text-yellow-400' : !isStandby && degText === 0 ? 'text-red-400' : ''}`}>
            {isStandby ? t.common.standby : `${degText}° (${phase.toFixed(2)} rad)`}
          </span>
        </div>
      </Html>
    </group>
  );
};
