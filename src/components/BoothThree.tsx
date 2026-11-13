// src/components/BoothThree.tsx
/*
 * Project: J.A.R. QubitLab
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 * Theme: EVA-01 (Unit-01) vs EVA-13 (Unit-13) Final Showdown
 */
import { Suspense, useMemo, useEffect } from 'react';
import { Text, RoundedBox } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { useTensorStore } from '../store/tensorStore';
import { FONT_MATH_PATH } from '../constants';
import { TensorAmplitude } from '../quantum/tensorEngine';

const POSITIONS: [number, number, number][] = [
  [-2, 0,  1.5], // |00⟩ - 初號機 (EVA-01)
  [-2, 0, -1.5], // |01⟩ - 初號機 (EVA-01)
  [ 2, 0,  1.5], // |10⟩ - 第13號機 (EVA-13)
  [ 2, 0, -1.5], // |11⟩ - 第13號機 (EVA-13)
];

interface PillarProps {
  position: [number, number, number];
  amplitude: TensorAmplitude;
  geometry: THREE.CylinderGeometry;
  ringGeometry: THREE.RingGeometry;
  material: THREE.Material;
  ringMaterial: THREE.Material;
}

const Pillar = ({
  position,
  amplitude,
  geometry,
  ringGeometry,
  material,
  ringMaterial,
}: PillarProps) => {
  const { scaleY } = useSpring({
    scaleY: Math.max(amplitude.modulus, 0.01),
    config: { mass: 1, tension: 200, friction: 22 },
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* 1. 機體裝甲主柱體 */}
      <a.mesh geometry={geometry} material={material} scale-y={scaleY} dispose={null} />

      {/* 2. 底座高能裝甲光環（初號機螢光綠 / 13號機猩紅，避免與柱體混色泛白） */}
      <mesh
        position={[0, 0.015, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={ringGeometry}
        material={ringMaterial}
        dispose={null}
      />

      {/* 3. 基底態標籤 */}
      <group position={[0, 3.6, 0]}>
        <Suspense fallback={null}>
          <Text
            fontSize={0.45}
            color="#ffffff"
            font={FONT_MATH_PATH}
            outlineWidth={0.03}
            outlineColor="#000000"
            anchorX="center"
            anchorY="middle"
            depthOffset={-1}
          >
            {amplitude.label}
          </Text>
        </Suspense>
      </group>
    </group>
  );
};

export const BoothThree = () => {
  const amplitudes = useTensorStore((s) => s.amplitudes);
  const isEntangled = useTensorStore((s) => s.isEntangled);

  // 🌟 Zero-GC 預分配記憶體：所有幾何體與 EVA-01 / EVA-13 材質集中管理與自動回收
  const resources = useMemo(() => {
    const cyl = new THREE.CylinderGeometry(0.48, 0.48, 3, 32);
    cyl.translate(0, 1.5, 0); // 原點下移至底部

    return {
      pillarGeo: cyl,
      ringGeo: new THREE.RingGeometry(0.54, 0.72, 32),
      trackGeo: new THREE.PlaneGeometry(6.8, 0.36),

      baseMat: new THREE.MeshStandardMaterial({
        color: '#090a0f',
        roughness: 0.8,
        metalness: 0.4,
      }),

      // q0：初號機 (EVA-01) — 高飽和紫羅蘭裝甲 + 螢光綠能量環
      eva01Mat: new THREE.MeshStandardMaterial({
        color: '#9333ea',
        emissive: '#7e22ce',
        emissiveIntensity: 0.7,
        toneMapped: false,
        transparent: true,
        opacity: 0.92,
        roughness: 0.25,
        metalness: 0.2,
      }),
      eva01EntangledMat: new THREE.MeshStandardMaterial({
        color: '#a855f7',
        emissive: '#9333ea',
        emissiveIntensity: 1.25,
        toneMapped: false,
        transparent: true,
        opacity: 1.0,
        roughness: 0.15,
        metalness: 0.3,
      }),
      eva01RingMat: new THREE.MeshBasicMaterial({
        color: '#22c55e', // 初號機標誌性螢光綠胸甲/條紋
        transparent: true,
        opacity: 0.85,
        toneMapped: false,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),

      // q1：第13號機 (EVA-13) — 暗夜深紫藍裝甲 + 猩紅能量環
      eva13Mat: new THREE.MeshStandardMaterial({
        color: '#3730a3',
        emissive: '#312e81',
        emissiveIntensity: 0.8,
        toneMapped: false,
        transparent: true,
        opacity: 0.92,
        roughness: 0.25,
        metalness: 0.2,
      }),
      eva13EntangledMat: new THREE.MeshStandardMaterial({
        color: '#4f46e5',
        emissive: '#4338ca',
        emissiveIntensity: 1.3,
        toneMapped: false,
        transparent: true,
        opacity: 1.0,
        roughness: 0.15,
        metalness: 0.3,
      }),
      eva13RingMat: new THREE.MeshBasicMaterial({
        color: '#e11d48', // 第13號機猩紅雙瞳與雙槍赤紅
        transparent: true,
        opacity: 0.85,
        toneMapped: false,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),

      // 雙槍交織軌道：朗基努斯赤紅 + 卡西烏斯蒼藍（Zero-GC 共用材質）
      trackLonginusMat: new THREE.MeshBasicMaterial({
        color: '#e11d48',
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
      trackCassiusMat: new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -3,
      }),
    };
  }, []);

  // 生命週期結束主動釋放所有 GPU 幾何與材質記憶體
  useEffect(() => {
    return () => {
      Object.values(resources).forEach((resource) => {
        if (typeof resource.dispose === 'function') {
          resource.dispose();
        }
      });
    };
  }, [resources]);

  return (
    <group position={[0, -1, 0]}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[-5, 8, 5]} intensity={1.1} color="#c084fc" />
      <directionalLight position={[ 5, 8, 5]} intensity={1.1} color="#818cf8" />

      {/* 展台底座 */}
      <RoundedBox args={[8, 0.8, 6]} radius={0.1} smoothness={4} position={[0, -0.4, 0]}>
        <primitive object={resources.baseMat} attach="material" />
      </RoundedBox>

      {/* 貝爾態對角線雙槍交織光軌 */}
      {isEntangled && (
        <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0.6435]}>
          <mesh geometry={resources.trackGeo} material={resources.trackLonginusMat} dispose={null} />
          <mesh geometry={resources.trackGeo} material={resources.trackCassiusMat} dispose={null} />
        </group>
      )}

      {/* 雙量子位元基底態柱體 (Defensive Rendering) */}
      {POSITIONS.map((pos, i) => {
        const amp = amplitudes[i];
        if (!amp) return null;

        const isEva01 = i < 2;
        const pillarMat = isEntangled
          ? isEva01
            ? resources.eva01EntangledMat
            : resources.eva13EntangledMat
          : isEva01
            ? resources.eva01Mat
            : resources.eva13Mat;

        const ringMat = isEva01 ? resources.eva01RingMat : resources.eva13RingMat;

        return (
          <Pillar
            key={i}
            position={pos}
            amplitude={amp}
            geometry={resources.pillarGeo}
            ringGeometry={resources.ringGeo}
            material={pillarMat}
            ringMaterial={ringMat}
          />
        );
      })}
    </group>
  );
};
