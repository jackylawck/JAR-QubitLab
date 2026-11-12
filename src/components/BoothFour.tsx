// src/components/BoothFour.tsx
import { RoundedBox } from '@react-three/drei';

// 🌟 重新校準三區坐標與比例 (總寬度 8.4，置中，無縫相接)
// Alice (2x2): x ∈ [-4.4, -1.2]
const ALICE_POSITIONS: [number, number, number][] = [
  [-1, 0, 1], [-1, 0, -1], [1, 0, 1], [1, 0, -1]
];

// Bob (2x2 視覺錯落): x ∈ [1.6, 4.0] 
const BOB_POSITIONS: [number, number, number][] = [
  [-0.4, 0, 0.8], [0.4, 0, -0.8] // X, Z 雙向錯落，視覺不單薄
];

export function BoothFour() {
  const mockHeight = 1.5; 

  return (
    // 將整個展台往左微移 0.4，抵銷 Bob 區較窄造成的右傾，使視覺重心對齊相機 [0,0,0]
    <group position={[-0.4, -1, 0]}>
      
      {/* 1. ALICE 面板 (左側) */}
      <group position={[-2.8, 0, 0]}>
        <RoundedBox args={[3.2, 0.8, 3]} radius={0.1} smoothness={4} position={[0, -0.4, 0]}>
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </RoundedBox>
        
        {ALICE_POSITIONS.map((pos, i) => (
          <group key={`alice-${i}`} position={pos}>
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.4, 32]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} depthWrite={false} />
            </mesh>
            <mesh position-y={mockHeight / 2}>
              <cylinderGeometry args={[0.35, 0.35, mockHeight, 32]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.8} transparent opacity={0.85} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 2. 經典通訊通道 (中央) */}
      {/* 寬度 2.8，覆蓋 [-1.2, 1.6]，完美無縫接合 Alice 右緣與 Bob 左緣 */}
      <group position={[0.2, 0, 0]}>
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.8, 0.2]} />
          <meshBasicMaterial color="#334155" transparent opacity={0.5} />
        </mesh>
        
        <mesh position={[0, 0.1, 0]}>
          {/* 放大經典通道光球至 0.25 半徑，確保手機端可見 */}
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial color="#fbbf24" toneMapped={false} />
        </mesh>
      </group>

      {/* 3. BOB 面板 (右側) */}
      <group position={[2.8, 0, 0]}>
        <RoundedBox args={[2.4, 0.8, 3]} radius={0.1} smoothness={4} position={[0, -0.4, 0]}>
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </RoundedBox>
        
        {BOB_POSITIONS.map((pos, i) => (
          <group key={`bob-${i}`} position={pos}>
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.4, 32]} />
              <meshBasicMaterial color="#a855f7" transparent opacity={0.4} depthWrite={false} />
            </mesh>
            <mesh position-y={mockHeight / 2}>
              <cylinderGeometry args={[0.35, 0.35, mockHeight, 32]} />
              <meshStandardMaterial color="#a855f7" emissive="#9333ea" emissiveIntensity={0.8} transparent opacity={0.85} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
