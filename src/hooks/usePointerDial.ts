// src/hooks/usePointerDial.ts
/*
 * Project: J.A.R. QubitLab (Joint Applied Research)
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { useRef, useCallback, useEffect } from 'react';

interface UsePointerDialOptions {
  onAngleChange: (angleRad: number) => void;
  snapAngles?: number[]; 
  hapticEnabled?: boolean;
}

// 🌟 優化 2：Zero-GC 靜態震動波形陣列，避免 120Hz 拖曳時反覆建立陣列物件
const HAPTIC_MECHANICAL_CLICK = 10;
const HAPTIC_MAGNETIC_SNAP = [15, 30, 15];

const TWO_PI = 2 * Math.PI;

export function usePointerDial({
  onAngleChange,
  snapAngles = [0, Math.PI / 2, Math.PI, 1.5 * Math.PI],
  hapticEnabled = true,
}: UsePointerDialOptions) {
  const activePointerId = useRef<number | null>(null);
  const centerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastSnap = useRef<number | null>(null);

  // Latest Ref Pattern: 統一快取外部狀態，杜絕 React 閉包過期陷阱
  const configRef = useRef({ onAngleChange, snapAngles, hapticEnabled });
  useEffect(() => {
    configRef.current = { onAngleChange, snapAngles, hapticEnabled };
  }, [onAngleChange, snapAngles, hapticEnabled]);

  // 🌟 優化 3：零依賴 (Zero Dependency) 的震動回調
  const triggerHaptic = useCallback((pattern: number | number[] = 12) => {
    if (configRef.current.hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []); // 依賴為空，永遠不會在元件生命週期中重建

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    // 💡 建議在綁定此 Hook 的 DOM 上設定 CSS `touch-action: none` 
    // 以獲取最順滑的 120Hz 瀏覽器原生效能
    const target = e.currentTarget as HTMLElement;
    activePointerId.current = e.pointerId;
    target.setPointerCapture(e.pointerId);

    const rect = target.getBoundingClientRect();
    centerPos.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    triggerHaptic(HAPTIC_MECHANICAL_CLICK); 
  }, [triggerHaptic]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerId !== activePointerId.current) return;

    const dx = e.clientX - centerPos.current.x;
    const dy = e.clientY - centerPos.current.y;

    // 免開根號防抖：12px 半徑的盲區 (144) 避免浮點開銷與中心奇異點抖動
    if (dx * dx + dy * dy < 144) return;

    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += TWO_PI;

    const { snapAngles: currentSnaps, onAngleChange: currentOnChange } = configRef.current;

    // 🌟 優化 1：環形角域磁吸判定 (Circular Modulo Snap)
    // 解決 359度 與 0度 邊界無法互相磁吸的 Bug
    for (const snap of currentSnaps) {
      const diff = Math.abs(angle - snap);
      const circularDiff = Math.min(diff, TWO_PI - diff); // 取最短角距

      if (circularDiff < 0.08 && lastSnap.current !== snap) {
        lastSnap.current = snap;
        angle = snap; // 完美磁吸對齊
        triggerHaptic(HAPTIC_MAGNETIC_SNAP); 
        break;
      }
    }
    
    // 脫離卡榫區間時釋放狀態
    if (lastSnap.current !== null) {
      const diff = Math.abs(angle - lastSnap.current);
      const circularDiff = Math.min(diff, TWO_PI - diff);
      if (circularDiff >= 0.12) {
        lastSnap.current = null;
      }
    }

    currentOnChange(angle);
  }, [triggerHaptic]); 

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerId !== activePointerId.current) return;
    activePointerId.current = null;
    lastSnap.current = null;
    
    // 安全、無錯誤拋出的 Capture 釋放機制
    const target = e.currentTarget as HTMLElement;
    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
  }, []);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  };
}
