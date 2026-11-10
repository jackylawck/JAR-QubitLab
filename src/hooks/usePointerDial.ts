// src/hooks/usePointerDial.ts
import { useRef, useCallback } from 'react';

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

  const triggerHaptic = useCallback((pattern: number | number[] = 12) => {
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, [hapticEnabled]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
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
    e.preventDefault();

    const dx = e.clientX - centerPos.current.x;
    const dy = e.clientY - centerPos.current.y;
    const dist = Math.hypot(dx, dy);

    // 12px 內圈盲區防抖
    if (dist < 12) return;

    // 計算當前極坐標角度 [0, 2π)
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += 2 * Math.PI;

    // 階梯式卡榫阻尼判定 (Snap Haptics)
    for (const snap of snapAngles) {
      if (Math.abs(angle - snap) < 0.08 && lastSnap.current !== snap) {
        lastSnap.current = snap;
        angle = snap; // 磁吸對齊卡榫
        triggerHaptic([15, 30, 15]); // 雙階梯微震
        break;
      }
      if (lastSnap.current && Math.abs(angle - lastSnap.current) >= 0.12) {
        lastSnap.current = null;
      }
    }

    onAngleChange(angle);
  }, [onAngleChange, snapAngles, triggerHaptic]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerId !== activePointerId.current) return;
    activePointerId.current = null;
    lastSnap.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
  }, []);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  };
}
