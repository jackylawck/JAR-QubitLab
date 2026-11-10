// src/hooks/useAnimationLock.ts
import { create } from 'zustand';

interface AnimationLockState {
  lockCount: number;
  isAnimating: boolean;
  acquire: () => () => void;
}

export const useAnimationLockStore = create<AnimationLockState>((set) => ({
  lockCount: 0,
  isAnimating: false,
  acquire: () => {
    set((state) => ({ 
      lockCount: state.lockCount + 1, 
      isAnimating: true 
    }));
    let released = false;
    return () => {
      if (released) return;
      released = true;
      set((state) => {
        const nextCount = Math.max(0, state.lockCount - 1);
        return { lockCount: nextCount, isAnimating: nextCount > 0 };
      });
    };
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

export const acquireAnimationLock = () => useAnimationLockStore.getState().acquire();
