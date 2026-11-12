// src/store/tensorStore.ts
import { create } from 'zustand';
import { TensorEngine, GATES, TensorAmplitude } from '../quantum/tensorEngine';

// 全域 ID 計數器，用於攔截與取消異步抽樣迴圈
let sampleIdCounter = 0; 

// 🌟 優化 1：提取全域單一實例，杜絕初始化時的「雙重 new」記憶體浪費
const initEngine = new TensorEngine(2);

// 🌟 優化 2：預分配 Zero-GC 快取池，杜絕 sample20x 內的反覆 new Float64Array
const snapshotBuffer = new Float64Array(initEngine.stateSize * 2);
let snapshotRefIdx = 0;

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

export const useTensorStore = create<TensorState>((set, get) => ({
  engine: initEngine,
  amplitudes: initEngine.getAmplitudes(),
  isEntangled: false,
  sampleHistory: [],
  isSampling: false,

  applyH: (q) => {
    const { engine, isSampling } = get();
    if (isSampling) return;
    
    // 確保從 GATES 取出的矩陣絕對不是 undefined (TS2345)
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
    const { engine, isSampling } = get();
    if (isSampling) return;
    
    engine.applyCNOT(c, t);
    set({
      amplitudes: engine.getAmplitudes(),
      isEntangled: engine.computeConcurrence() > 0.99,
      sampleHistory: []
    });
  },

  sample20x: async () => {
    const { engine, isSampling } = get();
    if (isSampling) return;
    
    // 鎖定當前抽樣任務的 ID
    const currentSampleId = ++sampleIdCounter; 
    set({ isSampling: true, sampleHistory: [] });
    
    // 🌟 Zero-GC 快照：將狀態寫入預先分配好的全域緩衝區，杜絕記憶體碎片
    snapshotBuffer.set(engine.state);
    snapshotRefIdx = engine.refIdx;
    
    const history: number[] = [];
    for (let i = 0; i < 20; i++) {
      // 每次迭代檢查任務是否已被中斷
      if (currentSampleId !== sampleIdCounter) return;
      
      // 🌟 極速回滾：從 Buffer 還原波函數
      engine.state.set(snapshotBuffer); 
      engine.refIdx = snapshotRefIdx; // 同步還原相位基準

      const result = engine.collapse();
      history.push(result);
      
      // 更新 UI 呈現單次坍縮瞬間，使用 slice() 回傳新陣列觸發 React 渲染
      set({ amplitudes: engine.getAmplitudes(), sampleHistory: history.slice() });
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
    const { engine } = get();
    engine.reset();
    set({
      amplitudes: engine.getAmplitudes(),
      isEntangled: false,
      sampleHistory: [],
      isSampling: false
    });
  }
}));
