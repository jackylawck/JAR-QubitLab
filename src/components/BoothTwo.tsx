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

  // 狀態管理
  const [isInterfering, setIsInterfering] = useState(false);
  const [burstType, setBurstType] = useState<'evaporate' | 'merge' | null>(null);

  // 動畫鎖與計時器參照 (對稱防禦架構)
  const dialTimerRef = useRef<number | null>(null);
  const mergeTimerRef = useRef<number | null>(null);
  
  const dialReleaseRef = useRef<(() => void) | null>(null);
  const mergeReleaseRef = useRef<(() => void) | null>(null);
  const burstReleaseRef = useRef<(() => void) | null>(null); // 專門接管粒子系統的渲染鎖

  // 卸載時安全釋放所有未完成的鎖與計時器
  useEffect(() => {
    return () => {
      if (dialTimerRef.current !== null) clearTimeout(dialTimerRef.current);
      if (mergeTimerRef.current !== null) clearTimeout(mergeTimerRef.current);
      dialReleaseRef.current?.();
      mergeReleaseRef.current?.();
      burstReleaseRef.current?.();
    };
  }, []);

  // 取得 q0 處於 |0⟩ 與 |1⟩ 的振幅參數 (Big-Endian: amplitudes[0] = |00⟩, amplitudes[2] = |10⟩)
  const amp0 = amplitudes[0] || { modulus: 0, phase: 0 };
  const amp1 = amplitudes[2] || { modulus: 0, phase: 0 };

  // 物理柱高平滑動態
  const { h0, h1, opacity0, opacity1 } = useSpring({
    h0: amp0.modulus * 2.5,
    h1: amp1.modulus * 2.5,
    opacity0: amp0.modulus > 0.05 ? 0.85 : 0.05,
    opacity1: amp1.modulus > 0.05 ? 0.85 : 0.05,
    config: { mass: 1, tension: 200, friction: 22 },
  });

  // 撥動相位舵盤：對 q0 施加 Z 門 (使 |1⟩ 分支產生 π 相位翻轉)
  const handleRotatePhase = () => {
    if (isInterfering) return;
    sound.playLever();
    applyGate('Z', [0]);

    dialReleaseRef.current?.();
    if (dialTimerRef.current !== null) clearTimeout(dialTimerRef.current);

    const release = acquireAnimationLock();
    dialReleaseRef.current = release;
    dialTimerRef.current = window.setTimeout(() => {
      release();
      dialReleaseRef.current = null;
      dialTimerRef.current = null;
    }, 450);
  };

  // 觸發干涉匯流對撞 (施加第二道 H 門)
  const handleCollide = () => {
    if (isInterfering) return;
    setIsInterfering(true);

    // 1. 釋放並重新獲取柱高形變與整體操作的動畫鎖
    mergeReleaseRef.current?.();
    if (mergeTimerRef.current !== null) clearTimeout(mergeTimerRef.current);
    const mergeRelease = acquireAnimationLock();
    mergeReleaseRef.current = mergeRelease;

    // 2. 判斷相長或相消干涉
    const phaseDiff = Math.abs(amp0.phase - amp1.phase);
    const isAntiPhase = Math.abs(phaseDiff - Math.PI) < 0.2;

    // 3. 接管粒子系統的動畫鎖，確保 frameloop="always" 貫穿粒子飛行週期
    burstReleaseRef.current?.();
    burstReleaseRef.current = acquireAnimationLock();

    if (isAntiPhase) {
      sound.playEvaporate();
      setBurstType('evaporate');
    } else {
      sound.playMerge();
      setBurstType('merge');
    }

    // 執行第二道 H 門，波函數疊加干涉
    applyGate('H', [0]);

    // 4. 形變彈簧恢復定時器 (600ms)
    mergeTimerRef.current = window.setTimeout(() => {
      setIsInterfering(false);
      mergeRelease();
      mergeReleaseRef.current = null;
      mergeTimerRef.current = null;
    }, 600);
  };

  // 粒子生命週期結束回調：釋放粒子動畫鎖
  const handleBurstComplete = () => {
    setBurstType(null);
    burstReleaseRef.current?.();
    burstReleaseRef.current = null;
  };

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 8, 4]} intensity={1.2} />

      {/* 展台大底座 */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[9, 0.8, 5]} />
        <meshStandardMaterial color="#111118" roughness={0.8} />
      </mesh>

      {/* 匯流金屬軌道 */}
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
            color={Math.abs(amp1.phase - Math.PI) < 0.2 ? '#ec4899' : '#38bdf8'}
            emissive={Math.abs(amp1.phase - Math.PI) < 0.2 ? '#ec4899' : '#38bdf8'}
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

      {/* 粒子爆發特效：掛載於右柱對撞點 */}
      <InterferenceBurst
        type={burstType}
        position={[burstType === 'evaporate' ? 2 : -2, 0.8, 0]}
        onComplete={handleBurstComplete}
      />

      {/* 相位舵盤 */}
      <PhaseDial
        phase={amp1.phase}
        onRotatePhase={handleRotatePhase}
        disabled={isInterfering}
      />

      {/* 干涉匯流按鈕 */}
      <group
        position={[0, 0.1, -1.2]}
        onClick={handleCollide}
        onPointerOver={() => {
          if (!isInterfering) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.6, 0.7, 0.3, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.1, 32]} />
          <meshStandardMaterial
            color="#f59e0b"
            metalness={0.5}
            roughness={0.2}
            emissive="#f59e0b"
            emissiveIntensity={0.4}
          />
        </mesh>
        <Html position={[0, 0.9, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="bg-amber-950/80 text-amber-200 border border-amber-500/40 px-3 py-1 rounded select-none whitespace-nowrap text-xs font-bold shadow-lg">
            ⚡ 匯流對撞 (Interfere / 2nd H-Gate)
          </div>
        </Html>
      </group>
    </group>
  );
};
