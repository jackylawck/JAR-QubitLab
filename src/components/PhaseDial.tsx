// src/components/PhaseDial.tsx
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

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

export const PhaseDial = ({ phase, onPhaseChange, disabled, isStandby }: PhaseDialProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const lastSnap = useRef<number | null>(null);
  const { camera, gl, raycaster } = useThree();

  const BLUE = useMemo(() => new THREE.Color('#38bdf8'), []);
  const PINK = useMemo(() => new THREE.Color('#ec4899'), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  const triggerHaptic = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(pattern);
    }
  }, []);

  // 🌟 Latest Ref Pattern：快取最新的 onPhaseChange 引用，消除拖曳時頻繁綁定/解綁 window 事件的 GC 開銷
  const onPhaseChangeRef = useRef(onPhaseChange);
  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
  }, [onPhaseChange]);

  // 🌟 全域 Pointer 事件：即便滑鼠/手指拖出舵盤網格，在整個視窗內仍保持平滑解算
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMove = (e: PointerEvent) => {
      // 防範快速點擊導致 onPointerUp 遺失，未按壓時直接釋放
      if (e.buttons === 0) {
        setIsDragging(false);
        lastSnap.current = null;
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
              triggerHaptic([15, 20, 15]);
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
    };

    window.addEventListener('pointermove', handleGlobalMove);
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('pointercancel', handleGlobalUp);

    return () => {
      window.removeEventListener('pointermove', handleGlobalMove);
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('pointercancel', handleGlobalUp);
    };
  }, [isDragging, gl, camera, raycaster, triggerHaptic]); // 移除 onPhaseChange 依賴

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (disabled || isStandby) return;
    e.stopPropagation();
    setIsDragging(true);
    triggerHaptic(12);
  };

  // 顏色隨相位在天藍 (0) 與洋紅 (π) 之間平滑漸變
  const t = Math.abs(Math.sin(phase / 2));
  const dialColor = isStandby 
    ? '#64748b' 
    : tmpColor.lerpColors(BLUE, PINK, t).getStyle();

  const degText = Math.round((phase * 180) / Math.PI);

  return (
    <group position={[0, 0, 1.8]} onPointerDown={handlePointerDown}>
      {/* 舵盤底座 */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.9, 1.0, 0.1, 32]} />
        <meshStandardMaterial color="#1e1e2d" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 連續動態發光刻度環 */}
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.65, 0.75, 48]} />
        <meshBasicMaterial color={dialColor} toneMapped={false} />
      </mesh>

      {/* 動態幾何指針（直接跟隨連續 phase 角度旋轉，移除舊版 useSpring） */}
      <group position={[0, 0.15, 0]} rotation={[0, -phase, 0]}>
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.12, 0.4, 16]} />
          <meshStandardMaterial
            color={dialColor}
            emissive={dialColor}
            emissiveIntensity={isStandby ? 0 : 0.8}
          />
        </mesh>
      </group>

      <Html position={[0, -0.4, 0]} center style={{ pointerEvents: 'none' }}>
        <div className={`px-3 py-1 rounded border select-none whitespace-nowrap text-xs flex items-center gap-1.5 shadow-lg ${
          isStandby 
            ? 'bg-slate-900/80 text-slate-400 border-slate-700/50' 
            : 'bg-black/85 text-white border-white/20'
        }`}>
          <span>🧭 連續相移 P(ϕ)</span>
          <span className="font-mono font-bold">
            {isStandby ? '待機 (需先分光)' : `${degText}° (${phase.toFixed(2)} rad)`}
          </span>
        </div>
      </Html>
    </group>
  );
};
