import { useState, useRef, useCallback } from 'react';
import { useCarousel, CAROUSEL_GAP, TRANSITION_MS } from '../../hooks/useCarousel';
import { ChevronLeft } from '@/assets/ChevronLeft';
import { ChevronRight } from '@/assets/ChevronRight';
import { CheckIcon } from '@/assets/CheckIcon';
import { CloseIcon } from '@/assets/CloseIcon';
import { getThumbUrl } from '@/shared/utils/getThumbUrl';
import styles from './Carousel.module.css';

const DRAG_THRESHOLD = 50;

type CarouselProps = {
  images: string[];
};

export const Carousel = ({ images }: CarouselProps) => {
  const {
    containerRef,
    clonedImages,
    translateX,
    transitionEnabled,
    itemWidth,
    isReady,
    onTransitionEnd,
    goNext,
    goPrev,
  } = useCarousel(images);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback(
    (url: string) => {
      if (removing.has(url)) return;
      if (selected.has(url)) {
        setRemoving((prev) => new Set([...prev, url]));
        setTimeout(() => {
          setSelected((prev) => {
            const next = new Set(prev);
            next.delete(url);
            return next;
          });
          setRemoving((prev) => {
            const next = new Set(prev);
            next.delete(url);
            return next;
          });
        }, 260);
      } else {
        setSelected((prev) => new Set([...prev, url]));
      }
    },
    [selected, removing],
  );

  const pointerStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const handlePointerDown = useCallback((clientX: number) => {
    pointerStartX.current = clientX;
    isDragging.current = false;
  }, []);

  const handlePointerMove = useCallback((clientX: number) => {
    if (pointerStartX.current !== null) {
      if (Math.abs(clientX - pointerStartX.current) > 5) {
        isDragging.current = true;
      }
    }
  }, []);

  const handlePointerUp = useCallback(
    (clientX: number) => {
      if (pointerStartX.current === null) return;
      const delta = clientX - pointerStartX.current;
      pointerStartX.current = null;
      if (Math.abs(delta) > DRAG_THRESHOLD) {
        if (delta < 0) {
          goNext();
        } else {
          goPrev();
        }
      }
      setTimeout(() => {
        isDragging.current = false;
      }, 0);
    },
    [goNext, goPrev],
  );

  const clearAll = useCallback(() => {
    setSelected(new Set());
    setRemoving(new Set());
  }, []);

  const handleItemClick = useCallback(
    (url: string) => {
      if (!isDragging.current) {
        toggleSelect(url);
      }
    },
    [toggleSelect],
  );

  const selectedList = [...selected].filter((url) => images.includes(url));

  return (
    <div className={styles.carouselWrapper}>
      <div
        className={`${styles.carousel}${isReady && ` ${styles.carouselReady}`}`}
        ref={containerRef}
        style={isReady ? { minHeight: Math.round(itemWidth * (2 / 3)) } : undefined}
      >
        <div
          className={styles.carouselViewport}
          onMouseDown={(e) => handlePointerDown(e.clientX)}
          onMouseMove={(e) => handlePointerMove(e.clientX)}
          onMouseUp={(e) => handlePointerUp(e.clientX)}
          onMouseLeave={() => {
            pointerStartX.current = null;
            isDragging.current = false;
          }}
          onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
          onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
          onTouchEnd={(e) => handlePointerUp(e.changedTouches[0].clientX)}
        >
          <div
            className={styles.carouselTrack}
            style={{
              transform: `translateX(${translateX}px)`,
              transition: transitionEnabled
                ? `transform ${TRANSITION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                : 'none',
              gap: `${CAROUSEL_GAP}px`,
            }}
            onTransitionEnd={onTransitionEnd}
          >
            {clonedImages.map((url, i) => {
              const isSelected = selected.has(url);
              return (
                <div
                  key={i}
                  className={`${styles.carouselItem}${isSelected ? ` ${styles.carouselItemSelected}` : ''}`}
                  style={{ width: itemWidth }}
                  onClick={() => handleItemClick(url)}
                  role="button"
                  tabIndex={-1}
                  aria-pressed={isSelected}
                  aria-label={`Image ${i + 1}${isSelected ? ', selected' : ''}`}
                >
                  <div className={styles.carouselItemInner}>
                    <img className={styles.carouselItemImg} src={url} alt="" draggable={false} />
                    <div className={styles.carouselItemOverlay} />
                    <div className={styles.carouselItemCheck} aria-hidden="true">
                      <CheckIcon />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`}
          onClick={goPrev}
          aria-label="Previous image"
        >
          <ChevronLeft />
        </button>
        <button
          className={`${styles.carouselBtn} ${styles.carouselBtnNext}`}
          onClick={goNext}
          aria-label="Next image"
        >
          <ChevronRight />
        </button>
      </div>

      {selectedList.length > 0 && (
        <div className={styles.selectedList}>
          <div className={styles.selectedListHeader}>
            <h3 className={styles.selectedListTitle}>Selected</h3>
            <span className={styles.selectedListCount}>{selectedList.length}</span>
            <button className={styles.selectedListClearAll} onClick={clearAll}>
              Clear all
            </button>
          </div>
          <div className={styles.selectedListGrid}>
            {selectedList.map((url) => (
              <div
                key={url}
                className={`${styles.selectedListItem}${removing.has(url) ? ` ${styles.selectedListItemRemoving}` : ''}`}
              >
                <img
                  className={styles.selectedListItemImg}
                  src={getThumbUrl(url)}
                  alt=""
                  draggable={false}
                />
                <button
                  className={styles.selectedListItemRemove}
                  onClick={() => toggleSelect(url)}
                  aria-label="Remove from selection"
                >
                  <CloseIcon />
                </button>
                <div className={styles.selectedListItemUrl} title={url}>
                  {url.split('/').slice(-3).join('/')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
