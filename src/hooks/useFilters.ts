'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { applyFilters } from '@/lib/filterUtils';
import { sortSpaces } from '@/lib/sortUtils';
import { debounce } from '@/lib/debounce';
import { filterStateToParams, paramsToFilterState } from '@/lib/urlParams';
import type { FilterState, Space, SortOption } from '@/types';

// ── Internal types ────────────────────────────────────────────────────────────

/** The 'active' variant of FilterState with 'kind' stripped for convenience. */
type ActiveFilters = Omit<Extract<FilterState, { kind: 'active' }>, 'kind'>;
type FilterKey = keyof ActiveFilters;

const FILTER_DEFAULTS: ActiveFilters = {
  categories: [],
  cities: [],
  priceRange: null,
  capacityRange: null,
  amenities: [],
  minRating: null,
  searchQuery: '',
};

const DEFAULT_SORT: SortOption = 'newest';

// ── Active-filter counter ─────────────────────────────────────────────────────

function countActiveFilters(filters: FilterState): number {
  if (filters.kind === 'empty') return 0;
  let count = 0;
  if (filters.categories.length > 0) count++;
  if (filters.cities.length > 0) count++;
  if (filters.priceRange !== null) count++;
  if (filters.capacityRange !== null) count++;
  if (filters.amenities.length > 0) count++;
  if (filters.minRating !== null) count++;
  if (filters.searchQuery.trim().length > 0) count++;
  return count;
}

// ── Return type ───────────────────────────────────────────────────────────────

interface UseFiltersResult {
  filters: FilterState;
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
  /** Type-safe setter for any individual filter field. */
  setFilter: <K extends FilterKey>(key: K, value: ActiveFilters[K]) => void;
  /** Resets one field to its default (empty array / null / ''). */
  clearFilter: (key: FilterKey) => void;
  clearAllFilters: () => void;
  /** Count of fields that deviate from their default value. */
  activeFilterCount: number;
  filteredSpaces: Space[];
  sortedSpaces: Space[];
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Manages filter + sort state, keeping it bi-directionally synced to the URL.
 *
 * - All filter changes are reflected in the URL so the page survives refresh.
 * - `searchQuery` changes debounce the URL update by 300 ms (using the local
 *   debounce utility) so the browser history isn't flooded while the user types.
 * - All other filter changes update the URL immediately.
 *
 * **Note:** `useSearchParams` requires a `<Suspense>` boundary around the
 * consuming component in Next.js App Router.
 */
export function useFilters(spaces: Space[]): UseFiltersResult {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ── State ─────────────────────────────────────────────────────────────────

  // Initialise from URL on first render (lazy initialiser)
  const [filters, setFilters] = useState<FilterState>(() =>
    paramsToFilterState(searchParams),
  );
  const [sortBy, setSortBy] = useState<SortOption>(DEFAULT_SORT);

  // Keep a ref to the latest router + pathname so the debounced callback
  // always uses the current values without needing to be recreated.
  const routerRef = useRef(router);
  const pathnameRef = useRef(pathname);
  useEffect(() => { routerRef.current = router; }, [router]);
  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

  // ── URL sync ──────────────────────────────────────────────────────────────

  const syncToUrl = useCallback((newFilters: FilterState) => {
    const params = filterStateToParams(newFilters);
    const qs = params.toString();
    routerRef.current.replace(
      `${pathnameRef.current}${qs ? `?${qs}` : ''}`,
      { scroll: false },
    );
  }, []); // stable — reads router/pathname from refs

  // Debounced variant used exclusively for searchQuery updates
  const debouncedSyncToUrl = useMemo(
    () => debounce((newFilters: FilterState) => syncToUrl(newFilters), 300),
    [syncToUrl],
  );

  // ── Public filter setters ─────────────────────────────────────────────────

  const setFilter = useCallback(
    <K extends FilterKey>(key: K, value: ActiveFilters[K]): void => {
      setFilters((prev) => {
        const current: ActiveFilters =
          prev.kind === 'active'
            ? { ...FILTER_DEFAULTS, ...prev }
            : { ...FILTER_DEFAULTS };

        const next: FilterState = {
          kind: 'active',
          ...current,
          [key]: value,
        };

        if (key === 'searchQuery') {
          debouncedSyncToUrl(next);
        } else {
          syncToUrl(next);
        }

        return next;
      });
    },
    [debouncedSyncToUrl, syncToUrl],
  );

  const clearFilter = useCallback(
    (key: FilterKey): void => {
      setFilter(key, FILTER_DEFAULTS[key]);
    },
    [setFilter],
  );

  const clearAllFilters = useCallback((): void => {
    const empty: FilterState = { kind: 'empty' };
    setFilters(empty);
    syncToUrl(empty);
  }, [syncToUrl]);

  // ── Derived values ────────────────────────────────────────────────────────

  const filteredSpaces = useMemo(
    () => applyFilters(spaces, filters),
    [spaces, filters],
  );

  const sortedSpaces = useMemo(
    () => sortSpaces(filteredSpaces, sortBy),
    [filteredSpaces, sortBy],
  );

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters],
  );

  return {
    filters,
    sortBy,
    setSortBy,
    setFilter,
    clearFilter,
    clearAllFilters,
    activeFilterCount,
    filteredSpaces,
    sortedSpaces,
  };
}
