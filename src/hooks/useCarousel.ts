import { GAP } from '@/shared/constants/constants';
import { computeLayout } from '@/shared/utils/computeLayout';
import type { RefObject } from 'react';
import { useState, useRef, useCallback, useEffect, useMemo, useLayoutEffect } from 'react';

export const CAROUSEL_GAP = GAP;
export const TRANSITION_MS = 430;

export type UseCarouselReturn = {
  containerRef: RefObject<HTMLDivElement | null>;
  clonedImages: string[];
  translateX: number;
  transitionEnabled: boolean;
  itemWidth: number;
  isReady: boolean;
  onTransitionEnd: () => void;
  goNext: () => void;
  goPrev: () => void;
};

export const useCarousel = (images: string[]): UseCarouselReturn => {
  const n = images.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const isAnimating = useRef(false);
  const trackIndexRef = useRef(1);
  const cloneCountRef = useRef(1);

  const { visibleCount, itemWidth } = useMemo(
    () => computeLayout(containerWidth),
    [containerWidth],
  );

  const cloneCount = n > 0 ? Math.min(visibleCount, n) : 0;

  useEffect(() => {
    cloneCountRef.current = cloneCount;
  }, [cloneCount]);

  const clonedImages = useMemo(() => {
    if (n === 0) return [];
    const head = images.slice(-cloneCount);
    const tail = images.slice(0, cloneCount);
    return [...head, ...images, ...tail];
  }, [images, cloneCount, n]);

  const [trackIndex, setTrackIndexState] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const setTrackIndex = useCallback((idx: number) => {
    trackIndexRef.current = idx;
    setTrackIndexState(idx);
  }, []);

  const prevCloneCount = useRef(1);
  useEffect(() => {
    const oldCC = prevCloneCount.current;
    if (oldCC === cloneCount || cloneCount === 0) {
      prevCloneCount.current = cloneCount;
      return;
    }
    const realIdx = (((trackIndexRef.current - oldCC) % n) + n) % n;
    prevCloneCount.current = cloneCount;
    setTransitionEnabled(false);
    setTrackIndex(realIdx + cloneCount);
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => setTransitionEnabled(true));
      return id2;
    });
    return () => cancelAnimationFrame(id1);
  }, [cloneCount, n, setTrackIndex]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.getBoundingClientRect().width;
    if (w > 0) {
      setContainerWidth(w);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) {
        setContainerWidth(w);
        setIsReady(true);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onTransitionEnd = useCallback(() => {
    isAnimating.current = false;
    const ti = trackIndexRef.current;
    const cc = cloneCountRef.current;

    if (ti >= n + cc) {
      setTransitionEnabled(false);
      setTrackIndex(ti - n);
      requestAnimationFrame(() => requestAnimationFrame(() => setTransitionEnabled(true)));
    } else if (ti < cc) {
      setTransitionEnabled(false);
      setTrackIndex(ti + n);
      requestAnimationFrame(() => requestAnimationFrame(() => setTransitionEnabled(true)));
    }
  }, [n, setTrackIndex]);

  const goNext = useCallback(() => {
    if (isAnimating.current || n === 0) return;
    isAnimating.current = true;
    setTransitionEnabled(true);
    setTrackIndex(trackIndexRef.current + 1);
  }, [n, setTrackIndex]);

  const goPrev = useCallback(() => {
    if (isAnimating.current || n === 0) return;
    isAnimating.current = true;
    setTransitionEnabled(true);
    setTrackIndex(trackIndexRef.current - 1);
  }, [n, setTrackIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const translateX = -(trackIndex * (itemWidth + GAP));

  return {
    containerRef,
    clonedImages,
    translateX,
    transitionEnabled,
    itemWidth,
    isReady,
    onTransitionEnd,
    goNext,
    goPrev,
  };
};
