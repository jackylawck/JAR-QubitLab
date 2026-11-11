// src/store/tensorStore.ts
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

export const useTensorStore = create<TensorState>((set, get) => ({
  engine: new TensorEngine(2),
  amplitudes: new TensorEngine(2).getAmplitudes(),
  isEntangled: false,
  sampleHistory: [],
  isSampling: false,

  applyH: (q) => {
    const { engine, isSampling } = get();
    if (isSampling) return;
    engine.applyGate(GATES.H, q);
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
    
    set({ isSampling: true, sampleHistory: [] });
    
    // 儲存坍縮前的波函數狀態，以便抽樣後恢復
    const originalState = new Float64Array(engine.state);
    
    const history: number[] = [];
    for (let i = 0; i < 20; i++) {
      // 每次抽樣前恢復波函數
      engine.state.set(originalState); 
      const result = engine.collapse();
      history.push(result);
      
      // 更新 UI 呈現單次坍縮瞬間，並等待 150ms 產生「連續打點」的視覺回饋
      set({ amplitudes: engine.getAmplitudes(), sampleHistory: [...history] });
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    // 抽樣結束，恢復為原始波函數疊加態供玩家繼續觀察
    engine.state.set(originalState);
    set({ amplitudes: engine.getAmplitudes(), isSampling: false });
  },

  reset: () => {
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
