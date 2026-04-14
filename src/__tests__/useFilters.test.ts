/**
 * @vitest-environment jsdom
 *
 * renderHook from @testing-library/react requires a DOM environment.
 * This overrides the global `environment: 'node'` for this file only.
 */

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Space } from '@/types';

// ── Mocks ─────────────────────────────────────────────────────────────────────

// next/navigation — return stable, no-op implementations
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/discovery',
}));

// filterUtils — return spaces as-is so these tests are independent of filter logic
vi.mock('@/lib/filterUtils', () => ({
  applyFilters: (spaces: Space[]) => spaces,
}));

// Import after mocks are registered
import { useFilters } from '@/hooks/useFilters';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSpace(overrides: Partial<Space> = {}): Space {
  return {
    id: '1',
    name: 'Test Space',
    description: 'desc',
    category: 'coworking',
    city: 'Boston',
    address: '1 Main St',
    pricePerHour: 100,
    capacity: 10,
    amenities: [],
    rating: 4.0,
    reviewCount: 5,
    images: [],
    hostId: 'host-1',
    isAvailable: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

const SPACES = [makeSpace({ id: '1' }), makeSpace({ id: '2' })];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useFilters', () => {
  describe('initial state', () => {
    it('has kind "empty" when no URL params are present', () => {
      const { result } = renderHook(() => useFilters(SPACES));
      expect(result.current.filters.kind).toBe('empty');
    });

    it('activeFilterCount is 0 on initial empty state', () => {
      const { result } = renderHook(() => useFilters(SPACES));
      expect(result.current.activeFilterCount).toBe(0);
    });

    it('sortedSpaces equals input spaces on initial render', () => {
      const { result } = renderHook(() => useFilters(SPACES));
      expect(result.current.sortedSpaces).toHaveLength(SPACES.length);
    });
  });

  describe('setFilter', () => {
    it('transitions kind to "active" when searchQuery is set', () => {
      const { result } = renderHook(() => useFilters(SPACES));

      act(() => {
        result.current.setFilter('searchQuery', 'boston');
      });

      expect(result.current.filters.kind).toBe('active');
    });

    it('stores the correct searchQuery value', () => {
      const { result } = renderHook(() => useFilters(SPACES));

      act(() => {
        result.current.setFilter('searchQuery', 'boston');
      });

      if (result.current.filters.kind !== 'active') throw new Error('expected active');
      expect(result.current.filters.searchQuery).toBe('boston');
    });

    it('transitions kind to "active" when categories are set', () => {
      const { result } = renderHook(() => useFilters(SPACES));

      act(() => {
        result.current.setFilter('categories', ['coworking']);
      });

      expect(result.current.filters.kind).toBe('active');
      if (result.current.filters.kind !== 'active') throw new Error('expected active');
      expect(result.current.filters.categories).toEqual(['coworking']);
    });

    it('transitions kind to "active" when minRating is set', () => {
      const { result } = renderHook(() => useFilters(SPACES));

      act(() => {
        result.current.setFilter('minRating', 4);
      });

      expect(result.current.filters.kind).toBe('active');
      if (result.current.filters.kind !== 'active') throw new Error('expected active');
      expect(result.current.filters.minRating).toBe(4);
    });

    it('preserves existing fields when updating a second filter', () => {
      const { result } = renderHook(() => useFilters(SPACES));

      act(() => { result.current.setFilter('searchQuery', 'boston'); });
      act(() => { result.current.setFilter('categories', ['studio']); });

      if (result.current.filters.kind !== 'active') throw new Error('expected active');
      expect(result.current.filters.searchQuery).toBe('boston');
      expect(result.current.filters.categories).toEqual(['studio']);
    });
  });

  describe('clearAllFilters', () => {
    it('resets kind back to "empty"', () => {
      const { result } = renderHook(() => useFilters(SPACES));

      act(() => { result.current.setFilter('searchQuery', 'boston'); });
      expect(result.current.filters.kind).toBe('active');

      act(() => { result.current.clearAllFilters(); });
      expect(result.current.filters.kind).toBe('empty');
    });

    it('resets kind to "empty" after multiple filters are set', () => {
      const { result } = renderHook(() => useFilters(SPACES));

      act(() => { result.current.setFilter('categories', ['coworking']); });
      act(() => { result.current.setFilter('minRating', 3); });
      act(() => { result.current.setFilter('searchQuery', 'hub'); });

      act(() => { result.current.clearAllFilters(); });
      expect(result.current.filters.kind).toBe('empty');
    });
  });

  describe('activeFilterCount', () => {
    it('is 0 on empty state', () => {
      const { result } = renderHook(() => useFilters(SPACES));
      expect(result.current.activeFilterCount).toBe(0);
    });

    it('increments to 1 when searchQuery is set', () => {
      const { result } = renderHook(() => useFilters(SPACES));

      act(() => { result.current.setFilter('searchQuery', 'boston'); });
      expect(result.current.activeFilterCount).toBe(1);
    });

    it('increments to 2 when two independent filters are set', () => {
      const { result } = renderHook(() => useFilters(SPACES));

      act(() => { result.current.setFilter('searchQuery', 'boston'); });
      act(() => { result.current.setFilter('categories', ['coworking']); });
      expect(result.current.activeFilterCount).toBe(2);
    });

    it('increments once per filter type, not per value', () => {
      const { result } = renderHook(() => useFilters(SPACES));

      // Setting multiple cities counts as 1 filter, not 2
      act(() => { result.current.setFilter('cities', ['Boston', 'Austin']); });
      expect(result.current.activeFilterCount).toBe(1);
    });

    it('drops back to 0 after clearAllFilters', () => {
      const { result } = renderHook(() => useFilters(SPACES));

      act(() => { result.current.setFilter('searchQuery', 'boston'); });
      act(() => { result.current.setFilter('minRating', 4); });
      expect(result.current.activeFilterCount).toBe(2);

      act(() => { result.current.clearAllFilters(); });
      expect(result.current.activeFilterCount).toBe(0);
    });
  });
});
