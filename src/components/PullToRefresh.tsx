import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';

const THRESHOLD = 80;
const MAX_PULL = 130;
const RESISTANCE = 0.4;

export function PullToRefresh({ children }: { children: ReactNode }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAtTop = useCallback(() => {
    return window.scrollY <= 0;
  }, []);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (refreshing) return;
      if (!isAtTop()) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current || refreshing) return;

      const dy = e.touches[0].clientY - startY.current;
      if (dy < 0) {
        pulling.current = false;
        setPullDistance(0);
        return;
      }

      if (dy > 10 && isAtTop()) {
        const distance = Math.min(dy * RESISTANCE, MAX_PULL);
        setPullDistance(distance);
      }
    };

    const onTouchEnd = () => {
      if (!pulling.current && pullDistance === 0) return;
      pulling.current = false;

      if (pullDistance >= THRESHOLD) {
        setRefreshing(true);
        setPullDistance(THRESHOLD);
        window.location.reload();
      } else {
        setPullDistance(0);
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [pullDistance, refreshing, isAtTop]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const rotation = progress * 360;
  const showIndicator = pullDistance > 10;

  return (
    <div ref={containerRef}>
      {showIndicator && (
        <div
          className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none"
          style={{ paddingTop: pullDistance - 40 }}
        >
          <div
            className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"
            style={{ opacity: Math.min(progress * 1.5, 1) }}
          >
            {refreshing ? (
              <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M1 4v6h6M3.51 15a9 9 0 102.13-9.36L1 10"
                />
              </svg>
            )}
          </div>
        </div>
      )}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: pulling.current ? undefined : 'transform 300ms ease',
        }}
      >
        {children}
      </div>
    </div>
  );
}
