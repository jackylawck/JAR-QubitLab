// src/hooks/useAnimationLock.ts
/*
 * Project: J.A.R. QubitLab (Joint Applied Research)
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { create } from 'zustand';
import { useCallback, useEffect, useRef } from 'react';

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
    // 🌟 優化 1：跨環境型別安全 (NodeJS.Timeout vs Browser number)
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const release = () => {
      if (released) return;
      released = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);

      set((state) => {
        const nextCount = Math.max(0, state.lockCount - 1);
        return { lockCount: nextCount, isAnimating: nextCount > 0 };
      });
    };

    // 效能治理：看門狗防呆機制 (Watchdog Timer)
    if (fallbackTimeoutMs > 0) {
      timeoutId = setTimeout(() => {
        if (!released) {
          console.warn(`[JAR-QubitLab] ⚠️ Animation lock watchdog triggered after ${fallbackTimeoutMs}ms. Auto-releasing to prevent battery drain.`);
          release();
        }
      }, fallbackTimeoutMs);
    }

    return release;
  },
}));

// Vite HMR 邊界防護：模組替換時重置計數，避免 frameloop 鎖死
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    useAnimationLockStore.setState({ lockCount: 0, isAnimating: false });
  });
}

export const useAnimationLock = () => {
  const isAnimating = useAnimationLockStore((state) => state.isAnimating);
  const acquire = useAnimationLockStore((state) => state.acquire);

  // 🌟 優化 2：將元件層級的防連點 (Debounce) 與自動釋放邏輯封裝進 Hook
  const lockReleaseRef = useRef<(() => void) | null>(null);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const requestActionLock = useCallback((duration: number = 500) => {
    // 阻斷並清理上一次未完成的鎖定
    if (lockTimerRef.current !== null) {
      clearTimeout(lockTimerRef.current);
    }
    if (lockReleaseRef.current) {
      lockReleaseRef.current();
      lockReleaseRef.current = null;
    }
    
    // 呼叫底層 acquire，並加上 1 秒作為底層 Watchdog 的容錯緩衝
    lockReleaseRef.current = acquire(duration + 1000); 
    
    lockTimerRef.current = setTimeout(() => {
      if (lockReleaseRef.current) {
        lockReleaseRef.current();
        lockReleaseRef.current = null;
      }
      lockTimerRef.current = null;
    }, duration);
  }, [acquire]);

  // 🌟 優化 3：元件卸載 (Unmount) 時的安全清理，杜絕 Memory Leak 與狀態死鎖
  useEffect(() => {
    return () => {
      if (lockTimerRef.current !== null) clearTimeout(lockTimerRef.current);
      if (lockReleaseRef.current) {
        lockReleaseRef.current();
        lockReleaseRef.current = null;
      }
    };
  }, []);

  return { isAnimating, requestActionLock, acquire };
};

// 允許外部直接調用，並可自訂該次鎖定的最長容忍時間
export const acquireAnimationLock = (fallbackTimeoutMs?: number) => 
  useAnimationLockStore.getState().acquire(fallbackTimeoutMs);
