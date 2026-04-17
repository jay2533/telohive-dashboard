'use client';

import { useMemo, useState, type ReactNode } from 'react';
import type { FilterState, Space } from '@/types';

// ── Internal types ────────────────────────────────────────────────────────────

type ActiveFilters = Omit<Extract<FilterState, { kind: 'active' }>, 'kind'>;
type FilterKey = keyof ActiveFilters;

// ── Props ─────────────────────────────────────────────────────────────────────

interface FilterPanelProps {
  allSpaces: Space[];
  filters: FilterState;
  setFilter: <K extends FilterKey>(key: K, value: ActiveFilters[K]) => void;
  clearAllFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

// ── Collapsible section ───────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-3.5 transition-colors group"
      >
        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors">
          {title}
        </span>
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

// ── Chip toggle ───────────────────────────────────────────────────────────────

function ChipToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition-all duration-150 ${
        active
          ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-800'
      }`}
    >
      {label}
    </button>
  );
}

// ── Price range slider ────────────────────────────────────────────────────────

function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: [number, number] | null;
  onChange: (v: [number, number] | null) => void;
}) {
  const [low, high] = value ?? [min, max];
  const range = max - min || 1;

  const lowPct = ((low - min) / range) * 100;
  const highPct = ((high - min) / range) * 100;

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-4">
      {/* Track */}
      <div className="relative h-1.5 bg-gray-150 rounded-full mx-1 mt-3" style={{ background: '#e5e7eb' }}>
        <div
          className="absolute h-1.5 bg-indigo-500 rounded-full"
          style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
          aria-hidden="true"
        />
      </div>

      {/* Min slider */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-400 uppercase tracking-wide text-[10px] font-semibold">Min</span>
          <span className="font-semibold text-gray-700">{fmt(low)}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={low}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), high - 1);
            const next: [number, number] = [v, high];
            onChange(v === min && high === max ? null : next);
          }}
          className="w-full h-1 accent-indigo-600 cursor-pointer"
          aria-label={`Minimum price: ${fmt(low)}`}
        />
      </div>

      {/* Max slider */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-400 uppercase tracking-wide text-[10px] font-semibold">Max</span>
          <span className="font-semibold text-gray-700">{fmt(high)}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={high}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), low + 1);
            const next: [number, number] = [low, v];
            onChange(low === min && v === max ? null : next);
          }}
          className="w-full h-1 accent-indigo-600 cursor-pointer"
          aria-label={`Maximum price: ${fmt(high)}`}
        />
      </div>
    </div>
  );
}

// ── Star rating selector ──────────────────────────────────────────────────────

function StarRatingSelector({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5" role="group" aria-label="Minimum star rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(value === star ? null : star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            aria-label={`${star} star${star > 1 ? 's' : ''} and up`}
            aria-pressed={value !== null && star <= value}
            className="text-3xl leading-none transition-transform hover:scale-110 focus:outline-none"
          >
            <span className={display !== null && star <= display ? 'text-amber-400' : 'text-gray-200'}>
              ★
            </span>
          </button>
        ))}
      </div>
      {value !== null && (
        <p className="text-xs text-gray-500">{value}★ and above</p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function FilterPanel({
  allSpaces,
  filters,
  setFilter,
  clearAllFilters,
  isOpen,
  onClose,
}: FilterPanelProps) {
  // ── Derive options from live data ─────────────────────────────────────────

  const categories = useMemo(
    () => [...new Set(allSpaces.map((s) => s.category))].sort(),
    [allSpaces],
  );

  const cities = useMemo(
    () => [...new Set(allSpaces.map((s) => s.city))].sort(),
    [allSpaces],
  );

  const amenities = useMemo(
    () => [...new Set(allSpaces.flatMap((s) => s.amenities))].sort(),
    [allSpaces],
  );

  const priceStats = useMemo(() => {
    if (allSpaces.length === 0) return { min: 0, max: 10000 };
    const prices = allSpaces.map((s) => s.pricePerHour);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [allSpaces]);

  // ── Current filter values ─────────────────────────────────────────────────

  const active = filters.kind === 'active' ? filters : null;
  const selCategories = active?.categories ?? [];
  const selCities = active?.cities ?? [];
  const selAmenities = active?.amenities ?? [];
  const priceRange = active?.priceRange ?? null;
  const capacityRange = active?.capacityRange ?? null;
  const minRating = active?.minRating ?? null;

  // ── Toggle helpers ────────────────────────────────────────────────────────

  function toggleCategory(cat: string) {
    const next = selCategories.includes(cat)
      ? selCategories.filter((c) => c !== cat)
      : [...selCategories, cat];
    setFilter('categories', next);
  }

  function toggleCity(city: string) {
    const next = selCities.includes(city)
      ? selCities.filter((c) => c !== city)
      : [...selCities, city];
    setFilter('cities', next);
  }

  function toggleAmenity(amenity: string) {
    const next = selAmenities.includes(amenity)
      ? selAmenities.filter((a) => a !== amenity)
      : [...selAmenities, amenity];
    setFilter('amenities', next);
  }

  // ── Capacity input helpers ────────────────────────────────────────────────

  const [capMin, capMax] = capacityRange ?? [undefined, undefined];

  function handleCapMin(raw: string) {
    const v = raw === '' ? undefined : Number(raw);
    if (v === undefined && capMax === undefined) {
      setFilter('capacityRange', null);
    } else {
      setFilter('capacityRange', [v ?? 0, capMax ?? 9999] as [number, number]);
    }
  }

  function handleCapMax(raw: string) {
    const v = raw === '' ? undefined : Number(raw);
    if (capMin === undefined && v === undefined) {
      setFilter('capacityRange', null);
    } else {
      setFilter('capacityRange', [capMin ?? 0, v ?? 9999] as [number, number]);
    }
  }

  // ── Panel body ────────────────────────────────────────────────────────────

  const panelBody = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
          aria-label="Close filters"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="1" y1="1" x2="13" y2="13" />
            <line x1="13" y1="1" x2="1" y2="13" />
          </svg>
        </button>
      </div>

      {/* Scrollable sections */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <CollapsibleSection title="Category">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <ChipToggle
                key={cat}
                label={cat}
                active={selCategories.includes(cat)}
                onClick={() => toggleCategory(cat)}
              />
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="City">
          <div className="max-h-44 overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-1.5">
              {cities.map((city) => (
                <ChipToggle
                  key={city}
                  label={city}
                  active={selCities.includes(city)}
                  onClick={() => toggleCity(city)}
                />
              ))}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Price per day">
          <PriceRangeSlider
            min={priceStats.min}
            max={priceStats.max}
            value={priceRange}
            onChange={(v) => setFilter('priceRange', v)}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Capacity (people)" defaultOpen={false}>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label htmlFor="cap-min" className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">
                Min
              </label>
              <input
                id="cap-min"
                type="number"
                min={0}
                value={capMin ?? ''}
                onChange={(e) => handleCapMin(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
            </div>
            <span className="text-gray-300 mt-5 shrink-0 text-lg">—</span>
            <div className="flex-1">
              <label htmlFor="cap-max" className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">
                Max
              </label>
              <input
                id="cap-max"
                type="number"
                min={0}
                value={capMax ?? ''}
                onChange={(e) => handleCapMax(e.target.value)}
                placeholder="∞"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Amenities" defaultOpen={false}>
          <div className="max-h-44 overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-1.5">
              {amenities.map((amenity) => (
                <ChipToggle
                  key={amenity}
                  label={amenity}
                  active={selAmenities.includes(amenity)}
                  onClick={() => toggleAmenity(amenity)}
                />
              ))}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Minimum rating" defaultOpen={false}>
          <StarRatingSelector
            value={minRating}
            onChange={(v) => setFilter('minRating', v)}
          />
        </CollapsibleSection>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <button
          type="button"
          onClick={clearAllFilters}
          className="w-full rounded-lg border border-gray-200 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 sticky top-0 h-screen bg-white border-r border-gray-100 shadow-sm overflow-hidden">
        {panelBody}
      </aside>

      {/* Mobile: overlay drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-white shadow-2xl lg:hidden">
            {panelBody}
          </aside>
        </>
      )}
    </>
  );
}
