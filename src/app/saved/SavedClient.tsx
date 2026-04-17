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
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="h-7 w-44 rounded-lg bg-gray-200 animate-pulse mb-2" />
          <div className="h-4 w-24 rounded-md bg-gray-200 animate-pulse" />
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="h-10 flex-1 min-w-[200px] rounded-full bg-gray-200 animate-pulse" />
          <div className="h-10 w-36 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-10 w-36 rounded-lg bg-gray-200 animate-pulse" />
        </div>
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4">
        <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center">
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No saved spaces yet
          </h2>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            Browse spaces and save the ones you like. They'll appear here.
          </p>
        </div>
        <Link
          href="/discovery"
          className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 shadow-sm"
        >
          Browse spaces
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* ── Page heading ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Saved Spaces</h1>
        <p className="text-sm text-gray-500 mt-1">
          {savedSpaces.length} saved space{savedSpaces.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Search + filters ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search — rounded-full */}
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
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
            className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          />
        </div>

        {/* Category select */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3.5 pr-8 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* City select */}
        <div className="relative">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3.5 pr-8 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
          >
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Result count ─────────────────────────────────────────────────── */}
      <p className="text-sm text-gray-500 mb-5">
        Showing{' '}
        <span className="text-gray-700">{filteredSpaces.length}</span>
        {' '}of{' '}
        <span className="text-gray-700">{savedSpaces.length}</span>
        {' '}saved
      </p>

      {/* ── Grid or no-results ────────────────────────────────────────────── */}
      {filteredSpaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">No spaces found</p>
            <p className="text-xs text-gray-400">Try adjusting your search or filters.</p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('');
                setCityFilter('');
              }}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
