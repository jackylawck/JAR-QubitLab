// src/components/BoothOne.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { useState, useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useQuantumStore } from '../store/quantumStore';
import { useLocaleStore } from '../store/localeStore';
import { sound } from '../audio/soundEngine';
import { acquireAnimationLock } from '../hooks/useAnimationLock';

// ... (保留 QubitCloud 與 useCursor，與上一版完全一致) ...
const useCursor = () => { /*...*/ return {}; };
const QubitCloud = (props: any) => { /*...Html 已修正為 -2.2...*/ return null; };

export interface BoothOneProps {
  pureVisual?: boolean;
}

export const BoothOne = ({ pureVisual = false }: BoothOneProps) => {
  const t = useLocaleStore((state) => state.t);
  
  const amplitudes = useQuantumStore((s) => s.amplitudes);
  const applyGate = useQuantumStore((s) => s.applyGate);
  const collapse = useQuantumStore((s) => s.collapse);
  // 🌟 移除 resetBoothOne 訂閱

  const [isCollapsing, setIsCollapsing] = useState(false);
  
  const collapseTimerRef = useRef<number | null>(null);
  const actionTimerRef = useRef<number | null>(null);
  const lockReleaseRef = useRef<(() => void) | null>(null);

  const leverCursor = useCursor();
  const shutterCursor = useCursor();

  const p0 = (amplitudes[0]?.modulus ?? 0) ** 2 + (amplitudes[1]?.modulus ?? 0) ** 2;
  const p1 = (amplitudes[2]?.modulus ?? 0) ** 2 + (amplitudes[3]?.modulus ?? 0) ** 2;
  const leftModulus = Math.sqrt(p0);
  const rightModulus = Math.sqrt(p1);

  // 此時 Component Mount 時，Store 已經被 App.tsx 重置為絕對乾淨的 |00⟩
  const prevProb = useRef({ p0, p1 });

  // 卸載防護：清除所有計時器
  useEffect(() => {
    return () => {
      if (collapseTimerRef.current !== null) clearTimeout(collapseTimerRef.current);
      if (actionTimerRef.current !== null) clearTimeout(actionTimerRef.current);
      lockReleaseRef.current?.();
    };
  }, []); // 🌟 移除對 resetBoothOne 的依賴

  // 狀態響應式動畫：邏輯極度簡化
  useEffect(() => {
    const wasMixed = prevProb.current.p0 > 0.1 && prevProb.current.p1 > 0.1;
    const isPure = p0 > 0.9 || p1 > 0.9;

    if (wasMixed && isPure) {
      setIsCollapsing(true);
      if (collapseTimerRef.current !== null) clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = window.setTimeout(() => {
        setIsCollapsing(false);
        collapseTimerRef.current = null;
      }, 300);
    }
    prevProb.current = { p0, p1 };
  }, [p0, p1]);

  // ... (保留 handleLeverClick 與 handleShutterClick) ...

  return (
    // ... (保留 3D 渲染，完全一致) ...
  );
};
