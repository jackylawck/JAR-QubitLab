// src/components/BoothTwo.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { useState, useRef, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useQuantumStore } from '../store/quantumStore';
import { useLocaleStore } from '../store/localeStore';
import { sound } from '../audio/soundEngine';
import { acquireAnimationLock } from '../hooks/useAnimationLock';
import { PhaseDial } from './PhaseDial';
import { InterferenceBurst } from './InterferenceBurst';

export interface BoothTwoProps {
  pureVisual?: boolean;
}

export const BoothTwo = ({ pureVisual = false }: BoothTwoProps) => {
  const t = useLocaleStore((state) => state.t);

  const amplitudes = useQuantumStore((s) => s.amplitudes);
  const isSplit = useQuantumStore((s) => s.isSplit);
  const phaseAngle = useQuantumStore((s) => s.phaseAngle);
  const splitBoothTwo = useQuantumStore((s) => s.splitBoothTwo);
  const setPhaseAngle = useQuantumStore((s) => s.setPhaseAngle);
  const collideBoothTwo = useQuantumStore((s) => s.collideBoothTwo);
  // 🌟 移除 resetBoothTwo 訂閱

  const [isBusy, setIsBusy] = useState(false);
  const [burstConfig, setBurstConfig] = useState<any>(null);

  const timerRef = useRef<number | null>(null);
  const lockReleaseRef = useRef<(() => void) | null>(null);
  const burstReleaseRef = useRef<(() => void) | null>(null);

  const probA = (amplitudes[0]?.modulus ?? 0) ** 2;
  const probB = (amplitudes[2]?.modulus ?? 0) ** 2;

  const prevIsSplit = useRef(isSplit);
  
  useEffect(() => {
    if (prevIsSplit.current && !isSplit) {
      const pA = Math.cos(phaseAngle / 2) ** 2;
      const pB = Math.sin(phaseAngle / 2) ** 2;
      const diff = Math.abs(pA - pB);

      if (diff > 0.15) {
        const evaporateLeft = pA < pB;
        burstReleaseRef.current?.();
        burstReleaseRef.current = acquireAnimationLock();
        sound.playEvaporate();
        setBurstConfig({
          type: 'evaporate',
          position: evaporateLeft ? [-2, 0.8, 0] : [2, 0.8, 0],
        });
      }
    }
    prevIsSplit.current = isSplit;
  }, [isSplit, phaseAngle]);

  // 卸載防護：清除計時器
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      lockReleaseRef.current?.();
      burstReleaseRef.current?.();
    };
  }, []); // 🌟 移除對 resetBoothTwo 的依賴

  // ... (保留後續所有觸發邏輯與 3D 視圖渲染，完全一致) ...

  return ( /* ... */ );
};
