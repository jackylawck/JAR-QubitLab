import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BoothOne } from './components/BoothOne';

export default function App() {
  return (
    <div className="w-full h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden relative">
      {/* 3D 展台畫布層 */}
      <Canvas 
        camera={{ position: [0, 4, 8], fov: 45 }}
        shadows 
        className="absolute inset-0 z-0"
      >
        <color attach="background" args={['#0a0a0f']} />
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2.2} 
          minDistance={4} 
          maxDistance={12} 
        />
        <BoothOne />
      </Canvas>

      {/* L2 展牌文案層 (UI Overlay) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-xl w-11/12 max-w-3xl z-10 pointer-events-none shadow-2xl">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm tracking-wider border border-blue-500/30">展台 1</span>
          疊加與坍縮 (Superposition & Collapse)
        </h2>
        
        <div className="space-y-4 text-gray-300 leading-relaxed text-sm md:text-base">
          <p>
            <strong className="text-white">繁中：</strong>把撥片扳到「量子模式」，相當於對球施加了一次 <strong>分光操作 (Hadamard 門)</strong>——它從「確定在左邊」變成「同時在左邊和右邊」。<br/>
            當球處於<strong>疊加態</strong>時，它不是「轉太快看不清」，而是拍照前<strong>根本沒有決定</strong>在哪邊，拍照的動作迫使它選邊站；但如果球本來就在某一邊 (純 |0⟩ 或 |1⟩ 態)，那它的位置本就是確定的。
          </p>
          <hr className="border-white/10" />
          <p className="text-gray-400">
            <strong className="text-gray-300">English:</strong> Flipping the switch to 'Quantum Mode' applies a <strong>Hadamard gate</strong>—the ball evolves from 'definitely left' into 'both left and right simultaneously'.<br/>
            When the ball is in a <strong>superposition</strong>, it isn't 'spinning too fast to see'—it genuinely hasn't decided its position before the shutter clicks, and the measurement forces it to choose. However, if the ball is already in a basis state, its position is already determined.
          </p>
        </div>
      </div>
      
      {/* 標題與操作提示 */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1 className="text-3xl font-black tracking-tighter text-white drop-shadow-md">
          Quantum Pavilion <span className="text-blue-400">|</span> 量子奇趣館
        </h1>
        <p className="text-gray-400 mt-1 text-sm">滑鼠拖曳旋轉視角 / 點擊下方裝置互動</p>
      </div>
    </div>
  );
}
