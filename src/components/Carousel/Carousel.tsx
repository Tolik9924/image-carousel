import { useState, useRef, useCallback } from 'react';
import { useCarousel, CAROUSEL_GAP, TRANSITION_MS } from '../../hooks/useCarousel';
import { ChevronLeft } from '@/assets/ChevronLeft';
import { ChevronRight } from '@/assets/ChevronRight';
import { CheckIcon } from '@/assets/CheckIcon';
import './Carousel.css';
import { getThumbUrl } from '@/shared/utils/getThumbUrl';

const DRAG_THRESHOLD = 50;

type CarouselProps = {
  images: string[];
};

export function Carousel({ images }: CarouselProps) {
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

  // Touch / drag support
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
    <div className="carousel-wrapper">
      <div className={`carousel${isReady ? ' carousel--ready' : ''}`} ref={containerRef}>
        <div
          className="carousel__viewport"
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
            className="carousel__track"
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
                  className={`carousel__item${isSelected ? ' carousel__item--selected' : ''}`}
                  style={{ width: itemWidth }}
                  onClick={() => handleItemClick(url)}
                  role="button"
                  tabIndex={-1}
                  aria-pressed={isSelected}
                  aria-label={`Image ${i + 1}${isSelected ? ', selected' : ''}`}
                >
                  <div className="carousel__item__inner">
                    <img className="carousel__item__img" src={url} alt="" draggable={false} />
                    <div className="carousel__item__overlay" />
                    <div className="carousel__item__check" aria-hidden="true">
                      <CheckIcon />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          className="carousel__btn carousel__btn--prev"
          onClick={goPrev}
          aria-label="Previous image"
        >
          <ChevronLeft />
        </button>
        <button
          className="carousel__btn carousel__btn--next"
          onClick={goNext}
          aria-label="Next image"
        >
          <ChevronRight />
        </button>
      </div>

      {selectedList.length > 0 && (
        <div className="selected-list">
          <div className="selected-list__header">
            <h3 className="selected-list__title">Selected</h3>
            <span className="selected-list__count">{selectedList.length}</span>
          </div>
          <div className="selected-list__grid">
            {selectedList.map((url) => (
              <div
                key={url}
                className={`selected-list__item${removing.has(url) ? ' selected-list__item--removing' : ''}`}
              >
                <img
                  className="selected-list__item__img"
                  src={getThumbUrl(url)}
                  alt=""
                  draggable={false}
                />
                <button
                  className="selected-list__item__remove"
                  onClick={() => toggleSelect(url)}
                  aria-label="Remove from selection"
                >
                  ×
                </button>
                <div className="selected-list__item__url" title={url}>
                  {url.split('/').slice(-3).join('/')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
