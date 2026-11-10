// src/hooks/useAnimationLock.ts
/*
 * Project: J.A.R. QubitLab (Joint Applied Research)
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { create } from 'zustand';

interface AnimationLockState {
  lockCount: number;
  isAnimating: boolean;
  acquire: (fallbackTimeoutMs?: number) => () => void;
}

export const useAnimationLockStore = create<AnimationLockState>((set) => ({
  lockCount: 0,
  isAnimating: false,
  
  acquire: (fallbackTimeoutMs = 5000) => {
    set((state) => ({ 
      lockCount: state.lockCount + 1, 
      isAnimating: true 
    }));
    
    let released = false;
    let timeoutId: number | undefined;

    const release = () => {
      if (released) return;
      released = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);

      set((state) => {
        const nextCount = Math.max(0, state.lockCount - 1);
        return { lockCount: nextCount, isAnimating: nextCount > 0 };
      });
    };

    // 🌟 效能治理：看門狗防呆機制 (Watchdog Timer)
    // 預設 5000ms 後強制解鎖。防止元件卸載遺漏或 JS 錯誤導致引擎鎖死在 'always'，燒毀行動裝置電池。
    if (fallbackTimeoutMs > 0) {
      timeoutId = window.setTimeout(() => {
        if (!released) {
          console.warn(`[JAR-QubitLab] ⚠️ Animation lock watchdog triggered after ${fallbackTimeoutMs}ms. Auto-releasing to prevent battery drain.`);
          release();
        }
      }, fallbackTimeoutMs);
    }

    return release;
  },
}));

// Vite HMR 邊界防護：模組替換時重置計數，避免 frameloop 鎖死在 'always'
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    useAnimationLockStore.setState({ lockCount: 0, isAnimating: false });
  });
}

export const useAnimationLock = () => {
  const isAnimating = useAnimationLockStore((state) => state.isAnimating);
  return { isAnimating };
};

// 允許外部直接調用，並可自訂該次鎖定的最長容忍時間 (例如：acquireAnimationLock(2000))
export const acquireAnimationLock = (fallbackTimeoutMs?: number) => 
  useAnimationLockStore.getState().acquire(fallbackTimeoutMs);
