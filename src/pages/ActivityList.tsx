import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, reorderActivities } from '../db';
import { ActivityCard } from '../components/ActivityCard';
import { BottomNav } from '../components/BottomNav';

const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD = 8;

export function ActivityList() {
  const activities = useLiveQuery(() =>
    db.activities.orderBy('sortOrder').toArray()
  );

  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [localOrder, setLocalOrder] = useState<number[]>([]);

  const longPressTimer = useRef<ReturnType<typeof setTimeout>>();
  const startY = useRef(0);
  const dragStartIndex = useRef(0);
  const slotHeight = useRef(0);
  const localOrderRef = useRef<number[]>([]);
  const preventClickRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const preDragCleanupRef = useRef<(() => void) | null>(null);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }
    if (preDragCleanupRef.current) {
      preDragCleanupRef.current();
    }
  }, []);

  useEffect(() => () => cancelLongPress(), [cancelLongPress]);

  const handlePointerDown = useCallback((activityId: number, e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (!activities || activities.length < 2) return;

    const clientY = e.clientY;
    startY.current = clientY;

    const onPreDragMove = (moveEvent: PointerEvent) => {
      if (Math.abs(moveEvent.clientY - clientY) > MOVE_THRESHOLD) {
        cancelLongPress();
      }
    };

    const cleanupPreDrag = () => {
      document.removeEventListener('pointermove', onPreDragMove);
      document.removeEventListener('pointerup', cleanupPreDrag);
      preDragCleanupRef.current = null;
    };

    document.addEventListener('pointermove', onPreDragMove);
    document.addEventListener('pointerup', cleanupPreDrag);
    preDragCleanupRef.current = cleanupPreDrag;

    longPressTimer.current = setTimeout(() => {
      cleanupPreDrag();

      if (!listRef.current || !activities) return;

      const items = listRef.current.querySelectorAll('[data-activity-id]');
      if (items.length >= 2) {
        const rect0 = items[0].getBoundingClientRect();
        const rect1 = items[1].getBoundingClientRect();
        slotHeight.current = rect1.top - rect0.top;
      } else {
        slotHeight.current = items[0].getBoundingClientRect().height + 16;
      }

      const order = activities.map(a => a.id);
      const idx = order.indexOf(activityId);
      dragStartIndex.current = idx;
      localOrderRef.current = order;

      setLocalOrder(order);
      setDraggedId(activityId);
      setDragOffset(0);

      if (navigator.vibrate) navigator.vibrate(50);
    }, LONG_PRESS_MS);
  }, [activities, cancelLongPress]);

  useEffect(() => {
    if (draggedId === null) return;

    const handleMove = (e: PointerEvent) => {
      const dy = e.clientY - startY.current;
      setDragOffset(dy);

      const targetIdx = Math.max(
        0,
        Math.min(
          localOrderRef.current.length - 1,
          dragStartIndex.current + Math.round(dy / slotHeight.current)
        )
      );

      const currentIdx = localOrderRef.current.indexOf(draggedId);
      if (targetIdx !== currentIdx) {
        const newOrder = [...localOrderRef.current];
        newOrder.splice(currentIdx, 1);
        newOrder.splice(targetIdx, 0, draggedId);
        localOrderRef.current = newOrder;
        setLocalOrder(newOrder);
      }
    };

    const handleUp = () => {
      reorderActivities(localOrderRef.current);
      setDraggedId(null);
      setDragOffset(0);
      preventClickRef.current = true;
      setTimeout(() => { preventClickRef.current = false; }, 300);
    };

    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
    document.addEventListener('pointercancel', handleUp);
    document.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
      document.removeEventListener('pointercancel', handleUp);
      document.removeEventListener('touchmove', preventScroll);
    };
  }, [draggedId]);

  useEffect(() => {
    const handleScroll = () => cancelLongPress();
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [cancelLongPress]);

  if (activities === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  const isDragging = draggedId !== null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Activities</h1>
          <Link
            to="/activity/new"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            + New
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No activities yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first activity to start tracking your progress.
            </p>
            <Link
              to="/activity/new"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Create Activity
            </Link>
          </div>
        ) : (
          <div ref={listRef} className="space-y-4">
            {activities.map((activity, dbIndex) => {
              const isThisDragged = activity.id === draggedId;
              let translateY = 0;

              if (isDragging) {
                if (isThisDragged) {
                  translateY = dragOffset;
                } else {
                  const visualIndex = localOrder.indexOf(activity.id);
                  const positionDiff = visualIndex >= 0 ? visualIndex - dbIndex : 0;
                  translateY = positionDiff * slotHeight.current;
                }
              }

              return (
                <div
                  key={activity.id}
                  data-activity-id={activity.id}
                  onPointerDown={(e) => handlePointerDown(activity.id, e)}
                  onClickCapture={(e) => {
                    if (preventClickRef.current) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  style={{
                    transform: isDragging
                      ? `translateY(${translateY}px)${isThisDragged ? ' scale(1.03)' : ''}`
                      : undefined,
                    transition: isThisDragged
                      ? 'box-shadow 200ms ease'
                      : isDragging
                        ? 'transform 200ms ease'
                        : undefined,
                    zIndex: isThisDragged ? 50 : isDragging ? 1 : undefined,
                    position: 'relative',
                    WebkitTouchCallout: 'none',
                    userSelect: isDragging ? 'none' : undefined,
                  }}
                  className={isThisDragged ? 'shadow-lg rounded-xl' : ''}
                >
                  <ActivityCard activity={activity} />
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
