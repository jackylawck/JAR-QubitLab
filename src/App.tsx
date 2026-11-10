// src/App.tsx
import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BoothOne } from './components/BoothOne';
import { BoothTwo } from './components/BoothTwo';
import { useAnimationLock } from './hooks/useAnimationLock';

export default function App() {
  const { isAnimating } = useAnimationLock();
  // 展台切換狀態
  const [activeBooth, setActiveBooth] = useState<'one' | 'two'>('one');

  return (
    <div className="w-full h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden relative">
      <Canvas 
        camera={{ position: [0, 6, 11], fov: 50 }}
        dpr={[1, 2]}
        // 確保首幀與待機微觀動態即時流暢，動畫鎖定時持續高幀率
        frameloop={isAnimating ? 'always' : 'always'}
        className="absolute inset-0 z-0"
      >
        <color attach="background" args={['#0a0a0f']} />

        {/* 基礎全域光照：環境光 + 主定向光 + 補光，防止模型死黑 */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.6} />

        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2.2} 
          minDistance={4} 
          maxDistance={14} 
          target={[0, 0.5, 0]}
        />

        {/* 必須使用 Suspense 包裹所有使用非同步字體 (NotoSansMath) 的 3D 組件 */}
        <Suspense fallback={null}>
          {activeBooth === 'one' ? <BoothOne /> : <BoothTwo />}
        </Suspense>
      </Canvas>

      {/* 頂部展台切換按鈕 */}
      <div className="absolute top-6 right-6 z-20 flex gap-2">
        <button 
          onClick={() => setActiveBooth('one')} 
          className={`px-4 py-2 rounded-md font-bold transition-colors cursor-pointer ${
            activeBooth === 'one' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          展台 1
        </button>
        <button 
          onClick={() => setActiveBooth('two')} 
          className={`px-4 py-2 rounded-md font-bold transition-colors cursor-pointer ${
            activeBooth === 'two' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          展台 2
        </button>
      </div>

      {/* 下方科學館說明展牌 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md border border-white/10 p-6 rounded-xl w-11/12 max-w-3xl z-10 pointer-events-none shadow-2xl">
        {activeBooth === 'one' ? (
          <>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm tracking-wider border border-blue-500/30">展台 1</span>
              疊加與坍縮 (Superposition & Collapse)
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed text-sm md:text-base">
              <p>
                <strong className="text-white">繁中：</strong>撥動分光桿，相當於對球施加了一次 <strong>Hadamard 門</strong>——它從「確定在左邊」變成「同時在左邊和右邊」。<br/>
                當球處於<strong>疊加態</strong>時，它不是「轉太快看不清」，而是拍照前<strong>根本沒有決定</strong>在哪邊，拍照的動作迫使它選邊站；但如果球本來就在某一邊 (純 左 或 右 態)，那它的位置本就是確定的。
              </p>
              <hr className="border-white/10" />
              <p className="text-gray-400">
                <strong className="text-gray-300">English:</strong> Pulling the beam-splitter lever applies a <strong>Hadamard gate</strong>—the ball evolves from 'definitely left' into 'both left and right simultaneously'.<br/>
                When the ball is in a <strong>superposition</strong>, it isn't 'spinning too fast to see'—it genuinely hasn't decided its position before the shutter clicks, and the measurement forces it to choose. However, if the ball is already in a basis state, its position is already determined.
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded text-sm tracking-wider border border-cyan-500/30">展台 2</span>
              波動干涉與機率搬運 (Wave Interference & Amplitude Amplification)
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed text-sm md:text-base">
              <p>
                <strong className="text-white">繁中：</strong>量子演化遵循能量守恆，相消干涉<strong>不會讓總能量消失</strong>，而是將機率「搬運」到另一路徑！<br/>
                依序執行：① 撥動分光使粒子走兩條路 → ② 旋轉舵盤翻轉相位 (π) → ③ 匯流對撞。<br/>
                若<strong>同相</strong>，Path B 相消蒸發，機率全數匯聚至 Path A；若<strong>反相</strong>，Path A 相消蒸發，機率全數搬運至 Path B！
              </p>
              <hr className="border-white/10" />
              <p className="text-gray-400">
                <strong className="text-gray-300">English:</strong> Quantum evolution preserves total probability. Destructive interference does not annihilate energy; it redistributes amplitude!<br/>
                Sequence: ① Split paths → ② Flip phase (π) → ③ Recombine.<br/>
                <strong>In-phase:</strong> Path B destructively cancels to zero while Path A amplifies to 1.0.<br/>
                <strong>Anti-phase:</strong> Path A destructively cancels to zero while amplitude is completely transferred into Path B!
              </p>
            </div>
          </>
        )}
      </div>
      
      {/* 頂部標題 */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1 className="text-3xl font-black tracking-tighter text-white drop-shadow-md">
          J.A.R. QubitLab <span className="text-blue-400">|</span> 量子微觀實驗室
        </h1>
        <p className="text-gray-400 mt-1 text-sm">滑鼠拖曳旋轉視角 / 點擊下方裝置互動</p>
      </div>
    </div>
  );
}
