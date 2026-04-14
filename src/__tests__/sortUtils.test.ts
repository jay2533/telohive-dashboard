import { describe, expect, it } from 'vitest';
import { sortSpaces } from '@/lib/sortUtils';
import type { Space, SortOption } from '@/types';

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
    rating: 3.0,
    reviewCount: 5,
    images: [],
    hostId: 'host-1',
    isAvailable: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// Five spaces with deliberately varied fields so every sort order is unambiguous.
//
// id | price | rating | capacity | createdAt
// ---+-------+--------+----------+-----------
//  1 |    50 |    4.8 |      100 | 2024-05-01
//  2 |   200 |    3.2 |       20 | 2024-01-01
//  3 |    10 |    4.5 |       50 | 2024-03-15
//  4 |   150 |    2.0 |      200 | 2024-07-20
//  5 |    75 |    5.0 |        5 | 2024-02-10
const SPACES: Space[] = [
  makeSpace({ id: '1', pricePerHour: 50,  rating: 4.8, capacity: 100, createdAt: '2024-05-01T00:00:00Z' }),
  makeSpace({ id: '2', pricePerHour: 200, rating: 3.2, capacity: 20,  createdAt: '2024-01-01T00:00:00Z' }),
  makeSpace({ id: '3', pricePerHour: 10,  rating: 4.5, capacity: 50,  createdAt: '2024-03-15T00:00:00Z' }),
  makeSpace({ id: '4', pricePerHour: 150, rating: 2.0, capacity: 200, createdAt: '2024-07-20T00:00:00Z' }),
  makeSpace({ id: '5', pricePerHour: 75,  rating: 5.0, capacity: 5,   createdAt: '2024-02-10T00:00:00Z' }),
];

function ids(spaces: Space[]): string[] {
  return spaces.map((s) => s.id);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('sortSpaces', () => {
  describe('price_asc', () => {
    it('sorts lowest price first', () => {
      expect(ids(sortSpaces(SPACES, 'price_asc'))).toEqual(['3', '1', '5', '4', '2']);
    });
  });

  describe('price_desc', () => {
    it('sorts highest price first', () => {
      expect(ids(sortSpaces(SPACES, 'price_desc'))).toEqual(['2', '4', '5', '1', '3']);
    });
  });

  describe('rating_desc', () => {
    it('sorts highest rating first', () => {
      expect(ids(sortSpaces(SPACES, 'rating_desc'))).toEqual(['5', '1', '3', '2', '4']);
    });
  });

  describe('capacity_asc', () => {
    it('sorts smallest capacity first', () => {
      expect(ids(sortSpaces(SPACES, 'capacity_asc'))).toEqual(['5', '2', '3', '1', '4']);
    });
  });

  describe('capacity_desc', () => {
    it('sorts largest capacity first', () => {
      expect(ids(sortSpaces(SPACES, 'capacity_desc'))).toEqual(['4', '1', '3', '2', '5']);
    });
  });

  describe('newest', () => {
    it('sorts most recently created first', () => {
      // createdAt desc: Jul > May > Mar > Feb > Jan
      expect(ids(sortSpaces(SPACES, 'newest'))).toEqual(['4', '1', '3', '5', '2']);
    });
  });

  describe('immutability', () => {
    it('does not mutate the original array', () => {
      const original = [...SPACES];
      sortSpaces(SPACES, 'price_asc');
      expect(SPACES).toEqual(original);
    });

    it('does not mutate the original array for any sort option', () => {
      const OPTIONS: SortOption[] = [
        'price_asc', 'price_desc', 'rating_desc',
        'capacity_asc', 'capacity_desc', 'newest',
      ];
      for (const opt of OPTIONS) {
        const snapshot = [...SPACES];
        sortSpaces(SPACES, opt);
        expect(SPACES).toEqual(snapshot);
      }
    });
  });

  describe('empty array', () => {
    const OPTIONS: SortOption[] = [
      'price_asc', 'price_desc', 'rating_desc',
      'capacity_asc', 'capacity_desc', 'newest',
    ];

    it.each(OPTIONS)('returns [] for sort option "%s"', (opt) => {
      expect(sortSpaces([], opt)).toEqual([]);
    });
  });
});
