// src/components/BoothTwo.tsx
import { useState, useRef, useEffect } from 'react';
import { Text, Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useQuantumStore } from '../store/quantumStore';
import { sound } from '../audio/soundEngine';
import { FONT_MATH_PATH } from '../constants';
import { acquireAnimationLock } from '../hooks/useAnimationLock';
import { PhaseDial } from './PhaseDial';
import { InterferenceBurst } from './InterferenceBurst';

export const BoothTwo = () => {
  const amplitudes = useQuantumStore((state) => state.amplitudes);
  const applyGate = useQuantumStore((state) => state.applyGate);
  const reset = useQuantumStore((state) => state.reset);

  // 實驗光路狀態機：未分光 (false) -> 已分光 (true)
  const [isSplit, setIsSplit] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  // 粒子特效狀態
  const [burstConfig, setBurstConfig] = useState<{
    type: 'evaporate' | 'merge';
    position: [number, number, number];
  } | null>(null);

  // 動畫鎖與計時器管理
  const timerRef = useRef<number | null>(null);
  const lockReleaseRef = useRef<(() => void) | null>(null);
  const burstReleaseRef = useRef<(() => void) | null>(null);

  // 進入展台時強制重置為乾淨的 |00⟩ 基態
  useEffect(() => {
    reset();
    setIsSplit(false);

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      lockReleaseRef.current?.();
      burstReleaseRef.current?.();
    };
  }, [reset]);

  // q0 的物理振幅 (Big-Endian: amplitudes[0] = |00⟩, amplitudes[2] = |10⟩)
  const amp0 = amplitudes[0] || { modulus: 0, phase: 0 };
  const amp1 = amplitudes[2] || { modulus: 0, phase: 0 };

  // 兩柱高度與不透明度彈簧
  const { h0, h1, opacity0, opacity1 } = useSpring({
    h0: amp0.modulus * 2.5,
    h1: amp1.modulus * 2.5,
    opacity0: amp0.modulus > 0.05 ? (amp0.modulus > 0.9 ? 1.0 : 0.8) : 0.05,
    opacity1: amp1.modulus > 0.05 ? (amp1.modulus > 0.9 ? 1.0 : 0.8) : 0.05,
    config: { mass: 1, tension: 200, friction: 22 },
  });

  // 工具：安全獲取渲染鎖
  const triggerAnimation = (duration: number) => {
    lockReleaseRef.current?.();
    if (timerRef.current !== null) clearTimeout(timerRef.current);

    const release = acquireAnimationLock();
    lockReleaseRef.current = release;
    setIsBusy(true);

    timerRef.current = window.setTimeout(() => {
      setIsBusy(false);
      release();
      lockReleaseRef.current = null;
      timerRef.current = null;
    }, duration);
  };

  // Step 1: 第一道分光 (H 門)
  const handleSplit = () => {
    if (isBusy || isSplit) return;
    sound.playLever();
    applyGate('H', [0]); // |00⟩ -> (|00⟩ + |10⟩)/√2
    setIsSplit(true);
    triggerAnimation(450);
  };

  // Step 2: 相位翻轉 (Z 門)
  const handleRotatePhase = () => {
    if (isBusy || !isSplit) return;
    sound.playLever();
    applyGate('Z', [0]); // (|00⟩ + |10⟩)/√2 -> (|00⟩ - |10⟩)/√2
    triggerAnimation(400);
  };

  // Step 3: 匯流對撞 (第二道 H 門，產生干涉搬運)
  const handleCollide = () => {
    if (isBusy || !isSplit) return;

    // 判斷當前相對相位
    const isAntiPhase = Math.abs(amp1.phase - Math.PI) < 0.2;

    // 接管粒子系統的渲染鎖
    burstReleaseRef.current?.();
    burstReleaseRef.current = acquireAnimationLock();

    if (isAntiPhase) {
      // 反相 (π)：左側 Path A 相消蒸發歸零，能量完全匯入右側 Path B (1.0)
      sound.playEvaporate();
      setBurstConfig({
        type: 'evaporate',
        position: [-2, 0.8, 0], // 粒子在相消的左柱 (Path A) 蒸發散逸
      });
    } else {
      // 同相 (0)：右側 Path B 相消蒸發歸零，能量完全匯入左側 Path A (1.0)
      sound.playMerge();
      setBurstConfig({
        type: 'evaporate',
        position: [2, 0.8, 0], // 粒子在相消的右柱 (Path B) 蒸發散逸
      });
    }

    applyGate('H', [0]); // 執行波動疊加演化
    setIsSplit(false);   // 匯流完成，結束本次干涉循環
    triggerAnimation(600);
  };

  const handleBurstComplete = () => {
    setBurstConfig(null);
    burstReleaseRef.current?.();
    burstReleaseRef.current = null;
  };

  const isOppositePhase = Math.abs(amp1.phase - Math.PI) < 0.2;

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 8, 4]} intensity={1.2} />

      {/* 展台大底座 */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[9, 0.8, 5]} />
        <meshStandardMaterial color="#111118" roughness={0.8} />
      </mesh>

      {/* 匯流光導金屬軌道 */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[5, 0.08, 0.4]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 左柱：Path A (|0⟩) */}
      <a.group position={[-2, 0, 0]}>
        <a.mesh position-y={h0.to((h) => h / 2)}>
          <cylinderGeometry args={[0.45, 0.45, 1, 32]} />
          <a.meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.6}
            transparent
            opacity={opacity0}
            roughness={0.2}
          />
        </a.mesh>
        <Text position={[0, -0.4, 0.6]} fontSize={0.28} color="white" font={FONT_MATH_PATH}>
          Path A (|0⟩)
        </Text>
      </a.group>

      {/* 右柱：Path B (|1⟩) (隨相位顯示天藍或粉紫) */}
      <a.group position={[2, 0, 0]}>
        <a.mesh position-y={h1.to((h) => h / 2)}>
          <cylinderGeometry args={[0.45, 0.45, 1, 32]} />
          <a.meshStandardMaterial
            color={isSplit && isOppositePhase ? '#ec4899' : '#38bdf8'}
            emissive={isSplit && isOppositePhase ? '#ec4899' : '#38bdf8'}
            emissiveIntensity={0.6}
            transparent
            opacity={opacity1}
            roughness={0.2}
          />
        </a.mesh>
        <Text position={[0, -0.4, 0.6]} fontSize={0.28} color="white" font={FONT_MATH_PATH}>
          Path B (|1⟩)
        </Text>
      </a.group>

      {/* 蒸發粒子系統：精確定位在被相消清零的柱體位置 */}
      {burstConfig && (
        <InterferenceBurst
          type={burstConfig.type}
          position={burstConfig.position}
          onComplete={handleBurstComplete}
        />
      )}

      {/* 1. 分光桿 (Step 1: H-Gate) */}
      <group
        position={[-3.2, 0.1, 1.2]}
        onClick={handleSplit}
        onPointerOver={() => {
          if (!isBusy && !isSplit) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.25, 0.3, 0.3, 16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial 
            color={!isSplit ? '#38bdf8' : '#64748b'} 
            emissive={!isSplit ? '#38bdf8' : '#000'}
            emissiveIntensity={0.5} 
          />
        </mesh>
        <Html position={[0, -0.4, 0]} center style={{ pointerEvents: 'none' }}>
          <div className={`px-2.5 py-1 rounded text-xs select-none whitespace-nowrap shadow-md border ${
            !isSplit 
              ? 'bg-blue-950/80 text-blue-200 border-blue-500/40 animate-pulse' 
              : 'bg-black/50 text-gray-500 border-gray-700/30'
          }`}>
            ① 撥動分光 (H)
          </div>
        </Html>
      </group>

      {/* 2. 相位舵盤 (Step 2: Z-Gate) */}
      <PhaseDial
        phase={amp1.phase}
        onRotatePhase={handleRotatePhase}
        disabled={isBusy || !isSplit}
        isStandby={!isSplit}
      />

      {/* 3. 匯流對撞按鈕 (Step 3: 2nd H-Gate) */}
      <group
        position={[3.2, 0.1, 1.2]}
        onClick={handleCollide}
        onPointerOver={() => {
          if (!isBusy && isSplit) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.35, 0.45, 0.3, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.1, 32]} />
          <meshStandardMaterial
            color={isSplit ? '#f59e0b' : '#64748b'}
            metalness={0.5}
            roughness={0.2}
            emissive={isSplit ? '#f59e0b' : '#000'}
            emissiveIntensity={isSplit ? 0.6 : 0}
          />
        </mesh>
        <Html position={[0, -0.4, 0]} center style={{ pointerEvents: 'none' }}>
          <div className={`px-2.5 py-1 rounded text-xs select-none whitespace-nowrap shadow-md border ${
            isSplit 
              ? 'bg-amber-950/80 text-amber-200 border-amber-500/40 font-bold animate-pulse' 
              : 'bg-black/50 text-gray-500 border-gray-700/30'
          }`}>
            ③ 匯流對撞 (Interfere)
          </div>
        </Html>
      </group>
    </group>
  );
};
