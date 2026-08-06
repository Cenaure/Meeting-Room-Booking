import {RefObject, useEffect, useRef, useState} from "react";

const LONG_PRESS_MS = 400;
const MOVE_TOLERANCE = 8;

// This hook is used to detect dragging and long press on touch devices
// It makes it able to scroll or create a selection on a week grid for mobile devices
export function useIntervalDrag(
  columnRef: RefObject<HTMLDivElement | null>,
  onStartSelection: (y: number) => void,
  onExpandSelection: (y: number) => void,
) {
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);

  const cancelTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const localY = (clientY: number) => {
    const rect = columnRef.current?.getBoundingClientRect();
    return rect ? clientY - rect.top : 0;
  };

  useEffect(() => {
    const stop = () => {
      cancelTimer();
      setIsDragging(false);
      originRef.current = null;
    };

    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);

    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      cancelTimer();
    };
  }, [cancelTimer]);

  useEffect(() => {
    const el = columnRef.current;
    if (!el || !isDragging) return;
    const block = (e: TouchEvent) => e.preventDefault();
    el.addEventListener("touchmove", block, { passive: false });
    return () => el.removeEventListener("touchmove", block);
  }, [isDragging, columnRef]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const y = localY(e.clientY);

    if (e.pointerType === "touch") {
      originRef.current = { x: e.clientX, y: e.clientY };
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setIsDragging(true);
        navigator.vibrate?.(10);
        onStartSelection(y);
      }, LONG_PRESS_MS);
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    onStartSelection(y);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (timerRef.current && originRef.current) {
      const dx = Math.abs(e.clientX - originRef.current.x);
      const dy = Math.abs(e.clientY - originRef.current.y);
      if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) cancelTimer();
      return;
    }
    if (isDragging) onExpandSelection(localY(e.clientY));
  };

  return { isDragging, handlers: { onPointerDown, onPointerMove } };
}