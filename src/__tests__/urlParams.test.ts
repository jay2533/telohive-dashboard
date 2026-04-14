import { describe, expect, it } from 'vitest';
import { filterStateToParams, paramsToFilterState } from '@/lib/urlParams';
import type { FilterState } from '@/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Full round-trip: FilterState → URLSearchParams → FilterState */
function roundTrip(state: FilterState): FilterState {
  return paramsToFilterState(filterStateToParams(state));
}

/** Convenience: build params from a plain string, e.g. "cat=coworking&q=sunny" */
function params(qs: string): URLSearchParams {
  return new URLSearchParams(qs);
}

// ── Serialisation tests ───────────────────────────────────────────────────────

describe('filterStateToParams', () => {
  it('produces empty params for the empty state', () => {
    const result = filterStateToParams({ kind: 'empty' });
    expect(result.toString()).toBe('');
  });

  it('encodes categories as repeated "cat" params', () => {
    const result = filterStateToParams({
      kind: 'active',
      categories: ['coworking', 'studio'],
      cities: [],
      priceRange: null,
      capacityRange: null,
      amenities: [],
      minRating: null,
      searchQuery: '',
    });
    expect(result.getAll('cat')).toEqual(['coworking', 'studio']);
  });

  it('encodes cities as repeated "city" params', () => {
    const result = filterStateToParams({
      kind: 'active',
      categories: [],
      cities: ['New York', 'Boston'],
      priceRange: null,
      capacityRange: null,
      amenities: [],
      minRating: null,
      searchQuery: '',
    });
    expect(result.getAll('city')).toEqual(['New York', 'Boston']);
  });

  it('encodes price range as priceMin and priceMax', () => {
    const result = filterStateToParams({
      kind: 'active',
      categories: [],
      cities: [],
      priceRange: [10, 200],
      capacityRange: null,
      amenities: [],
      minRating: null,
      searchQuery: '',
    });
    expect(result.get('priceMin')).toBe('10');
    expect(result.get('priceMax')).toBe('200');
  });

  it('encodes capacity range as capMin and capMax', () => {
    const result = filterStateToParams({
      kind: 'active',
      categories: [],
      cities: [],
      priceRange: null,
      capacityRange: [5, 50],
      amenities: [],
      minRating: null,
      searchQuery: '',
    });
    expect(result.get('capMin')).toBe('5');
    expect(result.get('capMax')).toBe('50');
  });

  it('encodes amenities as repeated "amenity" params', () => {
    const result = filterStateToParams({
      kind: 'active',
      categories: [],
      cities: [],
      priceRange: null,
      capacityRange: null,
      amenities: ['wifi', 'coffee', 'parking'],
      minRating: null,
      searchQuery: '',
    });
    expect(result.getAll('amenity')).toEqual(['wifi', 'coffee', 'parking']);
  });

  it('encodes minRating as "rating"', () => {
    const result = filterStateToParams({
      kind: 'active',
      categories: [],
      cities: [],
      priceRange: null,
      capacityRange: null,
      amenities: [],
      minRating: 4.5,
      searchQuery: '',
    });
    expect(result.get('rating')).toBe('4.5');
  });

  it('encodes searchQuery as "q"', () => {
    const result = filterStateToParams({
      kind: 'active',
      categories: [],
      cities: [],
      priceRange: null,
      capacityRange: null,
      amenities: [],
      minRating: null,
      searchQuery: 'sunny workspace',
    });
    expect(result.get('q')).toBe('sunny workspace');
  });

  it('omits "q" when searchQuery is empty', () => {
    const result = filterStateToParams({
      kind: 'active',
      categories: ['coworking'],
      cities: [],
      priceRange: null,
      capacityRange: null,
      amenities: [],
      minRating: null,
      searchQuery: '',
    });
    expect(result.has('q')).toBe(false);
  });

  it('omits price params when priceRange is null', () => {
    const result = filterStateToParams({
      kind: 'active',
      categories: [],
      cities: ['Austin'],
      priceRange: null,
      capacityRange: null,
      amenities: [],
      minRating: null,
      searchQuery: '',
    });
    expect(result.has('priceMin')).toBe(false);
    expect(result.has('priceMax')).toBe(false);
  });
});

// ── Deserialisation tests ─────────────────────────────────────────────────────

