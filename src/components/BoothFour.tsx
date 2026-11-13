// src/components/BoothFour.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Theme: EVA-00 (Amber Orange) -> EVA-00' (Cobalt Blue) Soul Transfer
 */
import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useTeleportStore } from '../store/teleportStore';

const ALICE_POSITIONS: [number, number, number][] = [
  [-1, 0, 1],
  [-1, 0, -1],
  [1, 0, 1],
  [1, 0, -1],
];

const BOB_POSITIONS: [number, number, number][] = [
  [-0.4, 0, 0.8],
  [0.4, 0, -0.8],
];

export function BoothFour() {
  const phase = useTeleportStore((s) => s.phase);
  const aliceTheta = useTeleportStore((s) => s.aliceTheta);
  const classicalBits = useTeleportStore((s) => s.classicalBits);
  const lastUserBits = useTeleportStore((s) => s.lastUserBits);

  // 計算目標態與 Alice/Bob 物理振幅高度（範圍 0.05 ~ 1.8）
  const { aliceHeights, bobHeights, ghostHeights } = useMemo(() => {
    const c = Math.cos(aliceTheta / 2);
    const s = Math.sin(aliceTheta / 2);
    const target0 = Math.max(c * 1.8, 0.05);
    const target1 = Math.max(s * 1.8, 0.05);

    // 1. Alice 端：準備與糾纏階段呈現疊加態分佈；測量後坍縮至唯一貝爾基分量（不可克隆定理）
    let aHeights: [number, number, number, number];
    if (phase === 'prepare' || phase === 'measure') {
      aHeights = [
        Math.max(c * 1.35, 0.12),
        Math.max(s * 1.35, 0.12),
        Math.max(s * 1.35, 0.12),
        Math.max(c * 1.35, 0.12),
      ];
    } else {
      const measuredIdx = classicalBits ?? 0;
      aHeights = [
        measuredIdx === 0 ? 1.85 : 0.04,
        measuredIdx === 1 ? 1.85 : 0.04,
        measuredIdx === 2 ? 1.85 : 0.04,
        measuredIdx === 3 ? 1.85 : 0.04,
      ];
    }

    // 2. Bob 端：依測量結果與使用者施加的修正閘計算當前量子態高度
    let b0 = 0.9;
    let b1 = 0.9;
    if (phase === 'correct' && classicalBits !== null) {
      const needsX = classicalBits === 1 || classicalBits === 3;
      b0 = needsX ? target1 : target0;
      b1 = needsX ? target0 : target1;
    } else if (phase === 'success') {
      b0 = target0;
      b1 = target1;
    } else if (phase === 'failed' && classicalBits !== null && lastUserBits !== null) {
      const residual = classicalBits ^ lastUserBits;
      const needsX = residual === 1 || residual === 3;
      b0 = needsX ? target1 : target0;
      b1 = needsX ? target0 : target1;
    }

    return {
      aliceHeights: aHeights,
      bobHeights: [b0, b1] as const,
      ghostHeights: [target0, target1] as const,
    };
  }, [phase, aliceTheta, classicalBits, lastUserBits]);

  // 🌟 Zero-GC 預分配：EVA-00 雙機型態與綾波麗靈魂光球專屬幾何與材質
  const resources = useMemo(() => {
    const cyl = new THREE.CylinderGeometry(0.32, 0.32, 1, 32);
    cyl.translate(0, 0.5, 0);

    const spineGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 16, 24);

    return {
      pillarGeo: cyl,
      ringGeo: new THREE.CircleGeometry(0.42, 32),
      spineGeo,
      packetGeo: new THREE.SphereGeometry(0.2, 24, 24),
      hoopGeo: new THREE.TorusGeometry(0.36, 0.028, 16, 32),
      eyeGeo: new THREE.SphereGeometry(0.052, 16, 16),

      baseMat: new THREE.MeshStandardMaterial({ color: '#090a0f', roughness: 0.8 }),

      // 純白裝甲邊框材質（代替銀色，還原兩代零號機的純白護甲線條）
      whiteArmorMat: new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#e2e8f0',
        emissiveIntensity: 0.25,
        roughness: 0.2,
        metalness: 0.1,
      }),
      whiteBaseRingMat: new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      }),

      // 兩代零號機共通的標誌性「單眼紅點 (Red Mono-Eye)」
      redEyeMat: new THREE.MeshBasicMaterial({
        color: '#ef4444',
        toneMapped: false,
      }),

      // Alice 端：初期零號機 EVA-00 (山吹橙裝甲 + 純白護甲邊 + 單眼紅點)
      alicePillarMat: new THREE.MeshStandardMaterial({
        color: '#f97316',
        emissive: '#ea580c',
        emissiveIntensity: 0.75,
        toneMapped: false,
        transparent: true,
        opacity: 0.92,
        roughness: 0.2,
        metalness: 0.1,
      }),

      // 中間通道：Terminal Dogma 骨骼白脊椎導管 + 螢光綠校驗環 + 綾波麗靈魂粉藍光球
      spineMat: new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.5,
        metalness: 0.2,
      }),
      dnaRingMat: new THREE.MeshBasicMaterial({
        color: '#22c55e',
        transparent: true,
        opacity: 0.75,
        toneMapped: false,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
      soulPacketMat: new THREE.MeshStandardMaterial({
        color: '#bae6fd', // 聖潔發光粉藍（綾波麗靈魂光輝）
        emissive: '#38bdf8',
        emissiveIntensity: 1.15,
        toneMapped: false,
        transparent: true,
        opacity: 0.95,
        roughness: 0.1,
      }),

      // Bob 端：零號機改 EVA-00' (高飽和深鈷藍 + 純白護甲邊 + 單眼紅點) + 透明培養槽
      bobPillarMat: new THREE.MeshStandardMaterial({
        color: '#1d4ed8',
        emissive: '#1e40af',
        emissiveIntensity: 0.9,
        toneMapped: false,
        transparent: true,
        opacity: 0.92,
        roughness: 0.2,
        metalness: 0.15,
      }),
      bobTankMat: new THREE.MeshPhysicalMaterial({
        color: '#e0f2fe',
        transparent: true,
        opacity: 0.24,
        transmission: 0.75,
        roughness: 0.1,
        metalness: 0.1,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(resources).forEach((res) => {
        if (typeof res.dispose === 'function') res.dispose();
      });
    };
  }, [resources]);

  // 粉藍靈魂封包沿脊椎導管傳輸動畫
  const isSent = phase === 'correct' || phase === 'success' || phase === 'failed';
  const { packetX, packetScale } = useSpring({
    packetX: isSent ? 1.4 : -1.4,
    packetScale: phase === 'prepare' ? 0 : 1,
    config: { mass: 1, tension: 120, friction: 20 },
  });

  // 平滑彈簧演化所有柱體高度
  const springs = useSpring({
    a0: aliceHeights[0],
    a1: aliceHeights[1],
    a2: aliceHeights[2],
    a3: aliceHeights[3],
    b0: bobHeights[0],
    b1: bobHeights[1],
    g0: ghostHeights[0],
    g1: ghostHeights[1],
    config: { mass: 1, tension: 180, friction: 22 },
  });

  const aliceSpringArray = [springs.a0, springs.a1, springs.a2, springs.a3] as const;
  const bobSpringArray = [springs.b0, springs.b1] as const;
  const ghostSpringArray = [springs.g0, springs.g1] as const;

  return (
    <group position={[-0.4, -1, 0]}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[-4, 8, 4]} intensity={1.1} color="#fb923c" />
      <directionalLight position={[4, 8, 4]} intensity={1.15} color="#3b82f6" />

      {/* 1. ALICE 面板 (發送端 / 零號機 EVA-00 山吹橙＋純白邊＋單眼紅點) */}
      <group position={[-3.0, 0, 0]}>
        <RoundedBox args={[3.2, 0.8, 3]} radius={0.1} smoothness={4} position={[0, -0.4, 0]}>
          <primitive object={resources.baseMat} attach="material" />
        </RoundedBox>

        {ALICE_POSITIONS.map((pos, i) => {
          const hSpring = aliceSpringArray[i]!;
          return (
            <group key={`alice-${i}`} position={pos}>
              {/* 純白底座環 */}
              <mesh
                position={[0, 0.01, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                geometry={resources.ringGeo}
                material={resources.whiteBaseRingMat}
                dispose={null}
              />
              {/* 山吹橙主柱體 */}
              <a.mesh scale-y={hSpring} geometry={resources.pillarGeo} material={resources.alicePillarMat} dispose={null} />
              {/* 純白頂部裝甲邊框 */}
              <a.mesh
                position-y={hSpring}
                rotation={[Math.PI / 2, 0, 0]}
                geometry={resources.hoopGeo}
                material={resources.whiteArmorMat}
                dispose={null}
              />
              {/* 零號機標誌性正面「單眼紅點」 */}
              <a.mesh
                position-y={hSpring.to((v) => Math.max(v - 0.14, 0.04))}
                position-z={0.33}
                geometry={resources.eyeGeo}
                material={resources.redEyeMat}
                dispose={null}
              />
            </group>
          );
        })}
      </group>

      {/* 2. 經典通訊通道 (Terminal Dogma 骨骼白脊椎導管 + 綾波麗粉藍靈魂光球) */}
      <group position={[0, 0, 0]}>
        <mesh
          position={[0, 0.05, 0]}
          rotation={[0, 0, Math.PI / 2]}
          geometry={resources.spineGeo}
          material={resources.spineMat}
          dispose={null}
        />
        <mesh
          position={[-1.6, 0.05, 0]}
          rotation={[0, Math.PI / 2, 0]}
          geometry={resources.ringGeo}
          material={resources.dnaRingMat}
          dispose={null}
        />
        <mesh
          position={[1.6, 0.05, 0]}
          rotation={[0, Math.PI / 2, 0]}
          geometry={resources.ringGeo}
          material={resources.dnaRingMat}
          dispose={null}
        />
        <a.mesh
          position-x={packetX}
          position-y={0.26}
          scale={packetScale}
          geometry={resources.packetGeo}
          material={resources.soulPacketMat}
          dispose={null}
        />
      </group>

      {/* 3. BOB 面板 (接收端 / 零號機改 EVA-00' 深鈷藍＋純白邊＋單眼紅點) */}
      <group position={[3.0, 0, 0]}>
        <RoundedBox args={[2.4, 0.8, 3]} radius={0.1} smoothness={4} position={[0, -0.4, 0]}>
          <primitive object={resources.baseMat} attach="material" />
        </RoundedBox>

        {BOB_POSITIONS.map((pos, i) => {
          const bSpring = bobSpringArray[i]!;
          const gSpring = ghostSpringArray[i]!;
          return (
            <group key={`bob-${i}`} position={pos}>
              {/* 純白底座環 */}
              <mesh
                position={[0, 0.01, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                geometry={resources.ringGeo}
                material={resources.whiteBaseRingMat}
                dispose={null}
              />

              {/* 零號機改高飽和深鈷藍實體柱 */}
              <a.mesh scale-y={bSpring} geometry={resources.pillarGeo} material={resources.bobPillarMat} dispose={null} />

              {/* 透明玻璃培養槽本體 */}
              <a.mesh
                scale-x={1.12}
                scale-y={gSpring}
                scale-z={1.12}
                geometry={resources.pillarGeo}
                material={resources.bobTankMat}
                dispose={null}
              />

              {/* 底部與頂部「純白裝甲邊框」 */}
              <mesh
                position={[0, 0.03, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                geometry={resources.hoopGeo}
                material={resources.whiteArmorMat}
                dispose={null}
              />
              <a.mesh
                position-y={gSpring}
                rotation={[Math.PI / 2, 0, 0]}
                geometry={resources.hoopGeo}
                material={resources.whiteArmorMat}
                dispose={null}
              />

              {/* 零號機改正面「單眼紅點」 */}
              <a.mesh
                position-y={gSpring.to((v) => Math.max(v - 0.14, 0.04))}
                position-z={0.36}
                geometry={resources.eyeGeo}
                material={resources.redEyeMat}
                dispose={null}
              />
            </group>
          );
        })}
      </group>
    </group>
  );
}
