import { GAP } from '../constants/constants';

type Layout = {
  visibleCount: number;
  itemWidth: number;
};

const MIN_ITEM_WIDTH = 140;
const MAX_VISIBLE = 5;

export const computeLayout = (cw: number): Layout => {
  if (cw <= 0) return { visibleCount: 1, itemWidth: 300 };
  if (cw < 600) return { visibleCount: 1, itemWidth: cw };
  const count = Math.max(1, Math.min(MAX_VISIBLE, Math.floor((cw + GAP) / (MIN_ITEM_WIDTH + GAP))));
  const width = (cw - (count - 1) * GAP) / count;
  return { visibleCount: count, itemWidth: width };
};
