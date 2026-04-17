'use client';

import type { FilterState } from '@/types';

// ── Internal types ─────────────────────────────────────────────────────────────

type ActiveFilters = Omit<Extract<FilterState, { kind: 'active' }>, 'kind'>;
type FilterKey = keyof ActiveFilters;

// ── Props ─────────────────────────────────────────────────────────────────────

interface ActiveFilterChipsProps {
  filters: FilterState;
  setFilter: <K extends FilterKey>(key: K, value: ActiveFilters[K]) => void;
  clearAllFilters: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

// ── Chip ──────────────────────────────────────────────────────────────────────

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 pl-3 pr-2 py-1 text-xs font-medium text-indigo-700">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-indigo-100 transition-colors"
      >
        <svg
          width="8"
          height="8"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="1" y1="1" x2="9" y2="9" />
          <line x1="9" y1="1" x2="1" y2="9" />
        </svg>
      </button>
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ActiveFilterChips({
  filters,
  setFilter,
  clearAllFilters,
}: ActiveFilterChipsProps) {
  if (filters.kind === 'empty') return null;

  const {
    categories,
    cities,
    priceRange,
    capacityRange,
    amenities,
    minRating,
    searchQuery,
  } = filters;

  const hasAny =
    categories.length > 0 ||
    cities.length > 0 ||
    priceRange !== null ||
    capacityRange !== null ||
    amenities.length > 0 ||
    minRating !== null ||
    searchQuery.trim().length > 0;

  if (!hasAny) return null;

  return (
    <div
      role="region"
      aria-label="Active filters"
      className="flex flex-wrap items-center gap-2 mb-4"
    >
      {/* Category chips */}
      {categories.map((cat) => (
        <Chip
          key={`cat-${cat}`}
          label={cat}
          onRemove={() =>
            setFilter(
              'categories',
              categories.filter((c) => c !== cat),
            )
          }
        />
      ))}

      {/* City chips */}
      {cities.map((city) => (
        <Chip
          key={`city-${city}`}
          label={city}
          onRemove={() =>
            setFilter(
              'cities',
              cities.filter((c) => c !== city),
            )
          }
        />
      ))}

      {/* Price range */}
      {priceRange && (
        <Chip
          label={`${formatPrice(priceRange[0])} – ${formatPrice(priceRange[1])}`}
          onRemove={() => setFilter('priceRange', null)}
        />
      )}

      {/* Capacity range */}
      {capacityRange && (
        <Chip
          label={`${capacityRange[0]}–${capacityRange[1]} people`}
          onRemove={() => setFilter('capacityRange', null)}
        />
      )}

      {/* Amenity chips */}
      {amenities.map((amenity) => (
        <Chip
          key={`amenity-${amenity}`}
          label={amenity}
          onRemove={() =>
            setFilter(
              'amenities',
              amenities.filter((a) => a !== amenity),
            )
          }
        />
      ))}

      {/* Min rating */}
      {minRating !== null && (
        <Chip
          label={`${minRating}★ & up`}
          onRemove={() => setFilter('minRating', null)}
        />
      )}

      {/* Search query */}
      {searchQuery.trim().length > 0 && (
        <Chip
          label={`"${searchQuery.trim()}"`}
          onRemove={() => setFilter('searchQuery', '')}
        />
      )}

      {/* Clear all */}
      <button
        type="button"
        onClick={clearAllFilters}
        className="text-xs font-medium text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors ml-1"
      >
        Clear all
      </button>
    </div>
  );
}
