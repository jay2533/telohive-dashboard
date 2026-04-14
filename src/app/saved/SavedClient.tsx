'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSaved } from '@/hooks/useSaved';
import { useSpaces } from '@/hooks/useSpaces';
import { SpaceCard } from '@/components/discovery/SpaceCard';

// ── Component ─────────────────────────────────────────────────────────────────

export function SavedClient() {
  const { spaces, loading: spacesLoading } = useSpaces();
  const { savedItems, loading: savedLoading, isSaved, toggleSave } = useSaved();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const isLoading = spacesLoading || savedLoading;

  // ── Derive saved spaces ───────────────────────────────────────────────────
  const savedSpaces = useMemo(() => {
    const savedIds = new Set(savedItems.map((item) => String(item.spaceId)));
    return spaces.filter((space) => savedIds.has(space.id));
  }, [spaces, savedItems]);

  // ── Filter option lists (from saved spaces only) ──────────────────────────
  const categories = useMemo(
    () => [...new Set(savedSpaces.map((s) => s.category))].sort(),
    [savedSpaces],
  );
  const cities = useMemo(
    () => [...new Set(savedSpaces.map((s) => s.city))].sort(),
    [savedSpaces],
  );

  // ── Apply local filters ───────────────────────────────────────────────────
  const filteredSpaces = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return savedSpaces.filter((space) => {
      if (
        q &&
        !space.name.toLowerCase().includes(q) &&
        !space.city.toLowerCase().includes(q)
      )
        return false;
      if (categoryFilter && space.category !== categoryFilter) return false;
      if (cityFilter && space.city !== cityFilter) return false;
      return true;
    });
  }, [savedSpaces, searchQuery, categoryFilter, cityFilter]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || categoryFilter !== '' || cityFilter !== '';

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="px-4 sm:px-8 py-8">
        <div className="mb-6">
          <div className="h-8 w-40 rounded-lg bg-gray-200 animate-pulse mb-2" />
          <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="flex gap-3 mb-6">
          <div className="h-9 flex-1 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-9 w-36 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-9 w-36 rounded-lg bg-gray-200 animate-pulse" />
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SpaceCard key={i} isLoading />
          ))}
        </div>
      </div>
    );
  }

  // ── No saved spaces at all ────────────────────────────────────────────────
  if (savedSpaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-5 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-violet-50 flex items-center justify-center">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7c3aed"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            No saved spaces yet
          </h2>
          <p className="text-sm text-gray-500 max-w-xs">
            Browse the discovery page and heart any space to save it here for
            later.
          </p>
        </div>
        <Link
          href="/discovery"
          className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          Browse spaces
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 py-8">
      {/* ── Page heading ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Spaces</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {savedSpaces.length} saved space{savedSpaces.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Search + filters ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search by name or city…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        {/* Category select */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* City select */}
        <div className="relative">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer"
          >
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Result count ─────────────────────────────────────────────────── */}
      <p className="text-sm text-gray-500 mb-4">
        Showing{' '}
        <span className="font-semibold text-gray-800">{filteredSpaces.length}</span>
        {' '}of{' '}
        <span className="font-semibold text-gray-800">{savedSpaces.length}</span>
        {' '}saved spaces
      </p>

      {/* ── Grid or no-results ────────────────────────────────────────────── */}
      {filteredSpaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
          <p className="text-sm text-gray-500">
            No saved spaces match your current filters.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('');
                setCityFilter('');
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSpaces.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              isSaved={isSaved(Number(space.id))}
              onToggleSave={() => void toggleSave(Number(space.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
