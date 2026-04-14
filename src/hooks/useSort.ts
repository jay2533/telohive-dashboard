'use client';

import { useMemo } from 'react';
import { sortSpaces } from '@/lib/sortUtils';
import type { Space, SortOption } from '@/types';

/**
 * Memoised wrapper around `sortSpaces`.
 * Returns a new sorted array whenever `spaces` or `sortBy` changes.
 * The original `spaces` array is never mutated.
 */
export function useSort(spaces: Space[], sortBy: SortOption): Space[] {
  return useMemo(() => sortSpaces(spaces, sortBy), [spaces, sortBy]);
}
