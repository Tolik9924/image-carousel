import { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { computeLayout } from '@/shared/utils/computeLayout';
import { GAP } from '@/shared/constants/constants';
import styles from './CarouselSkeleton.module.css';

export function CarouselSkeleton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.getBoundingClientRect().width;
    if (w > 0) setContainerWidth(w);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setContainerWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { visibleCount, itemWidth } = computeLayout(containerWidth);

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <div className={styles.viewport}>
        <div className={styles.track} style={{ gap: GAP }}>
          {Array.from({ length: visibleCount }, (_, i) => (
            <div key={i} className={styles.item} style={{ width: itemWidth }}>
              <div className={styles.image} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
