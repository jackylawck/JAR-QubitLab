// src/hooks/usePointerDial.ts
/*
 * Project: J.A.R. QubitLab (Joint Applied Research)
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { useRef, useCallback, useEffect } from 'react';

interface UsePointerDialOptions {
  onAngleChange: (angleRad: number) => void;
  snapAngles?: number[]; // 例如 [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]
  hapticEnabled?: boolean;
}

export function usePointerDial({
  onAngleChange,
  snapAngles = [0, Math.PI / 2, Math.PI, 1.5 * Math.PI],
  hapticEnabled = true,
}: UsePointerDialOptions) {
  const activePointerId = useRef<number | null>(null);
  const centerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastSnap = useRef<number | null>(null);

  // 🌟 優化 1：Latest Ref Pattern
  // 將回調與配置快取至 Ref，徹底斬斷 useCallback 對外部 Props 的依賴
  const configRef = useRef({ onAngleChange, snapAngles });
  useEffect(() => {
    configRef.current = { onAngleChange, snapAngles };
  }, [onAngleChange, snapAngles]);

  const triggerHaptic = useCallback((pattern: number | number[] = 12) => {
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, [hapticEnabled]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    // 💡 提示：建議在套用此 Hook 的 DOM 元素上加上 CSS `touch-action: none` 
    // 來取代 JS 的 e.preventDefault()，這能獲得更極致的原生效能。
    const target = e.currentTarget as HTMLElement;
    activePointerId.current = e.pointerId;
    target.setPointerCapture(e.pointerId);

    const rect = target.getBoundingClientRect();
    centerPos.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    triggerHaptic(10); // 按下時的機械觸感
  }, [triggerHaptic]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerId !== activePointerId.current) return;

    const dx = e.clientX - centerPos.current.x;
    const dy = e.clientY - centerPos.current.y;

    // 🌟 優化 2：免開根號的效能防抖
    // 12px 的盲區 (12 * 12 = 144)，避開 Math.hypot 帶來的浮點數運算開銷
    if (dx * dx + dy * dy < 144) return;

    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += 2 * Math.PI;

    const { snapAngles: currentSnaps, onAngleChange: currentOnChange } = configRef.current;

    // 階梯式卡榫阻尼判定 (Snap Haptics)
    for (const snap of currentSnaps) {
      if (Math.abs(angle - snap) < 0.08 && lastSnap.current !== snap) {
        lastSnap.current = snap;
        angle = snap; // 磁吸對齊卡榫
        triggerHaptic([15, 30, 15]); // 雙階梯微震
        break;
      }
    }
    
    // 脫離卡榫區間時釋放狀態
    if (lastSnap.current !== null && Math.abs(angle - lastSnap.current) >= 0.12) {
      lastSnap.current = null;
    }

    currentOnChange(angle);
  }, [triggerHaptic]); // 依賴陣列極度純淨，不會隨父組件 Render 重建

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerId !== activePointerId.current) return;
    activePointerId.current = null;
    lastSnap.current = null;
    
    // 🌟 優化 3：安全、無錯誤拋出的 Capture 釋放機制
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
