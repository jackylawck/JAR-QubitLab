// src/store/tensorStore.ts
/*
 * Project: J.A.R. QubitLab (Joint Applied Research)
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { create } from 'zustand';
import { TensorEngine, GATES, TensorAmplitude } from '../quantum/tensorEngine';

interface TensorState {
  engine: TensorEngine;
  amplitudes: TensorAmplitude[];
  isEntangled: boolean;
  sampleHistory: number[]; // 記錄每次坍縮的 index (0~3)
  isSampling: boolean;
  
  applyH: (q: number) => void;
  applyCNOT: (c: number, t: number) => void;
  sample20x: () => Promise<void>;
  reset: () => void;
}

export const useTensorStore = create<TensorState>((set, get) => {
  // 🌟 優化 1：將全域變數移入 Zustand closure 內
  // 徹底杜絕 Vite HMR 導致的模組重新求值與物件參考脫節 (Dangling Reference) 問題
  let sampleIdCounter = 0; 
  const engine = new TensorEngine(2);
  
  // 預分配 Zero-GC 快取池，杜絕 sample20x 內的反覆 new Float64Array
  const snapshotBuffer = new Float64Array(engine.stateSize * 2);
  let snapshotRefIdx = 0;

  return {
    engine,
    amplitudes: engine.getAmplitudes(),
    isEntangled: false,
    sampleHistory: [],
    isSampling: false,

    applyH: (q) => {
      const { isSampling } = get();
      if (isSampling) return;
      
      const hGate = GATES.H;
      if (!hGate) return;
      
      engine.applyGate(hGate, q);
      
      set({
        amplitudes: engine.getAmplitudes(),
        isEntangled: engine.computeConcurrence() > 0.99,
        sampleHistory: [] // 操作閘門時清空歷史
      });
    },

    applyCNOT: (c, t) => {
      const { isSampling } = get();
      if (isSampling) return;
      
      engine.applyCNOT(c, t);
      set({
        amplitudes: engine.getAmplitudes(),
        isEntangled: engine.computeConcurrence() > 0.99,
        sampleHistory: []
      });
    },

    sample20x: async () => {
      const { isSampling } = get();
      if (isSampling) return;
      
      // 鎖定當前抽樣任務的 ID
      const currentSampleId = ++sampleIdCounter; 
      set({ isSampling: true, sampleHistory: [] });
      
      // 🌟 Zero-GC 快照：將狀態寫入預先分配好的 Closure 緩衝區
      snapshotBuffer.set(engine.state);
      snapshotRefIdx = engine.refIdx;
      
      const history: number[] = [];
      for (let i = 0; i < 20; i++) {
        // 每次迭代檢查任務是否已被中斷
        if (currentSampleId !== sampleIdCounter) return;
        
        // 🌟 極速回滾：從 Buffer 還原波函數
        engine.state.set(snapshotBuffer); 
        engine.refIdx = snapshotRefIdx;

        const result = engine.collapse();
        history.push(result);
        
        // 🌟 優化 3：使用展開運算子取代 slice()，語意更貼合 React Immutable Pattern
        set({ amplitudes: engine.getAmplitudes(), sampleHistory: [...history] });
        
        // 讓出主執行緒，確保 React 有足夠時間渲染 3D 畫面與音效
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      // 迴圈結束後，最後確認是否被取消
      if (currentSampleId !== sampleIdCounter) return;
      
      // 抽樣結束，完整恢復波函數與基準相位，防止下次運算鎖相漂移
      engine.state.set(snapshotBuffer);
      engine.refIdx = snapshotRefIdx;
      set({ amplitudes: engine.getAmplitudes(), isSampling: false });
    },

    reset: () => {
      // 改變計數器，立即「剪斷」任何正在執行的 sample20x 迴圈
      sampleIdCounter++; 
      engine.reset();
      set({
        amplitudes: engine.getAmplitudes(),
        isEntangled: false,
        sampleHistory: [],
        isSampling: false
      });
    }
  };
});
