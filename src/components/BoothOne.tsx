import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, ContactShadows, Environment, Float, Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { useQuantumStore } from '../store/quantumStore';
import { sound } from '../audio/soundEngine';

// 單一量子態的光球視覺化
const QubitCloud = ({ position, modulus, phase, label }: { position: [number, number, number], modulus: number, phase: number, label: string }) => {
  // 物理參數映射至視覺參數：模長決定縮放與不透明度，相位決定顏色偏移
  const { scale, opacity, color } = useSpring({
    scale: modulus > 0.1 ? modulus * 1.5 : 0.01,
    opacity: modulus > 0.1 ? modulus * 0.8 : 0,
    color: new THREE.Color().setHSL(phase / (2 * Math.PI), 0.8, 0.6).getStyle(),
    config: { mass: 1, tension: 170, friction: 26 }
  });

  return (
    <a.group position={position} scale={scale}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <a.mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <a.meshPhysicalMaterial 
            color={color}
            transmission={0.9} 
            opacity={opacity} 
            transparent 
            roughness={0.1}
            ior={1.5}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </a.mesh>
      </Float>
      {/* 底部狀態標籤 */}
      <Text position={[0, -1.5, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </a.group>
  );
};

export const BoothOne = () => {
  const amplitudes = useQuantumStore((state) => state.amplitudes);
  const applyGate = useQuantumStore((state) => state.applyGate);
  const collapse = useQuantumStore((state) => state.collapse);

  // Big-Endian: q0 控制左/右。|00⟩ 是左(idx 0)，|10⟩ 是右(idx 2)
  const leftModulus = amplitudes[0]?.modulus || 0;
  const leftPhase = amplitudes[0]?.phase || 0;
  const rightModulus = amplitudes[2]?.modulus || 0;
  const rightPhase = amplitudes[2]?.phase || 0;

  const handleLeverClick = () => {
    sound.playLever();
    applyGate('H', [0]); // 對 q0 施加 Hadamard 分光
  };

  const handleShutterClick = () => {
    sound.playShutter();
    collapse(); // 強制測量坍縮
  };

  return (
    <group>
      {/* 環境光影設定 */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <Environment preset="city" />

      {/* 展台底座 */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[8, 1, 4]} />
        <meshStandardMaterial color="#1a1a24" roughness={0.7} />
      </mesh>

      {/* 量子球體 (左側 |0⟩ 與 右側 |1⟩) */}
      <QubitCloud position={[-2, 1.5, 0]} modulus={leftModulus} phase={leftPhase} label="|0⟩" />
      <QubitCloud position={[2, 1.5, 0]} modulus={rightModulus} phase={rightPhase} label="|1⟩" />

      {/* H 門金屬撥桿 (分光器) */}
      <group position={[0, 0, 1.5]} onClick={handleLeverClick} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 1]} />
          <meshStandardMaterial color="#8892b0" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.4]} />
          <meshStandardMaterial color="#ff4757" metalness={0.3} roughness={0.4} />
        </mesh>
        <Html position={[0, -0.5, 0]} center>
          <div className="bg-black/80 text-white px-3 py-1 rounded border border-white/20 select-none whitespace-nowrap text-sm">
            🕹️ 撥動分光 (H-Gate)
          </div>
        </Html>
      </group>

      {/* 觀測快門按鈕 */}
      <group position={[3.5, 0.2, 1.5]} onClick={handleShutterClick} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.5, 0.6, 0.4]} />
          <meshStandardMaterial color="#2f3542" />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.1]} />
          <meshStandardMaterial color="#eccc68" metalness={0.6} roughness={0.2} />
        </mesh>
        <Html position={[0, 1, 0]} center>
          <div className="bg-black/80 text-white px-3 py-1 rounded border border-white/20 select-none whitespace-nowrap text-sm">
            📸 拍下快門 (Measure)
          </div>
        </Html>
      </group>

      {/* 落地陰影 */}
      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={10} blur={2} far={4} />
    </group>
  );
};
