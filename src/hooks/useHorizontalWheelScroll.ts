'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Turns a vertical mouse wheel into horizontal movement while an overflow
 * container can continue in that direction. Native trackpad and touch
 * gestures remain untouched, and page scrolling is released at each end.
 */
export default function useHorizontalWheelScroll(
  viewportRef: RefObject<HTMLElement | null>,
  dependencies: readonly unknown[] = [],
) {
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let frame = 0;
    let pendingDelta = 0;

    const handleWheel = (event: WheelEvent) => {
      if (
        !window.matchMedia('(min-width: 1024px)').matches ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX)
      ) {
        return;
      }

      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      const isAtStart = viewport.scrollLeft <= 1;
      const isAtEnd = viewport.scrollLeft >= maxScroll - 1;
      const isMovingForward = event.deltaY > 0;

      if (maxScroll <= 0 || (isMovingForward && isAtEnd) || (!isMovingForward && isAtStart)) {
        return;
      }

      event.preventDefault();
      pendingDelta += event.deltaY;

      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        viewport.scrollLeft += pendingDelta;
        pendingDelta = 0;
        frame = 0;
      });
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      viewport.removeEventListener('wheel', handleWheel);
    };
  // The supplied list lets carousels reset the listener when their cards change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewportRef, ...dependencies]);
}
