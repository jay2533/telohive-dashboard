import type { FilterState } from '@/types';

// ── URL param key constants ───────────────────────────────────────────────────

const P = {
  SEARCH: 'q',
  CATEGORY: 'cat',
  CITY: 'city',
  PRICE_MIN: 'priceMin',
  PRICE_MAX: 'priceMax',
  CAP_MIN: 'capMin',
  CAP_MAX: 'capMax',
  AMENITY: 'amenity',
  RATING: 'rating',
  SORT: 'sort',
} as const;

// ── Serialise → URLSearchParams ───────────────────────────────────────────────

/**
 * Converts a `FilterState` into a `URLSearchParams` object.
 * An `{ kind: 'empty' }` state produces empty params.
 */
export function filterStateToParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.kind === 'empty') return params;

  const {
    categories,
    cities,
    priceRange,
    capacityRange,
    amenities,
    minRating,
    searchQuery,
  } = filters;

  for (const c of categories) params.append(P.CATEGORY, c);
  for (const c of cities) params.append(P.CITY, c);
  for (const a of amenities) params.append(P.AMENITY, a);

  if (priceRange !== null) {
    params.set(P.PRICE_MIN, String(priceRange[0]));
    params.set(P.PRICE_MAX, String(priceRange[1]));
  }

  if (capacityRange !== null) {
    params.set(P.CAP_MIN, String(capacityRange[0]));
    params.set(P.CAP_MAX, String(capacityRange[1]));
  }

  if (minRating !== null) params.set(P.RATING, String(minRating));
  if (searchQuery.length > 0) params.set(P.SEARCH, searchQuery);

  return params;
}

// ── Deserialise ← URLSearchParams ────────────────────────────────────────────

/**
 * Reconstructs a `FilterState` from `URLSearchParams`.
 * Returns `{ kind: 'empty' }` when no recognised params are present.
 */
export function paramsToFilterState(params: URLSearchParams): FilterState {
  const categories = params.getAll(P.CATEGORY);
  const cities = params.getAll(P.CITY);
  const amenities = params.getAll(P.AMENITY);

  const priceMinRaw = params.get(P.PRICE_MIN);
  const priceMaxRaw = params.get(P.PRICE_MAX);
  const capMinRaw = params.get(P.CAP_MIN);
  const capMaxRaw = params.get(P.CAP_MAX);
  const ratingRaw = params.get(P.RATING);
  const searchQuery = params.get(P.SEARCH) ?? '';

  const priceMin = priceMinRaw !== null ? Number(priceMinRaw) : null;
  const priceMax = priceMaxRaw !== null ? Number(priceMaxRaw) : null;
  const capMin = capMinRaw !== null ? Number(capMinRaw) : null;
  const capMax = capMaxRaw !== null ? Number(capMaxRaw) : null;
  const minRating = ratingRaw !== null ? Number(ratingRaw) : null;

  const priceRange: [number, number] | null =
    priceMin !== null && priceMax !== null ? [priceMin, priceMax] : null;

  const capacityRange: [number, number] | null =
    capMin !== null && capMax !== null ? [capMin, capMax] : null;

  const hasAny =
    categories.length > 0 ||
    cities.length > 0 ||
    amenities.length > 0 ||
    priceRange !== null ||
    capacityRange !== null ||
    minRating !== null ||
    searchQuery.length > 0;

  if (!hasAny) return { kind: 'empty' };

  return {
    kind: 'active',
    categories,
    cities,
    priceRange,
    capacityRange,
    amenities,
    minRating,
    searchQuery,
  };
}