describe('paramsToFilterState', () => {
  it('returns empty state for empty params', () => {
    expect(paramsToFilterState(new URLSearchParams())).toEqual({
      kind: 'empty',
    });
  });

  it('parses categories from "cat" params', () => {
    const state = paramsToFilterState(params('cat=coworking&cat=studio'));
    expect(state).toMatchObject({ kind: 'active', categories: ['coworking', 'studio'] });
  });

  it('parses cities from "city" params', () => {
    const state = paramsToFilterState(params('city=New+York&city=Boston'));
    expect(state).toMatchObject({ kind: 'active', cities: ['New York', 'Boston'] });
  });

  it('reconstructs priceRange as a tuple', () => {
    const state = paramsToFilterState(params('priceMin=10&priceMax=200'));
    expect(state).toMatchObject({ kind: 'active', priceRange: [10, 200] });
  });

  it('keeps priceRange null when only one bound is present', () => {
    // priceMin alone is not a complete range; another param makes it active
    const state = paramsToFilterState(params('priceMin=10&cat=coworking'));
    expect(state).toMatchObject({ kind: 'active', priceRange: null });
  });

  it('returns empty state when only one price bound is present and nothing else', () => {
    // A lone priceMin has no paired max, so no filter is effectively active
    const state = paramsToFilterState(params('priceMin=10'));
    expect(state).toEqual({ kind: 'empty' });
  });

  it('reconstructs capacityRange as a tuple', () => {
    const state = paramsToFilterState(params('capMin=5&capMax=50'));
    expect(state).toMatchObject({ kind: 'active', capacityRange: [5, 50] });
  });

  it('parses amenities from repeated "amenity" params', () => {
    const state = paramsToFilterState(params('amenity=wifi&amenity=parking'));
    expect(state).toMatchObject({ kind: 'active', amenities: ['wifi', 'parking'] });
  });

  it('parses minRating as a number', () => {
    const state = paramsToFilterState(params('rating=4.5'));
    expect(state).toMatchObject({ kind: 'active', minRating: 4.5 });
  });

  it('parses searchQuery from "q"', () => {
    const state = paramsToFilterState(params('q=sunny+workspace'));
    expect(state).toMatchObject({ kind: 'active', searchQuery: 'sunny workspace' });
  });

  it('defaults searchQuery to empty string when "q" is absent', () => {
    const state = paramsToFilterState(params('cat=coworking'));
    expect(state).toMatchObject({ kind: 'active', searchQuery: '' });
  });
});

// ── Round-trip tests ──────────────────────────────────────────────────────────

describe('round-trip (serialize → deserialize → equal)', () => {
  it('empty state is stable', () => {
    expect(roundTrip({ kind: 'empty' })).toEqual({ kind: 'empty' });
  });

  it('single category survives round-trip', () => {
    const state: FilterState = {
      kind: 'active',
      categories: ['coworking'],
      cities: [],
      priceRange: null,
      capacityRange: null,
      amenities: [],
      minRating: null,
      searchQuery: '',
    };
    expect(roundTrip(state)).toEqual(state);
  });

  it('multiple categories + cities survive round-trip', () => {
    const state: FilterState = {
      kind: 'active',
      categories: ['studio', 'meeting-room'],
      cities: ['Boston', 'Austin'],
      priceRange: null,
      capacityRange: null,
      amenities: [],
      minRating: null,
      searchQuery: '',
    };
    expect(roundTrip(state)).toEqual(state);
  });

  it('priceRange survives round-trip', () => {
    const state: FilterState = {
      kind: 'active',
      categories: [],
      cities: [],
      priceRange: [25, 500],
      capacityRange: null,
      amenities: [],
      minRating: null,
      searchQuery: '',
    };
    expect(roundTrip(state)).toEqual(state);
  });

  it('capacityRange survives round-trip', () => {
    const state: FilterState = {
      kind: 'active',
      categories: [],
      cities: [],
      priceRange: null,
      capacityRange: [2, 20],
      amenities: [],
      minRating: null,
      searchQuery: '',
    };
    expect(roundTrip(state)).toEqual(state);
  });

  it('amenities survive round-trip', () => {
    const state: FilterState = {
      kind: 'active',
      categories: [],
      cities: [],
      priceRange: null,
      capacityRange: null,
      amenities: ['wifi', 'coffee', 'parking'],
      minRating: null,
      searchQuery: '',
    };
    expect(roundTrip(state)).toEqual(state);
  });

  it('minRating survives round-trip', () => {
    const state: FilterState = {
      kind: 'active',
      categories: [],
      cities: [],
      priceRange: null,
      capacityRange: null,
      amenities: [],
      minRating: 4.0,
      searchQuery: '',
    };
    expect(roundTrip(state)).toEqual(state);
  });

  it('searchQuery survives round-trip', () => {
    const state: FilterState = {
      kind: 'active',
      categories: [],
      cities: [],
      priceRange: null,
      capacityRange: null,
      amenities: [],
      minRating: null,
      searchQuery: 'bright open-plan',
    };
    expect(roundTrip(state)).toEqual(state);
  });

  it('fully-populated active state survives round-trip', () => {
    const state: FilterState = {
      kind: 'active',
      categories: ['coworking', 'studio'],
      cities: ['New York', 'San Francisco'],
      priceRange: [15, 300],
      capacityRange: [4, 40],
      amenities: ['wifi', 'projector', 'coffee'],
      minRating: 4.2,
      searchQuery: 'modern workspace',
    };
    expect(roundTrip(state)).toEqual(state);
  });

  it('integer and float minRating values are preserved exactly', () => {
    for (const rating of [1, 2.5, 3, 4.5, 5]) {
      const state: FilterState = {
        kind: 'active',
        categories: [],
        cities: [],
        priceRange: null,
        capacityRange: null,
        amenities: [],
        minRating: rating,
        searchQuery: '',
      };
      expect(roundTrip(state)).toEqual(state);
    }
  });

  it('boundary price values [0, 0] survive round-trip', () => {
    const state: FilterState = {
      kind: 'active',
      categories: [],
      cities: [],
      priceRange: [0, 0],
      capacityRange: null,
      amenities: [],
      minRating: null,
      searchQuery: '',
    };
    expect(roundTrip(state)).toEqual(state);
  });

  it('searchQuery with special characters survives round-trip', () => {
    const state: FilterState = {
      kind: 'active',
      categories: [],
      cities: [],
      priceRange: null,
      capacityRange: null,
      amenities: [],
      minRating: null,
      searchQuery: 'café & co-working',
    };
    expect(roundTrip(state)).toEqual(state);
  });
});
