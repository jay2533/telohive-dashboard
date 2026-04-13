import { describe, expect, it } from 'vitest';
import { applyFilters } from '@/lib/filterUtils';
import type { FilterState, Space } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSpace(overrides: Partial<Space> = {}): Space {
  return {
    id: 'space-1',
    name: 'Bright Coworking',
    description: 'A sunny open-plan workspace',
    category: 'coworking',
    city: 'New York',
    address: '1 Main St',
    pricePerHour: 20,
    capacity: 10,
    amenities: ['wifi', 'coffee'],
    rating: 4.0,
    reviewCount: 10,
    images: [],
    hostId: 'host-1',
    isAvailable: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

const EMPTY: FilterState = { kind: 'empty' };

function active(overrides: Partial<Exclude<FilterState, { kind: 'empty' }>> = {}): FilterState {
  return {
    kind: 'active',
    categories: [],
    cities: [],
    priceRange: null,
    capacityRange: null,
    amenities: [],
    minRating: null,
    searchQuery: '',
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('applyFilters', () => {
  // ── Empty filter state ────────────────────────────────────────────────────

  describe('empty filter state', () => {
    it('returns all spaces unchanged', () => {
      const spaces = [makeSpace({ id: '1' }), makeSpace({ id: '2' })];
      expect(applyFilters(spaces, EMPTY)).toEqual(spaces);
    });

    it('returns an empty array when there are no spaces', () => {
      expect(applyFilters([], EMPTY)).toEqual([]);
    });
  });

  // ── Active state with all-empty arrays behaves like no-op ─────────────────

  describe('active filter with all empty arrays / nulls', () => {
    it('returns all spaces when no restrictions are set', () => {
      const spaces = [makeSpace({ id: '1' }), makeSpace({ id: '2' })];
      expect(applyFilters(spaces, active())).toEqual(spaces);
    });
  });

  // ── Single filters ────────────────────────────────────────────────────────

  describe('category filter', () => {
    it('returns only spaces matching the selected category', () => {
      const s1 = makeSpace({ id: '1', category: 'coworking' });
      const s2 = makeSpace({ id: '2', category: 'meeting-room' });
      const result = applyFilters([s1, s2], active({ categories: ['coworking'] }));
      expect(result).toEqual([s1]);
    });

    it('matches multiple categories with OR logic', () => {
      const s1 = makeSpace({ id: '1', category: 'coworking' });
      const s2 = makeSpace({ id: '2', category: 'meeting-room' });
      const s3 = makeSpace({ id: '3', category: 'studio' });
      const result = applyFilters(
        [s1, s2, s3],
        active({ categories: ['coworking', 'studio'] }),
      );
      expect(result).toEqual([s1, s3]);
    });

    it('returns nothing when no space matches', () => {
      const spaces = [makeSpace({ category: 'coworking' })];
      expect(applyFilters(spaces, active({ categories: ['studio'] }))).toEqual([]);
    });
  });

  describe('city filter', () => {
    it('returns only spaces in the selected city', () => {
      const s1 = makeSpace({ id: '1', city: 'New York' });
      const s2 = makeSpace({ id: '2', city: 'San Francisco' });
      const result = applyFilters([s1, s2], active({ cities: ['New York'] }));
      expect(result).toEqual([s1]);
    });

    it('matches multiple cities with OR logic', () => {
      const s1 = makeSpace({ id: '1', city: 'New York' });
      const s2 = makeSpace({ id: '2', city: 'Chicago' });
      const s3 = makeSpace({ id: '3', city: 'Austin' });
      const result = applyFilters(
        [s1, s2, s3],
        active({ cities: ['New York', 'Austin'] }),
      );
      expect(result).toEqual([s1, s3]);
    });
  });

  describe('price range filter', () => {
    it('includes spaces within the inclusive range', () => {
      const s1 = makeSpace({ id: '1', pricePerHour: 10 });
      const s2 = makeSpace({ id: '2', pricePerHour: 25 });
      const s3 = makeSpace({ id: '3', pricePerHour: 50 });
      const result = applyFilters(
        [s1, s2, s3],
        active({ priceRange: [10, 25] }),
      );
      expect(result).toEqual([s1, s2]);
    });

    it('excludes spaces outside the range', () => {
      const spaces = [makeSpace({ pricePerHour: 5 }), makeSpace({ pricePerHour: 100 })];
      expect(applyFilters(spaces, active({ priceRange: [10, 50] }))).toEqual([]);
    });

    it('handles an exact-price range (min === max)', () => {
      const s1 = makeSpace({ id: '1', pricePerHour: 30 });
      const s2 = makeSpace({ id: '2', pricePerHour: 31 });
      const result = applyFilters([s1, s2], active({ priceRange: [30, 30] }));
      expect(result).toEqual([s1]);
    });
  });

  describe('capacity range filter', () => {
    it('includes spaces within the inclusive range', () => {
      const s1 = makeSpace({ id: '1', capacity: 5 });
      const s2 = makeSpace({ id: '2', capacity: 20 });
      const s3 = makeSpace({ id: '3', capacity: 100 });
      const result = applyFilters(
        [s1, s2, s3],
        active({ capacityRange: [5, 20] }),
      );
      expect(result).toEqual([s1, s2]);
    });
  });

  describe('amenity filter', () => {
    it('returns only spaces that have the required amenity', () => {
      const s1 = makeSpace({ id: '1', amenities: ['wifi', 'coffee'] });
      const s2 = makeSpace({ id: '2', amenities: ['parking'] });
      const result = applyFilters([s1, s2], active({ amenities: ['wifi'] }));
      expect(result).toEqual([s1]);
    });

    it('uses AND logic — space must have all selected amenities', () => {
      const s1 = makeSpace({ id: '1', amenities: ['wifi', 'coffee', 'parking'] });
      const s2 = makeSpace({ id: '2', amenities: ['wifi', 'coffee'] });
      const result = applyFilters(
        [s1, s2],
        active({ amenities: ['wifi', 'parking'] }),
      );
      expect(result).toEqual([s1]);
    });

    it('returns nothing when no space has all required amenities', () => {
      const spaces = [makeSpace({ amenities: ['wifi'] })];
      expect(
        applyFilters(spaces, active({ amenities: ['wifi', 'kitchen'] })),
      ).toEqual([]);
    });
  });

  describe('min rating filter', () => {
    it('includes spaces at or above the minimum rating', () => {
      const s1 = makeSpace({ id: '1', rating: 3.5 });
      const s2 = makeSpace({ id: '2', rating: 4.0 });
      const s3 = makeSpace({ id: '3', rating: 4.8 });
      const result = applyFilters(
        [s1, s2, s3],
        active({ minRating: 4.0 }),
      );
      expect(result).toEqual([s2, s3]);
    });

    it('excludes spaces below the minimum rating', () => {
      const spaces = [makeSpace({ rating: 2.0 })];
      expect(applyFilters(spaces, active({ minRating: 3.0 }))).toEqual([]);
    });
  });

  describe('search query filter', () => {
    it('matches on space name (case-insensitive)', () => {
      const s1 = makeSpace({ id: '1', name: 'Sunny Coworking Hub', description: 'Great vibes' });
      const s2 = makeSpace({ id: '2', name: 'Private Office', description: 'Quiet and focused' });
      const result = applyFilters([s1, s2], active({ searchQuery: 'sunny' }));
      expect(result).toEqual([s1]);
    });

    it('matches on description', () => {
      const s1 = makeSpace({ id: '1', description: 'Great for team workshops' });
      const s2 = makeSpace({ id: '2', description: 'Quiet solo desk' });
      const result = applyFilters([s1, s2], active({ searchQuery: 'workshop' }));
      expect(result).toEqual([s1]);
    });

    it('matches on city', () => {
      const s1 = makeSpace({ id: '1', city: 'Austin' });
      const s2 = makeSpace({ id: '2', city: 'Boston' });
      const result = applyFilters([s1, s2], active({ searchQuery: 'aust' }));
      expect(result).toEqual([s1]);
    });

    it('ignores leading/trailing whitespace in the query', () => {
      const s1 = makeSpace({ name: 'Focus Room' });
      expect(applyFilters([s1], active({ searchQuery: '  focus  ' }))).toEqual([s1]);
    });

    it('returns all spaces when the query is empty string', () => {
      const spaces = [makeSpace({ id: '1' }), makeSpace({ id: '2' })];
      expect(applyFilters(spaces, active({ searchQuery: '' }))).toEqual(spaces);
    });
  });

  // ── Multiple AND filters ──────────────────────────────────────────────────

  describe('multiple AND filters', () => {
    it('city AND category — both must be satisfied', () => {
      const s1 = makeSpace({ id: '1', city: 'New York', category: 'coworking' });
      const s2 = makeSpace({ id: '2', city: 'New York', category: 'studio' });
      const s3 = makeSpace({ id: '3', city: 'Chicago', category: 'coworking' });
      const result = applyFilters(
        [s1, s2, s3],
        active({ cities: ['New York'], categories: ['coworking'] }),
      );
      expect(result).toEqual([s1]);
    });

    it('price range AND min rating — both must be satisfied', () => {
      const s1 = makeSpace({ id: '1', pricePerHour: 15, rating: 4.5 });
      const s2 = makeSpace({ id: '2', pricePerHour: 15, rating: 3.0 });
      const s3 = makeSpace({ id: '3', pricePerHour: 60, rating: 4.9 });
      const result = applyFilters(
        [s1, s2, s3],
        active({ priceRange: [10, 20], minRating: 4.0 }),
      );
      expect(result).toEqual([s1]);
    });

    it('all filters active — only the exact match is returned', () => {
      const match = makeSpace({
        id: 'match',
        name: 'Perfect Spot',
        description: 'Ideal for teams',
        category: 'meeting-room',
        city: 'Austin',
        pricePerHour: 30,
        capacity: 8,
        amenities: ['wifi', 'projector', 'coffee'],
        rating: 4.7,
      });
      const noMatch = makeSpace({
        id: 'no-match',
        name: 'Random Space',
        description: 'generic',
        category: 'coworking',
        city: 'Boston',
        pricePerHour: 100,
        capacity: 2,
        amenities: ['wifi'],
        rating: 3.0,
      });
      const result = applyFilters(
        [match, noMatch],
        active({
          categories: ['meeting-room'],
          cities: ['Austin'],
          priceRange: [20, 40],
          capacityRange: [5, 15],
          amenities: ['wifi', 'projector'],
          minRating: 4.0,
          searchQuery: 'perfect',
        }),
      );
      expect(result).toEqual([match]);
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('returns empty array when input spaces array is empty', () => {
      expect(
        applyFilters([], active({ categories: ['coworking'] })),
      ).toEqual([]);
    });

    it('does not mutate the original array', () => {
      const spaces = [makeSpace({ id: '1' }), makeSpace({ id: '2' })];
      const frozen = [...spaces];
      applyFilters(spaces, active({ categories: ['coworking'] }));
      expect(spaces).toEqual(frozen);
    });

    it('no spaces match any filter — returns empty array', () => {
      const spaces = [makeSpace({ category: 'studio', city: 'Boston', rating: 2.0 })];
      const result = applyFilters(
        spaces,
        active({ categories: ['coworking'], cities: ['Austin'], minRating: 4.5 }),
      );
      expect(result).toEqual([]);
    });

    it('rating boundary: exactly equal to minRating is included', () => {
      const space = makeSpace({ rating: 3.5 });
      expect(applyFilters([space], active({ minRating: 3.5 }))).toEqual([space]);
    });

    it('price boundary: values at range bounds are included', () => {
      const low = makeSpace({ id: '1', pricePerHour: 10 });
      const high = makeSpace({ id: '2', pricePerHour: 50 });
      const result = applyFilters([low, high], active({ priceRange: [10, 50] }));
      expect(result).toEqual([low, high]);
    });
  });
});
